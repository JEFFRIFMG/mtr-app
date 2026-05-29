import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// GET /api/admin/awards/groups
// List semua group master (untuk dropdown di modal).
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('award_groups')
    .select('uuid, slug, name, icon_svg, sort_order')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[admin/awards/groups GET] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ groups: data ?? [] });
}

// POST /api/admin/awards/groups
// Body: { slug, name, icon_svg?, sort_order? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, name, icon_svg, sort_order } = body as {
    slug?: string;
    name?: string;
    icon_svg?: string;
    sort_order?: number;
  };

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  const supabase = createClient();

  let resolvedSort = sort_order;
  if (resolvedSort === undefined || resolvedSort === null) {
    const { data: maxRow } = await supabase
      .from('award_groups')
      .select('sort_order')
      .is('deleted_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    resolvedSort = (maxRow?.sort_order ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from('award_groups')
    .insert({
      slug,
      name,
      icon_svg: icon_svg ?? null,
      sort_order: resolvedSort,
    })
    .select()
    .single();

  if (error) {
    console.error('[admin/awards/groups POST] error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ group: data }, { status: 201 });
}
