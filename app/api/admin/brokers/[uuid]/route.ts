import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

// Fields yang TIDAK boleh di-update manual (generated/computed/auto-managed)
const READONLY_FIELDS = [
  'total_votes',    // GENERATED ALWAYS AS (real_votes + boost_total) STORED
  'real_votes',     // di-update via trigger dari broker_votes
  'boost_total',    // di-update via trigger dari vote_boosts
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  const body = await req.json();
  const clean = stripReadonly(body);

  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .update(clean)
    .eq('uuid', uuid)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ broker: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  const supabase = createClient();

  // Soft delete
  const { error } = await supabase
    .from('brokers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('uuid', uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
