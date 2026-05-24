import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { AddReviewForm } from './AddReviewForm';

export const dynamic = 'force-dynamic';

export default async function AddReviewPage() {
  await requireAdmin();

  const supabase = createClient();
  const { data: brokers } = await supabase
    .from('brokers')
    .select('uuid, name, slug')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('name', { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Review</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
          Manually add a review. Auto-approved and visible immediately on the broker page.
        </p>
      </div>

      <AddReviewForm brokers={brokers || []} />
    </div>
  );
}