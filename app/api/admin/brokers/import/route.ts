import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireOwner } from '@/lib/admin/auth';
import { parseCsv } from '@/lib/admin/csvParser';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: 'Forbidden — only owner can import' }, { status: 403 });
  }

  const { csv } = await req.json();
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'CSV content missing' }, { status: 400 });
  }

  const { rows, skipped, unknownCols } = parseCsv(csv);

  if (rows.length === 0) {
    return NextResponse.json({
      total: 0,
      inserted: 0,
      failed: 0,
      skipped,
      unknownCols,
      errors: [],
    });
  }

  const supabase = createClient();
  let inserted = 0;
  let failed = 0;
  const errors: Array<{ name: string; error: string }> = [];

  // Batch insert 100 sekaligus; fallback per-row kalau batch gagal
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { data, error } = await supabase.from('brokers').insert(chunk).select('uuid');
    if (error) {
      // Retry per-row
      for (const row of chunk) {
        const { error: e2 } = await supabase.from('brokers').insert(row);
        if (e2) {
          failed++;
          errors.push({ name: row.name, error: e2.message });
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || 0;
    }
  }

  return NextResponse.json({
    total: rows.length,
    inserted,
    failed,
    skipped,
    unknownCols,
    errors,
  });
}
