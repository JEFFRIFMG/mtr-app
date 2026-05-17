import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

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

  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .update(body)
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
