/**
 * List of pages that display blog posts.
 * Webdev maintains this list. Editor tidak menyentuh.
 *
 * Cara nambah page baru:
 * 1. Tambah entry di BLOG_PAGES (slug + label).
 * 2. Bikin page Next.js-nya, panggil getBlogPostsForPage('<slug>').
 *
 * Slug harus unique. Slug ini dipakai sebagai identifier untuk
 * filter "excludedFromPages" di setiap blog post.
 */
export const BLOG_PAGES = [
  { slug: 'blog', label: 'Blog Page (/blog)' },
  { slug: 'home', label: 'Homepage (/)' },
] as const;

export type BlogPageSlug = (typeof BLOG_PAGES)[number]['slug'];

export const BLOG_PAGE_OPTIONS = BLOG_PAGES.map((p) => ({
  title: p.label,
  value: p.slug,
}));
