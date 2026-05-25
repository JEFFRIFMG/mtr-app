import Link from 'next/link';
import { getBlogPostsForPage } from '@/lib/blog/queries';
import BlogCard from './BlogCard';
import '@/styles/homepage-blog.css';

const PAGE_SLUG = 'home';
const POSTS_LIMIT = 3;

export default async function HomepageBlogSection() {
  const posts = await getBlogPostsForPage(PAGE_SLUG, POSTS_LIMIT);

  // Don't render section if there are no posts to show.
  if (!posts || posts.length === 0) return null;

  return (
    <section className="homepage-blog" aria-labelledby="homepage-blog-title">
      <header className="homepage-blog__header">
        <h2 id="homepage-blog-title" className="homepage-blog__title">
          Our <span className="homepage-blog__title-accent">Insight</span>
        </h2>
        <p className="homepage-blog__subtitle">
          Read the latest guides, reviews, and insights on prop trading.
        </p>
      </header>

      <div className="homepage-blog__grid">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      <div className="homepage-blog__cta">
        <Link href="/blog" className="homepage-blog__cta-button">
          See More Blog
        </Link>
      </div>
    </section>
  );
}
