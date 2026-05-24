import { client } from '@/sanity/client';
import type { BlogPostListItem, BlogPostDetail } from '@/types/blogPost';
import type { BlogCategory, BlogCategoryGroup } from '@/types/blogCategory';

// === Shared projection ===
const LIST_PROJECTION = `
  _id,
  title,
  slug,
  excerpt,
  "featuredImageUrl": featuredImage.asset->url,
  "featuredImageAlt": featuredImage.alt,
  "author": author->{
    _id, name, slug,
    "avatarUrl": avatar.asset->url
  },
  "categories": categories[]->{ _id, name, slug },
  publishedAt,
  "updatedAt": _updatedAt,
  status
`;

const DETAIL_PROJECTION = `
  _id,
  title,
  slug,
  excerpt,
  htmlContent,
  "featuredImageUrl": featuredImage.asset->url,
  "featuredImageAlt": featuredImage.alt,
  "author": author->{
    _id, name, slug, role, bio,
    "avatarUrl": avatar.asset->url,
    "avatarAlt": avatar.alt,
    socialLinks
  },
  "categories": categories[]->{ _id, name, slug },
  "tags": tags[]->{ _id, name, slug },
  publishedAt,
  "updatedAt": _updatedAt,
  status,
  commentsEnabled,
  seoTitle,
  seoDescription,
  "ogImageUrl": ogImage.asset->url,
  schemaType,
  noIndex,
  excludedFromPages
`;

/**
 * Page-aware exclusion filter.
 * Excludes post if:
 *   1. pageSlug in post.excludedFromPages, OR
 *   2. ALL categories of post have pageSlug in their excludedFromPages
 *      (post is visible if ANY category does NOT exclude this page)
 */
const pageFilter = (pageSlug?: string) => {
  if (!pageSlug) return '';
  return `&& !($pageSlug in coalesce(excludedFromPages, []))
          && count(categories[]->[!($pageSlug in coalesce(excludedFromPages, []))]) > 0`;
};

// === Detail page ===
export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const post = await client.fetch<BlogPostDetail | null>(
      `*[_type == "blogPost" && slug.current == $slug && status == "published"][0]{
        ${DETAIL_PROJECTION}
      }`,
      { slug },
      { cache: 'no-store' }
    );
    return post;
  } catch (e) {
    console.error('getBlogPostBySlug error:', e);
    return null;
  }
}

// === All slugs ===
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const slugs = await client.fetch<string[]>(
      `*[_type == "blogPost" && status == "published" && defined(slug.current)].slug.current`,
      {},
      { cache: 'no-store' }
    );
    return slugs || [];
  } catch (e) {
    console.error('getAllBlogSlugs error:', e);
    return [];
  }
}

// === Posts for a specific page ===
export async function getBlogPostsForPage(
  pageSlug: string,
  limit?: number
): Promise<BlogPostListItem[]> {
  try {
    const limitClause = limit ? `[0...$limit]` : '';
    const params: Record<string, unknown> = { pageSlug };
    if (limit) params.limit = limit;

    const posts = await client.fetch<BlogPostListItem[]>(
      `*[_type == "blogPost" && status == "published" ${pageFilter(pageSlug)}]
        | order(publishedAt desc)${limitClause}{
          ${LIST_PROJECTION}
        }`,
      params,
      { cache: 'no-store' }
    );
    return posts || [];
  } catch (e) {
    console.error('getBlogPostsForPage error:', e);
    return [];
  }
}

/**
 * Resolve a category slug to a list of category IDs that match:
 * - The category itself (if exists)
 * - All children whose parent.slug.current === this slug
 *
 * Returns [] if no match found.
 */
async function resolveCategoryIds(categorySlug: string): Promise<string[]> {
  try {
    const ids = await client.fetch<string[]>(
      `*[_type == "blogCategory" && (
        slug.current == $categorySlug ||
        parent->slug.current == $categorySlug
      )]._id`,
      { categorySlug },
      { cache: 'no-store' }
    );
    return ids || [];
  } catch (e) {
    console.error('resolveCategoryIds error:', e);
    return [];
  }
}

// === Posts by category slug (parent-aware, 2-step) ===
export async function getBlogPostsByCategorySlug(
  categorySlug: string,
  pageSlug?: string,
  limit?: number
): Promise<BlogPostListItem[]> {
  try {
    // Step 1: resolve category slug to list of IDs (self + children if parent)
    const categoryIds = await resolveCategoryIds(categorySlug);
    if (categoryIds.length === 0) return [];

    // Step 2: fetch posts whose categories intersect with these IDs
    const limitClause = limit ? `[0...$limit]` : '';
    const params: Record<string, unknown> = { categoryIds };
    if (pageSlug) params.pageSlug = pageSlug;
    if (limit) params.limit = limit;

    const posts = await client.fetch<BlogPostListItem[]>(
      `*[_type == "blogPost" && status == "published"
        ${pageFilter(pageSlug)}
        && count((categories[]._ref)[@ in $categoryIds]) > 0]
        | order(publishedAt desc)${limitClause}{
          ${LIST_PROJECTION}
        }`,
      params,
      { cache: 'no-store' }
    );
    return posts || [];
  } catch (e) {
    console.error('getBlogPostsByCategorySlug error:', e);
    return [];
  }
}

// === Related posts ===
export async function getRelatedBlogPosts(
  postId: string,
  tagIds: string[] | null,
  categoryIds: string[] | null,
  limit = 2
): Promise<BlogPostListItem[]> {
  try {
    if (tagIds && tagIds.length > 0) {
      const byTag = await client.fetch<BlogPostListItem[]>(
        `*[_type == "blogPost" && status == "published"
          && _id != $postId
          && count((tags[]._ref)[@ in $tagIds]) > 0]
          | order(publishedAt desc)[0...$limit]{
            ${LIST_PROJECTION}
          }`,
        { postId, tagIds, limit },
        { cache: 'no-store' }
      );
      if (byTag && byTag.length >= limit) return byTag;
    }

    if (categoryIds && categoryIds.length > 0) {
      const byCategory = await client.fetch<BlogPostListItem[]>(
        `*[_type == "blogPost" && status == "published"
          && _id != $postId
          && count((categories[]._ref)[@ in $categoryIds]) > 0]
          | order(publishedAt desc)[0...$limit]{
            ${LIST_PROJECTION}
          }`,
        { postId, categoryIds, limit },
        { cache: 'no-store' }
      );
      if (byCategory && byCategory.length >= limit) return byCategory;
    }

    const fallback = await client.fetch<BlogPostListItem[]>(
      `*[_type == "blogPost" && status == "published" && _id != $postId]
        | order(publishedAt desc)[0...$limit]{
          ${LIST_PROJECTION}
        }`,
      { postId, limit },
      { cache: 'no-store' }
    );
    return fallback || [];
  } catch (e) {
    console.error('getRelatedBlogPosts error:', e);
    return [];
  }
}

// === All categories ===
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  try {
    const categories = await client.fetch<BlogCategory[]>(
      `*[_type == "blogCategory"] | order(order asc, name asc){
        _id, name, slug, description, order,
        excludedFromPages,
        "parent": parent->{ _id, name, slug }
      }`,
      {},
      { cache: 'no-store' }
    );
    return categories || [];
  } catch (e) {
    console.error('getAllBlogCategories error:', e);
    return [];
  }
}

// === Category groups for filter tabs (page-aware) ===
export async function getBlogCategoryGroups(pageSlug?: string): Promise<BlogCategoryGroup[]> {
  const all = await getAllBlogCategories();

  const visible = pageSlug
    ? all.filter((c) => !(c.excludedFromPages || []).includes(pageSlug))
    : all;

  const mains = visible.filter((c) => !c.parent);
  return mains.map((main) => ({
    main,
    children: visible.filter((c) => c.parent?._id === main._id),
  }));
}

// === Total count ===
export async function getBlogPostsCount(pageSlug?: string): Promise<number> {
  try {
    const params: Record<string, unknown> = {};
    if (pageSlug) params.pageSlug = pageSlug;

    const count = await client.fetch<number>(
      `count(*[_type == "blogPost" && status == "published" ${pageFilter(pageSlug)}])`,
      params,
      { cache: 'no-store' }
    );
    return count || 0;
  } catch (e) {
    console.error('getBlogPostsCount error:', e);
    return 0;
  }
}
