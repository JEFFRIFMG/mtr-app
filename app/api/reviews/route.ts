import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { broker_uuid, rating, review_text, guest_name, guest_email } = body;

    // Validation
    if (!broker_uuid || !rating || !review_text || !guest_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (typeof review_text !== 'string' || review_text.trim().length < 3) {
      return NextResponse.json(
        { error: 'Review text too short' },
        { status: 400 }
      );
    }

    if (typeof guest_name !== 'string' || guest_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name too short' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('broker_reviews')
      .insert({
        broker_uuid,
        rating,
        review_text: review_text.trim(),
        guest_name: guest_name.trim(),
        guest_email: guest_email?.trim() || null,
        status: 'pending',
        source: 'visitor',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending approval.',
      id: data.id,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}