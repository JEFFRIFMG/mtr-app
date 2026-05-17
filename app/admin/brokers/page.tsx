import Link from 'next/link';
import { getAllBrokersAdmin } from '@/lib/admin/queries';
import { BrokersTable } from './BrokersTable';

export const dynamic = 'force-dynamic';

export default async function BrokersListPage() {
  const brokers = await getAllBrokersAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brokers</h1>
          <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
            {brokers.length} brokers total (including soft-deleted).
          </p>
        </div>
        <Link
          href="/admin/brokers/new"
          className="px-4 py-2 rounded font-medium"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          + Add Broker
        </Link>
      </div>

      <BrokersTable brokers={brokers} />
    </div>
  );
}
