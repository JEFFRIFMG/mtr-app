import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY!,
  apiSecret: process.env.MAILJET_API_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Mailjet Contact List ID — TODO: minta dari Ardian, ganti di sini
const MAILJET_LIST_ID = process.env.MAILJET_LIST_ID || '';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validasi
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Insert ke Supabase (UPSERT — kalau email udah ada, skip)
    const { error: dbError } = await supabase
      .from('subscribers')
      .upsert(
        { email: normalizedEmail, status: 'active' },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (dbError) throw new Error(`DB Error: ${dbError.message}`);

    // 2. Push ke Mailjet Contact List (kalau LIST_ID di-set)
    if (MAILJET_LIST_ID) {
      try {
        await mailjet
          .post('contactslist', { version: 'v3' })
          .id(MAILJET_LIST_ID)
          .action('managecontact')
          .request({
            Email: normalizedEmail,
            Action: 'addnoforce',
          });
      } catch (mjErr: any) {
        // Mailjet error ga blocking — data udah masuk Supabase
        console.error('Mailjet subscribe error:', mjErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch (error: any) {
    console.error('API /subscribe error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
