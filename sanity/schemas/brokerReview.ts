import { defineType, defineField } from 'sanity';

export const brokerReview = defineType({
  name: 'brokerReview',
  title: 'Broker Review',
  type: 'document',
  fields: [
    defineField({
      name: 'brokerUuid',
      title: 'Broker UUID (from Supabase)',
      type: 'string',
      description: 'Auto-filled. Source of truth: Supabase.',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brokerName',
      title: 'Broker Name',
      type: 'string',
      description: 'Auto-filled. Source of truth: Supabase. Untuk identifikasi di Studio.',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'htmlContent',
      title: 'HTML Content',
      type: 'text',
      rows: 30,
      description:
        'Paste HTML mentah di sini (dari WP, Claude, AI lain, atau editor HTML manapun). Render di page broker akan mengikuti struktur HTML aslinya.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title (override default)',
      type: 'string',
      description: 'Kosongkan kalau pakai default dari Supabase + auto-Next.js.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description (override default)',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: 'brokerName',
      subtitle: 'status',
    },
  },
});
