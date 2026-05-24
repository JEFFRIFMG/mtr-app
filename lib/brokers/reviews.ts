import { createClient } from '@/lib/shared/supabase/server';
import { BrokerReview, BrokerReviewStats } from '@/types/brokerReview';

export async function getApprovedReviews(brokerUuid: string): Promise<BrokerReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('broker_reviews')
    .select('*')
    .eq('broker_uuid', brokerUuid)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error (getApprovedReviews):', error.message);
    return [];
  }

  return data as BrokerReview[];
}

export function calculateReviewStats(reviews: BrokerReview[]): BrokerReviewStats {
  const total = reviews.length;

  if (total === 0) {
    return {
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / total;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });

  return {
    total,
    average: Math.round(average * 10) / 10,
    distribution,
  };
}