export interface BlogCategoryRef {
  _id: string;
  name: string;
  slug: { current: string };
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description: string | null;
  order: number;
  parent: BlogCategoryRef | null;
  excludedFromPages: string[] | null;
}

export interface BlogCategoryGroup {
  main: BlogCategory;
  children: BlogCategory[];
}
