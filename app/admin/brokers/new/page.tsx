import { BrokerForm } from '../BrokerForm';

export const dynamic = 'force-dynamic';

export default function NewBrokerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Add Broker</h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        Tambah broker baru ke database.
      </p>
      <BrokerForm mode="create" />
    </div>
  );
}
