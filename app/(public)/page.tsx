import '@/styles/homepage.css';
import { Metadata } from 'next';
import { getBrokers } from '@/lib/brokers/queries';
import BrokerRankings from '@/components/ranking/BrokerRankings';
import HomepageBlogSection from '@/components/blog/HomepageBlogSection';
import HomepageFAQ from '@/components/faq/HomepageFAQ';

// ISR revalidation: 1 jam (3600 detik)
export const revalidate = 3600;
export const currentYear = new Date().getFullYear();

// MENGUBAH METADATA MENJADI DINAMIS
export async function generateMetadata(): Promise<Metadata> {
  const brokers = await getBrokers();
  const retailCount = brokers.filter(r => (r.status || '') === 'legitimate').length;
  const dynamicBrokerCount = Math.floor(retailCount / 10) * 10;

  return {
    title: `Global Broker Rankings ${currentYear} — MyTradingReviews`,
    description: `Independent rankings of ${dynamicBrokerCount}+ regulated brokers worldwide. Compare regulation, spreads, platforms and fees.`,
    alternates: {
      canonical: 'https://mytradingreviews.com/',
    },
  };
}

export default async function HomePage() {
  const brokers = await getBrokers();

  return (
    <main className="w-full">
      {/* Client Component untuk handle interaksi filter, search, & pagination */}
      <BrokerRankings initialBrokers={brokers} />
      <HomepageBlogSection />
      <HomepageFAQ />
    </main>
  );
}