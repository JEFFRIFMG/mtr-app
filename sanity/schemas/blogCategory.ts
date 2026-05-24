import { defineType, defineField } from 'sanity';
import { BLOG_PAGE_OPTIONS } from '../../lib/blog/pages';

export const blogCategory = defineType({
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'blogCategory' }],
      description:
        'Leave empty for main category. Set parent to make this a sub-category (sub-tab). Example: "Prop Firm Reviews" has parent "Reviews".',
      options: {
        filter: ({ document }) => {
          if (!document?._id) return {};
          const cleanId = document._id.replace(/^drafts\./, '');
          return {
            filter: '_id != $id && _id != $draftId',
            params: { id: cleanId, draftId: `drafts.${cleanId}` },
          };
        },
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional short description for category archive page.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = shown first in filter tabs. Default 0.',
      initialValue: 0,
    }),
    defineField({
      name: 'excludedFromPages',
      title: 'Excluded From Pages',
      type: 'array',
      of: [
        {
          type: 'string',
          options: { list: BLOG_PAGE_OPTIONS },
        },
      ],
      description:
        '⚠️ Admin only. Hide all posts of this category from selected pages. Posts with multiple categories still appear if any other category is NOT excluded. Leave empty to show on all pages.',
      hidden: ({ currentUser }) => {
        return !currentUser?.roles?.some((role) => role.name === 'administrator');
      },
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      parentName: 'parent.name',
    },
    prepare({ title, subtitle, parentName }) {
      return {
        title,
        subtitle: parentName ? `↳ child of: ${parentName}` : subtitle,
      };
    },
  },
});
