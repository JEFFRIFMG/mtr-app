'use client';

import { useState, useTransition } from 'react';
import BlogCard from './BlogCard';
import type { BlogPostListItem } from '@/types/blogPost';

interface BlogLoadMoreProps {
  initialPosts: BlogPostListItem[];
  totalCount: number;
  categorySlug?: string;
  batchSize?: number;
  emptyMessage?: string;
}

export default function BlogLoadMore({
  initialPosts,
  totalCount,
  categorySlug,
  batchSize = 6,
  emptyMessage = 'No posts found.',
}: BlogLoadMoreProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>(initialPosts);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasMore = posts.length < totalCount;

  function handleLoadMore() {
    setError(null);
    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set('offset', String(posts.length));
        if (categorySlug) params.set('category', categorySlug);

        const res = await fetch(`/api/blog/load-more?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load');
        const data: { posts: BlogPostListItem[] } = await res.json();

        if (data.posts && data.posts.length > 0) {
          // De-dupe by _id to be safe against race conditions / repeated clicks.
          setPosts((prev) => {
            const existing = new Set(prev.map((p) => p._id));
            const incoming = data.posts.filter((p) => !existing.has(p._id));
            return [...prev, ...incoming];
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load more posts');
      }
    });
  }

  if (!posts || posts.length === 0) {
    return <p className="blog-list__empty">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="blog-list">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="blog-load-more">
          {error && <p className="blog-load-more__error">{error}</p>}
          <button
            type="button"
            className="blog-load-more__button"
            onClick={handleLoadMore}
            disabled={isPending}
          >
            {isPending ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
}
