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
    <article className="flex flex-col h-full bg-[#0F1825] border border-white/10 rounded-[16px] p-6 transition-colors hover:border-white/20">
      <div className="flex-col flex flex-1">
        {/* Wrapper Gambar: Pake aspect-video biar semua gambar ukurannya konsisten 16:9 */}
        <Link 
          href={href} 
          className="relative block w-full aspect-video rounded-lg overflow-hidden mb-5" 
          aria-label={post.title}
        >
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-white/5" />
          )}
        </Link>

        {/* Tanggal */}
        {post.publishedAt && (
          <div className="flex items-center gap-2 text-sm text-[#a9bcde] mb-3">
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

        {/* Judul Artikel */}
        <h3 className="text-xl font-bold text-white mb-3 leading-snug">
          <Link href={href} className="hover:text-[#00A86B] transition-colors">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt (Line clamp biar maksimal 3 baris aja) */}
        {showExcerpt && post.excerpt && (
          <p className="text-sm text-[#a9bcde] line-clamp-3 mb-6">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Tombol Read More (mt-auto buat dorong selalu ke bawah biar rata) */}
      <Link 
        href={href} 
        className="mt-auto inline-flex items-center gap-2 text-[15px] font-semibold text-[#00A86B] hover:text-[#00d488] transition-colors"
      >
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