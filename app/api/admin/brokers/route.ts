import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

// Fields yang TIDAK boleh di-set manual saat create (generated/computed/auto-managed)
const READONLY_FIELDS = [
  'total_votes',    // GENERATED column
  'real_votes',     // trigger-managed
  'boost_total',    // trigger-managed
  'created_at',
  'updated_at',
  'uuid',
];

function stripReadonly(body: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(body)) {
    if (!READONLY_FIELDS.includes(key)) {
      clean[key] = body[key];
    }
  }
  return clean;
}

function slugify(str: string): string {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = createClient();

  // Auto slug + handle collision
  const baseSlug = slugify(body.name);
  let slug = baseSlug;
  let n = 1;
  while (true) {
    const { data } = await supabase.from('brokers').select('uuid').eq('slug', slug).maybeSingle();
    if (!data) break;
    slug = `${baseSlug}-${++n}`;
  }

  const payload = {
    ...stripReadonly(body),
    slug,
    domain: extractDomain(body.website),
  };

  const { data, error } = await supabase.from('brokers').insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ broker: data });
}
