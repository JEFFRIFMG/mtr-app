export type AwardGroup = {
  uuid: string;
  slug: string;
  name: string;
  icon_svg: string | null;
  sort_order: number;
};

export type AwardCategory = {
  uuid: string;
  group_id: string;
  slug: string;
  title: string;
  description: string;
  icon_svg: string | null;
  tags: string[] | null;
  sort_order: number;
};

export type AwardWinnerBroker = {
  uuid: string;
  name: string;
  slug: string;
  logo_url: string | null;
  domain: string | null;
};

export type AwardWinner = {
  uuid: string;
  category_id: string;
  broker_uuid: string | null;
  year: number;
  announced_at: string | null;
  broker: AwardWinnerBroker | null;
  category: AwardCategory;
};

// Bentuk siap render: 1 group berisi categories, tiap category punya winner
export type AwardCategoryWithWinner = AwardCategory & {
  winner: AwardWinner | null;
};

export type AwardGroupRendered = AwardGroup & {
  categories: AwardCategoryWithWinner[];
};

// 1 tahun award lineup
export type AwardYearBlock = {
  year: number;
  groups: AwardGroupRendered[];
  categories_count: number;
};

export type AwardStats = {
  categories_count: number; // count untuk tahun terbaru
  brokers_count_bucketed: string; // "400+"
  current_year: number; // tahun terbaru
};

export type AwardsPageData = {
  stats: AwardStats;
  years: AwardYearBlock[]; // desc, terbaru duluan
};
