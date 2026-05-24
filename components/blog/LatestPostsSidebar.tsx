import Link from 'next/link';
import type { BlogPostListItem } from '@/types/blogPost';

interface LatestPostsSidebarProps {
  posts: BlogPostListItem[];
  title?: string;
}

export default function LatestPostsSidebar({
  posts,
  title = 'Latest Posts',
}: LatestPostsSidebarProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <aside className="latest-sidebar" aria-label={title}>
      <h3 className="latest-sidebar__title">{title}</h3>
      <ul className="latest-sidebar__list">
        {posts.map((post) => (
          <li key={post._id} className="latest-sidebar__item">
            <Link href={`/blog/${post.slug.current}`} className="latest-sidebar__link">
              <h4 className="latest-sidebar__post-title">{post.title}</h4>
              {post.excerpt && (
                <p className="latest-sidebar__excerpt">{post.excerpt}</p>
              )}
              <span className="latest-sidebar__cta">
                Read More
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
