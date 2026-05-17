import { getAdminStats } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    { label: 'Total brokers (incl. deleted)', value: stats.total, color: '#E8EDF4' },
    { label: 'Active', value: stats.active, color: '#00A86B' },
    { label: 'Soft-deleted', value: stats.deleted, color: '#E53E3E' },
    { label: 'Published on website', value: stats.published, color: '#00A86B' },
    { label: 'Hidden from website', value: stats.hidden, color: '#D69E2E' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        Overview broker data di Supabase.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-4 rounded-xl"
            style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
          >
            <div className="text-3xl font-bold" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="text-xs mt-1" style={{ color: '#7A8FA6' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
