import { getAllBrokersAdmin } from '@/lib/admin/queries';
import { BoostForm } from './BoostForm';

export const dynamic = 'force-dynamic';

export default async function BoostPage() {
  const brokers = await getAllBrokersAdmin();
  const activeBrokers = brokers.filter((b) => !b.deleted_at);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Vote Boost</h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        Tambah jumlah vote manual ke broker. Semua perubahan ke-record di history.
      </p>
      <BoostForm brokers={activeBrokers} />
    </div>
  );
}
