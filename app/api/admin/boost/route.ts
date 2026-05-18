import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broker_uuid, amount, note } = await req.json();

  if (!broker_uuid || typeof amount !== 'number') {
    return NextResponse.json(
      { error: 'broker_uuid and numeric amount required' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('vote_boosts')
    .insert({
      broker_uuid,
      amount,
      edited_by: session.user.id,
      edited_email: session.user.email,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ boost: data });
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brokerUuid = searchParams.get('broker_uuid');

  const supabase = createClient();
  let query = supabase
    .from('vote_boosts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (brokerUuid) query = query.eq('broker_uuid', brokerUuid);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ boosts: data });
}
