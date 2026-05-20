import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

const BUCKET = 'broker-logos';

/**
 * Best-effort cleanup endpoint khusus untuk navigator.sendBeacon().
 * sendBeacon hanya support POST, jadi DELETE biasa ga bisa dipakai.
 * 
 * Dipanggil saat user close tab / refresh page dengan upload yang belum saved.
 * Success rate ~90%, ga guarantee — sebagai safety net selain confirm dialog Cancel.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let url: string | undefined;
  try {
    const body = await req.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: 'No url provided' }, { status: 400 });
  }

  const supabase = createClient();
  try {
    const u = new URL(url);
    const pathMatch = u.pathname.match(/\/storage\/v1\/object\/public\/broker-logos\/(.+)$/);
    if (pathMatch?.[1]) {
      await supabase.storage.from(BUCKET).remove([pathMatch[1]]);
    }
  } catch {
    // ignore — best-effort
  }

  return NextResponse.json({ ok: true });
}
