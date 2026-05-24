import type { Author } from './author';
import type { BlogCategoryRef } from './blogCategory';
import type { BlogTag } from './blogTag';

export type BlogPostStatus = 'draft' | 'published';
export type BlogPostSchemaType = 'BlogPosting' | 'NewsArticle' | 'Article';

export interface BlogPostListItem {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  author: Pick<Author, '_id' | 'name' | 'slug' | 'avatarUrl'> | null;
  categories: BlogCategoryRef[];
  publishedAt: string | null;
  updatedAt: string | null;
  status: BlogPostStatus;
}

export interface BlogPostDetail extends BlogPostListItem {
  htmlContent: string | null;
  tags: BlogTag[] | null;
  commentsEnabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  schemaType: BlogPostSchemaType;
  noIndex: boolean;
  author: Author | null;
  excludedFromPages: string[] | null;
}
