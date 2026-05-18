import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

export const dynamic = 'force-dynamic';

// In-memory rate limit: max 60 votes/min per IP
// Untuk production scale, ganti pakai Upstash Redis (env var REDIS_URL)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const { broker_uuid, voter_id } = await req.json();

    if (!broker_uuid || !voter_id) {
      return NextResponse.json({ error: 'Missing broker_uuid or voter_id' }, { status: 400 });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const supabase = createClient();
    const { error } = await supabase.from('broker_votes').insert({
      broker_uuid,
      voter_id,
      ip_address: ip === 'unknown' ? null : ip,
    });

    // Conflict (PK duplicate) = silent skip, treat as success
    if (error && error.code !== '23505') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
