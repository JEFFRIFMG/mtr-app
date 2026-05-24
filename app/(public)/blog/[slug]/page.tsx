import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify';
import {
  getBlogPostBySlug,
  getAllBlogSlugs,
  getBlogPostsForPage,
  getRelatedBlogPosts,
} from '@/lib/blog/queries';
import AuthorBio from '@/components/blog/AuthorBio';
import ShareSticky from '@/components/blog/ShareSticky';
import LatestPostsSidebar from '@/components/blog/LatestPostsSidebar';
import RelatedPosts from '@/components/blog/RelatedPosts';
import BlogComments from '@/components/blog/BlogComments';
import '@/styles/blog-post.css';

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://mytradingreviews.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// === Static params for ISR ===
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

// === SEO metadata ===
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description =
    post.seoDescription || post.excerpt || `${post.title} - My Trading Reviews`;
  const ogImage = post.ogImageUrl || post.featuredImageUrl || undefined;
  const url = `${SITE_URL}/blog/${post.slug.current}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: post.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: post.featuredImageAlt || title }] : undefined,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// === Sanitize config ===
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sup', 'sub',
    'ul', 'ol', 'li',
    'a',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'blockquote', 'q', 'cite',
    'figure', 'figcaption',
    'img',
    'div', 'span',
    'code', 'pre',
    'details', 'summary',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'title', 'width', 'height', 'loading',
    'class', 'id',
    'colspan', 'rowspan',
    'open',
  ],
  ALLOW_DATA_ATTR: false,
};

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const safeHtml = post.htmlContent
    ? DOMPurify.sanitize(post.htmlContent, SANITIZE_CONFIG)
    : '';

  const tagIds = post.tags?.map((t) => t._id) || null;
  const categoryIds = post.categories?.map((c) => c._id) || null;

  const [related, latest] = await Promise.all([
    getRelatedBlogPosts(post._id, tagIds, categoryIds, 2),
    getBlogPostsForPage('blog', 4),
  ]);

  const latestFiltered = latest.filter((p) => p._id !== post._id).slice(0, 3);

  const url = `${SITE_URL}/blog/${post.slug.current}`;

  // === JSON-LD ===
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    articleSection: post.categories?.map((c) => c.name).filter(Boolean) || undefined,
    author: post.author?.name
      ? {
          '@type': 'Person',
          name: post.author.name,
          url: post.author.slug?.current
            ? `${SITE_URL}/author/${post.author.slug.current}`
            : undefined,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'My Trading Reviews',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="blog-detail">
        <div className="blog-detail__back">
          <Link href="/blog" className="blog-detail__back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 448 512"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
            </svg>
            Back
          </Link>
        </div>

        <header className="blog-detail__header">
          <h1 className="blog-detail__title">{post.title}</h1>

          <div className="blog-detail__meta">
            {post.author && (
              <span className="blog-detail__author">
                {post.author.avatarUrl && (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    width={28}
                    height={28}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </>
            )}
            {post.commentsEnabled && (
              <>
                <span aria-hidden="true">·</span>
                <span className="blog-detail__comments-count">No Comments</span>
              </>
            )}
          </div>

          {post.categories && post.categories.length > 0 && (
            <div className="blog-detail__categories">
              {post.categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/blog?category=${c.slug.current}`}
                  className="blog-detail__category"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="blog-detail__layout border border-white/10 rounded-[24px] p-6 lg:p-10 mt-8 bg-[#0F1825]/50">
          <div className="blog-detail__content-col">
            {post.featuredImageUrl && (
              /* Wrapper digembok rasionya ke 16:9 (aspect-video) biar ga bakal melar ke bawah */
              <figure className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-[#0F1825] border border-white/5">
                <Image
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </figure>
            )}

            <div
              className="blog-post-html"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {post.author && <AuthorBio author={post.author} />}

            <BlogComments postId={post._id} enabled={post.commentsEnabled} />
          </div>

          <div className="blog-detail__sidebar">
            <ShareSticky url={url} title={post.title} />
            <hr className="my-8 border-t border-white/10 border-dashed" />
            <LatestPostsSidebar posts={latestFiltered} />
          </div>
        </div>

        <RelatedPosts posts={related} />
      </article>
    </>
  );
}