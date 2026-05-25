import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogPostsForPage,
  getBlogPostsByCategorySlug,
} from '@/lib/blog/queries';

const PAGE_SLUG = 'blog';
const BATCH_SIZE = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const category = searchParams.get('category');

    const validOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

    const posts = category && category !== 'all'
      ? await getBlogPostsByCategorySlug(category, PAGE_SLUG, BATCH_SIZE, validOffset)
      : await getBlogPostsForPage(PAGE_SLUG, BATCH_SIZE, validOffset);

    return NextResponse.json({ posts });
  } catch (e) {
    console.error('load-more API error:', e);
    return NextResponse.json({ posts: [], error: 'Failed to load' }, { status: 500 });
  }
}
