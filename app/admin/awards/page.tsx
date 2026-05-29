import { createClient } from '@/lib/shared/supabase/server';
import AwardsTable from './AwardsTable';

export const dynamic = 'force-dynamic';

async function getInitialYear(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from('award_winners')
    .select('year')
    .is('deleted_at', null)
    .order('year', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.year ?? new Date().getFullYear();
}

export default async function AdminAwardsPage() {
  const initialYear = await getInitialYear();
  return <AwardsTable initialYear={initialYear} />;
}
