export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewSource = 'visitor' | 'admin';

export interface BrokerReview {
  id: string;
  broker_uuid: string;
  rating: number;
  review_text: string;
  guest_name: string;
  guest_email: string | null;
  status: ReviewStatus;
  source: ReviewSource;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface BrokerReviewStats {
  total: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}