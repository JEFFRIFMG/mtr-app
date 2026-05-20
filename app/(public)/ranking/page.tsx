import '@/styles/homepage.css';
import { Metadata } from 'next';
import { getBrokers } from '@/lib/brokers/queries';
import RankingPageList from '@/components/ranking/RankingPageList';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Broker Ranking 2026 - Independent Broker Reviews | MyTradingReviews',
  description: 'Top-rated brokers ranked by our independent scoring methodology. Compare regulated brokers side-by-side.',
};

export default async function RankingPage() {
  const brokers = await getBrokers();

  return (
    <main className="w-full">
      <RankingPageList initialBrokers={brokers} />
    </main>
  );
}