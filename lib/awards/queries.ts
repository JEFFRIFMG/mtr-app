import { createClient } from '@/lib/shared/supabase/server';
import type {
  AwardGroup,
  AwardCategory,
  AwardWinner,
  AwardCategoryWithWinner,
  AwardGroupRendered,
  AwardYearBlock,
  AwardStats,
  AwardsPageData,
} from '@/types/award';

function bucketBrokerCount(count: number): string {
  if (count < 100) return `${count}`;
  return `${Math.floor(count / 100) * 100}+`;
}

export async function getAwardsPageData(): Promise<AwardsPageData> {
  const supabase = createClient();

  const [groupsRes, categoriesRes, winnersRes, brokersCountRes] = await Promise.all([
    supabase
      .from('award_groups')
      .select('uuid, slug, name, icon_svg, sort_order')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),

    supabase
      .from('award_categories')
      .select('uuid, group_id, slug, title, description, icon_svg, tags, sort_order')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),

    supabase
      .from('award_winners')
      .select(`
        uuid, category_id, broker_uuid, year, announced_at,
        broker:brokers!award_winners_broker_uuid_fkey (
          uuid, name, slug, logo_url, domain
        )
      `)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('year', { ascending: false }),

    supabase
      .from('brokers')
      .select('uuid', { count: 'exact', head: true })
      .eq('is_published', true)
      .is('deleted_at', null),
  ]);

  if (groupsRes.error) console.error('[awards] groups error:', groupsRes.error);
  if (categoriesRes.error) console.error('[awards] categories error:', categoriesRes.error);
  if (winnersRes.error) console.error('[awards] winners error:', winnersRes.error);
  if (brokersCountRes.error) console.error('[awards] brokers count error:', brokersCountRes.error);

  const groups = (groupsRes.data ?? []) as AwardGroup[];
  const categories = (categoriesRes.data ?? []) as AwardCategory[];
  const winners = (winnersRes.data ?? []) as unknown as AwardWinner[];

  const winnersByYear = new Map<number, AwardWinner[]>();
  for (const w of winners) {
    if (!winnersByYear.has(w.year)) winnersByYear.set(w.year, []);
    winnersByYear.get(w.year)!.push(w);
  }

  const yearsDesc = Array.from(winnersByYear.keys()).sort((a, b) => b - a);

  const yearBlocks: AwardYearBlock[] = yearsDesc.map((year) => {
    const yearWinners = winnersByYear.get(year) ?? [];

    const winnerByCategoryId = new Map<string, AwardWinner>();
    for (const w of yearWinners) winnerByCategoryId.set(w.category_id, w);

    const activeCategoryIds = new Set(yearWinners.map((w) => w.category_id));

    const renderedGroups: AwardGroupRendered[] = groups
      .map((g) => {
        const groupCats: AwardCategoryWithWinner[] = categories
          .filter((c) => c.group_id === g.uuid && activeCategoryIds.has(c.uuid))
          .map((c) => ({
            ...c,
            winner: winnerByCategoryId.get(c.uuid) ?? null,
          }));

        return {
          ...g,
          categories: groupCats,
        };
      })
      .filter((g) => g.categories.length > 0);

    return {
      year,
      groups: renderedGroups,
      categories_count: yearWinners.length,
    };
  });

  const currentYear = yearsDesc[0] ?? new Date().getFullYear();
  const currentYearBlock = yearBlocks[0];

  const stats: AwardStats = {
    categories_count: currentYearBlock?.categories_count ?? 0,
    brokers_count_bucketed: bucketBrokerCount(brokersCountRes.count ?? 0),
    current_year: currentYear,
  };

  return {
    stats,
    years: yearBlocks,
  };
}
