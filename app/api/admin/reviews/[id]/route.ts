import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

// PATCH: approve/reject/update review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status, rating, review_text, guest_name } = body;

    const supabase = createClient();
    const updateData: Record<string, unknown> = {};

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = adminUser.user.id;
      }
    }

    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
      }
      updateData.rating = rating;
    }

    if (review_text !== undefined) updateData.review_text = String(review_text).trim();
    if (guest_name !== undefined) updateData.guest_name = String(guest_name).trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('broker_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin review update error:', error.message);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error('Admin reviews PATCH error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// DELETE: hapus review
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const supabase = createClient();
    const { error } = await supabase.from('broker_reviews').delete().eq('id', id);

    if (error) {
      console.error('Admin review delete error:', error.message);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reviews DELETE error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}