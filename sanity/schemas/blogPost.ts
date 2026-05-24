import { defineType, defineField } from 'sanity';
import { BLOG_PAGE_OPTIONS } from '../../lib/blog/pages';

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'advanced', title: 'Advanced (Admin)' },
  ],
  // Set defaults when a new document is created from the dashboard.
  initialValue: () => ({
    status: 'draft',
    commentsEnabled: true,
    schemaType: 'BlogPosting',
    noIndex: false,
    publishedAt: new Date().toISOString(),
  }),
  fields: [
    // === Identity ===
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Short summary shown in card preview & meta description fallback.',
      validation: (Rule) => Rule.max(300),
    }),

    // === Media ===
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),

    // === Relations ===
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'blogCategory' }] }],
      description: 'Pick one or more categories. Post appears under any selected category.',
      validation: (Rule) => Rule.required().min(1).error('At least one category is required.'),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'blogTag' }] }],
      description: 'Optional. Used for related posts & future tag archive.',
    }),

    // === Content ===
    defineField({
      name: 'htmlContent',
      title: 'HTML Content',
      type: 'text',
      group: 'content',
      rows: 30,
      description:
        'Paste raw HTML here (from WP, Claude, or any generator). Will be sanitized before render.',
    }),

    // === Status & Dates ===
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'content',
      description:
        'Auto-filled with current date/time when post is created. Editor can change manually if needed (e.g. backdate or schedule).',
    }),

    // === Comments ===
    defineField({
      name: 'commentsEnabled',
      title: 'Enable Comments',
      type: 'boolean',
      group: 'content',
      description:
        'Toggle to allow comments on this post. UI not active yet, schema-ready.',
      initialValue: true,
    }),

    // === SEO ===
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description:
        'Custom title for search engines & browser tab. Falls back to Title if empty. Max 60 chars recommended.',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 2,
      description:
        'Custom meta description for SERP. Falls back to Excerpt if empty. Max 160 chars recommended.',
      validation: (Rule) => Rule.max(170),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image (Social Share)',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      description: 'Optional. Falls back to Featured Image if empty.',
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'schemaType',
      title: 'Schema Type (JSON-LD)',
      type: 'string',
      group: 'seo',
      description: 'Structured data type for SEO. Default: BlogPosting.',
      options: {
        list: [
          { title: 'BlogPosting (default)', value: 'BlogPosting' },
          { title: 'NewsArticle (for news posts)', value: 'NewsArticle' },
          { title: 'Article (generic)', value: 'Article' },
        ],
        layout: 'radio',
      },
      initialValue: 'BlogPosting',
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index (Hide from Google)',
      type: 'boolean',
      group: 'seo',
      description: 'Set true to add noindex meta tag (e.g. for outdated news).',
      initialValue: false,
    }),

    // === ADMIN ONLY ===
    defineField({
      name: 'excludedFromPages',
      title: 'Excluded From Pages',
      type: 'array',
      group: 'advanced',
      of: [
        {
          type: 'string',
          options: { list: BLOG_PAGE_OPTIONS },
        },
      ],
      description:
        '⚠️ Admin only. Force-exclude THIS post from selected pages, regardless of categories. Overrides category-level rules. Leave empty for default behaviour.',
      hidden: ({ currentUser }) => {
        return !currentUser?.roles?.some((role) => role.name === 'administrator');
      },
    }),
  ],

  orderings: [
    {
      title: 'Published Date (newest)',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'featuredImage',
      author: 'author.name',
      cat0: 'categories.0.name',
      cat1: 'categories.1.name',
    },
    prepare({ title, subtitle, media, author, cat0, cat1 }) {
      const cats = [cat0, cat1].filter(Boolean).join(', ');
      const meta = [cats, author].filter(Boolean).join(' • ');
      return {
        title,
        subtitle: `[${subtitle}] ${meta}`,
        media,
      };
    },
  },
});
