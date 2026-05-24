import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET: list reviews dengan filter
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending | approved | rejected | null (all)
    const source = searchParams.get('source'); // visitor | admin | null (all)
    const brokerUuid = searchParams.get('broker_uuid');

    const supabase = createClient();
    let query = supabase
      .from('broker_reviews')
      .select('*, brokers!inner(name, slug)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (brokerUuid) query = query.eq('broker_uuid', brokerUuid);

    const { data, error } = await query;

    if (error) {
      console.error('Admin reviews fetch error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    return NextResponse.json({ reviews: data });
  } catch (error) {
    console.error('Admin reviews GET error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST: admin nambah review manual (boost)
export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { broker_uuid, rating, review_text, guest_name, guest_email, created_at } = body;

    if (!broker_uuid || !rating || !review_text || !guest_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const supabase = createClient();
    const now = new Date().toISOString();

    const insertData: Record<string, unknown> = {
      broker_uuid,
      rating,
      review_text: review_text.trim(),
      guest_name: guest_name.trim(),
      guest_email: guest_email?.trim() || null,
      status: 'approved',
      source: 'admin',
      approved_at: now,
      approved_by: adminUser.user.id,
    };

    // Kalau admin set custom created_at (buat backdate review)
    if (created_at) {
      insertData.created_at = created_at;
    }

    const { data, error } = await supabase
      .from('broker_reviews')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Admin review insert error:', error.message);
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error('Admin reviews POST error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}