import '@/styles/comparison.css';
import { Metadata } from 'next';
import { getBrokers } from '@/lib/brokers/queries';
import BrokerComparison from '@/components/comparison/BrokerComparison';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Compare Forex & CFD Brokers Side-by-Side | MyTradingReviews',
  description: 'Compare top regulated brokers based on spreads, minimum deposit, platforms, and regulation tier.',
};

export default async function ComparisonPage() {
  const brokers = await getBrokers();
  
  return (
    <main className="w-full">
      <BrokerComparison initialBrokers={brokers} />
    </main>
  );
}