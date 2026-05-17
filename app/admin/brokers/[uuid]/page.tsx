import { notFound } from 'next/navigation';
import { getBrokerByUuid } from '@/lib/admin/queries';
import { BrokerForm } from '../BrokerForm';

export const dynamic = 'force-dynamic';

export default async function EditBrokerPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const broker = await getBrokerByUuid(uuid);

  if (!broker) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Edit Broker</h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        {broker.name} — {broker.uuid}
      </p>
      <BrokerForm broker={broker} mode="edit" />
    </div>
  );
}
