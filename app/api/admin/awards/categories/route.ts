import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';

// POST /api/admin/awards/categories
// Body: {
//   group_id: string,
//   slug: string,
//   title: string,
//   description: string,
//   icon_svg?: string,
//   tags?: string[],
//   sort_order?: number,
//   add_to_year?: number       ← optional: auto-add ke tahun tsb setelah create
// }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    group_id,
    slug,
    title,
    description,
    icon_svg,
    tags,
    sort_order,
    add_to_year,
  } = body as {
    group_id?: string;
    slug?: string;
    title?: string;
    description?: string;
    icon_svg?: string;
    tags?: string[];
    sort_order?: number;
    add_to_year?: number;
  };

  if (!group_id || !slug || !title || !description) {
    return NextResponse.json(
      { error: 'group_id, slug, title, description are required' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Resolve sort_order kalau ga di-supply: max(sort_order) + 1 di grup tsb
  let resolvedSort = sort_order;
  if (resolvedSort === undefined || resolvedSort === null) {
    const { data: maxRow } = await supabase
      .from('award_categories')
      .select('sort_order')
      .eq('group_id', group_id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    resolvedSort = (maxRow?.sort_order ?? 0) + 1;
  }

  const { data: cat, error: catErr } = await supabase
    .from('award_categories')
    .insert({
      group_id,
      slug,
      title,
      description,
      icon_svg: icon_svg ?? null,
      tags: tags ?? null,
      sort_order: resolvedSort,
    })
    .select()
    .single();

  if (catErr) {
    console.error('[admin/awards/categories POST] error:', catErr);
    if (catErr.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: catErr.message }, { status: 500 });
  }

  // Optional: auto-add ke tahun tsb
  let winner = null;
  if (add_to_year && !isNaN(add_to_year)) {
    const { data: w, error: wErr } = await supabase
      .from('award_winners')
      .insert({ category_id: cat.uuid, year: add_to_year, broker_uuid: null })
      .select()
      .single();
    if (wErr) {
      console.error('[admin/awards/categories POST] add_to_year error:', wErr);
      // Ga rollback — kategori master tetep kebuat, cuma ga ke-add ke tahun.
      // User bisa add manual lewat modal.
    } else {
      winner = w;
    }
  }

  return NextResponse.json({ category: cat, winner }, { status: 201 });
}
