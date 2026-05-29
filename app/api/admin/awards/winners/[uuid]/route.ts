import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// PATCH /api/admin/awards/winners/[uuid]
// Body: { broker_uuid: string | null }
// - broker_uuid string → assign winner
// - broker_uuid null → clear winner (kembali ke "Winner TBA")
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const body = await req.json();
  const { broker_uuid } = body as { broker_uuid: string | null };

  // broker_uuid undefined → invalid (harus eksplisit null kalau mau clear)
  if (broker_uuid === undefined) {
    return NextResponse.json(
      { error: 'broker_uuid is required (use null to clear)' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  const updatePayload: Record<string, unknown> = {
    broker_uuid: broker_uuid,
    announced_at: broker_uuid ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('award_winners')
    .update(updatePayload)
    .eq('uuid', uuid)
    .select()
    .single();

  if (error) {
    console.error('[admin/awards/winners PATCH] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ winner: data });
}

// DELETE /api/admin/awards/winners/[uuid]
// Hard delete: remove kategori dari tahun tsb.
// Data tahun lain (year≠X) ga kesentuh karena filter uuid spesifik.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const supabase = createClient();

  const { error } = await supabase.from('award_winners').delete().eq('uuid', uuid);

  if (error) {
    console.error('[admin/awards/winners DELETE] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
