import BlogCard from './BlogCard';
import type { BlogPostListItem } from '@/types/blogPost';

interface RelatedPostsProps {
  posts: BlogPostListItem[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-white/10" aria-label="Related posts">
      <h2 className="text-[1.75rem] font-bold text-white mb-6">Related Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}