'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { BlogCategoryGroup } from '@/types/blogCategory';

interface BlogFilterTabsProps {
  groups: BlogCategoryGroup[];
}

export default function BlogFilterTabs({ groups }: BlogFilterTabsProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  // Determine active state:
  // - activeCategory matches a main slug → that main is active (no children active)
  // - activeCategory matches a child slug → its parent main is active + that child active
  // - else → "all"
  let activeMain = 'all';
  let activeChild: string | null = null;

  if (activeCategory !== 'all') {
    const mainMatch = groups.find((g) => g.main.slug.current === activeCategory);
    if (mainMatch) {
      activeMain = activeCategory;
    } else {
      const parentOfChild = groups.find((g) =>
        g.children.some((c) => c.slug.current === activeCategory)
      );
      if (parentOfChild) {
        activeMain = parentOfChild.main.slug.current;
        activeChild = activeCategory;
      }
    }
  }

  const activeGroup = groups.find((g) => g.main.slug.current === activeMain);
  const subTabs = activeGroup?.children || [];

  // Build the href for a main tab.
  // If main has children → link to first child (not the main itself).
  // If main has no children → link to main slug.
  const mainHref = (g: BlogCategoryGroup) => {
    if (g.children.length > 0) {
      return `/blog?category=${g.children[0].slug.current}`;
    }
    return `/blog?category=${g.main.slug.current}`;
  };

  return (
    <>
      <nav className="blog-filter-tabs" aria-label="Filter by category">
        <Link
          href="/blog"
          className={`blog-filter-tabs__tab ${activeMain === 'all' ? 'is-active' : ''}`}
        >
          All
        </Link>
        {groups.map((g) => {
          const slug = g.main.slug.current;
          return (
            <Link
              key={g.main._id}
              href={mainHref(g)}
              className={`blog-filter-tabs__tab ${activeMain === slug ? 'is-active' : ''}`}
            >
              {g.main.name}
            </Link>
          );
        })}
      </nav>

      {subTabs.length > 0 && (
        <nav className="blog-subfilter-tabs" aria-label="Sub-filter">
          {subTabs.map((c) => {
            const slug = c.slug.current;
            return (
              <Link
                key={c._id}
                href={`/blog?category=${slug}`}
                className={`blog-subfilter-tabs__tab ${activeChild === slug ? 'is-active' : ''}`}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
