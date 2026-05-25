import '@/styles/homepage.css';
import { Metadata } from 'next';
import { getBrokers } from '@/lib/brokers/queries';
import BrokerRankings from '@/components/ranking/BrokerRankings';
import HomepageBlogSection from '@/components/blog/HomepageBlogSection';

// ISR revalidation: 1 jam (3600 detik)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Global Broker Rankings 2026 — MyTradingReviews',
  description: 'Independent rankings of 590+ regulated brokers worldwide. Compare regulation, spreads, platforms and fees. No paid placements.',
  alternates: {
    canonical: 'https://mytradingreviews.com/',
  },
};

export default async function HomePage() {
  const brokers = await getBrokers();

  return (
    <main className="w-full">
      {/* Client Component untuk handle interaksi filter, search, & pagination */}
      <BrokerRankings initialBrokers={brokers} />

      {/* Latest blog posts section */}
      <HomepageBlogSection />
    </main>
  );
}
