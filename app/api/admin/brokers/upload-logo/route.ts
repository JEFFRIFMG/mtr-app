import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const BUCKET = 'broker-logos';

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const oldUrl = formData.get('old_url') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format file tidak didukung. Pakai PNG, JPG, WEBP, atau SVG.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File terlalu besar (max 2MB)' }, { status: 400 });
  }

  const supabase = createClient();

  // Delete file lama kalau ada (mencegah orphan)
  if (oldUrl) {
    try {
      const u = new URL(oldUrl);
      const pathMatch = u.pathname.match(/\/storage\/v1\/object\/public\/broker-logos\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage.from(BUCKET).remove([pathMatch[1]]);
      }
    } catch {
      // ignore
    }
  }

  const ext = extFromMime(file.type);
  const filename = `${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'No url provided' }, { status: 400 });
  }

  const supabase = createClient();
  try {
    const u = new URL(url);
    const pathMatch = u.pathname.match(/\/storage\/v1\/object\/public\/broker-logos\/(.+)$/);
    if (pathMatch?.[1]) {
      const { error } = await supabase.storage.from(BUCKET).remove([pathMatch[1]]);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid url' },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
