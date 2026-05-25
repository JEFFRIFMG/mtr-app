import { Suspense } from 'react';
import {
  getBlogPostsForPage,
  getBlogPostsByCategorySlug,
  getBlogPostsCountForPage,
  getBlogPostsCountByCategorySlug,
  getBlogCategoryGroups,
} from '@/lib/blog/queries';
import BlogLoadMore from '@/components/blog/BlogLoadMore';
import BlogFilterTabs from '@/components/blog/BlogFilterTabs';
import '@/styles/blog-list.css';

const PAGE_SLUG = 'blog';
const INITIAL_BATCH = 6;

export const revalidate = 60;

export const metadata = {
  title: 'Blog and Insight | My Trading Reviews',
  description:
    'Stay informed with expert analysis, trading tips, and the latest insights on prop firms to maximize your trading potential.',
  alternates: { canonical: '/blog' },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const categorySlug = category && category !== 'all' ? category : undefined;

  const [posts, totalCount, groups] = await Promise.all([
    categorySlug
      ? getBlogPostsByCategorySlug(categorySlug, PAGE_SLUG, INITIAL_BATCH, 0)
      : getBlogPostsForPage(PAGE_SLUG, INITIAL_BATCH, 0),
    categorySlug
      ? getBlogPostsCountByCategorySlug(categorySlug, PAGE_SLUG)
      : getBlogPostsCountForPage(PAGE_SLUG),
    getBlogCategoryGroups(PAGE_SLUG),
  ]);

  return (
    <main className="blog-list-page">
      <header className="blog-list-page__hero">
        <h1 className="blog-list-page__title">Blog and Insight</h1>
        <p className="blog-list-page__subtitle">
          Stay informed with expert analysis, trading tips, and the latest insights on
          prop firms to maximize your trading potential.
        </p>
      </header>

      <Suspense fallback={null}>
        <BlogFilterTabs groups={groups} />
      </Suspense>

      <BlogLoadMore
        key={categorySlug || 'all'}
        initialPosts={posts}
        totalCount={totalCount}
        categorySlug={categorySlug}
        batchSize={INITIAL_BATCH}
        emptyMessage={
          categorySlug
            ? 'No posts in this category yet.'
            : 'No blog posts yet.'
        }
      />
    </main>
  );
}
