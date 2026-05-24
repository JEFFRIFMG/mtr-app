import BlogCard from './BlogCard';
import type { BlogPostListItem } from '@/types/blogPost';

interface RelatedPostsProps {
  posts: BlogPostListItem[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="related-posts" aria-label="Related posts">
      <h2 className="related-posts__title">Related Posts</h2>
      <div className="related-posts__grid">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
