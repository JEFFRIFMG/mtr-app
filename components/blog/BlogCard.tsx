import Link from 'next/link';
import Image from 'next/image';
import type { BlogPostListItem } from '@/types/blogPost';

interface BlogCardProps {
  post: BlogPostListItem;
  showExcerpt?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogCard({
  post,
  showExcerpt = true,
}: BlogCardProps) {
  const href = `/blog/${post.slug.current}`;

  return (
    <article className="blog-card">
      <div className="blog-card__top">
        <Link href={href} className="blog-card__image-wrap" aria-label={post.title}>
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              width={400}
              height={220}
              className="blog-card__image"
            />
          ) : (
            <div className="blog-card__image blog-card__image--placeholder" />
          )}
        </Link>

        {post.publishedAt && (
          <div className="blog-card__date">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        )}

        <h3 className="blog-card__title">
          <Link href={href}>{post.title}</Link>
        </h3>

        {showExcerpt && post.excerpt && (
          <p className="blog-card__excerpt">{post.excerpt}</p>
        )}
      </div>

      <Link href={href} className="blog-card__cta">
        Read More
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </article>
  );
}
