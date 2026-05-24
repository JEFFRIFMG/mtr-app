import BlogCard from './BlogCard';
import type { BlogPostListItem } from '@/types/blogPost';

interface BlogListProps {
  posts: BlogPostListItem[];
  emptyMessage?: string;
}

export default function BlogList({
  posts,
  emptyMessage = 'No posts found.',
}: BlogListProps) {
  if (!posts || posts.length === 0) {
    return <p className="blog-list__empty">{emptyMessage}</p>;
  }

  return (
    <div className="blog-list">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
