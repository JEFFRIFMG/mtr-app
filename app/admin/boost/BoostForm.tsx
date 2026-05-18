'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Broker } from '@/types/broker';

type Boost = {
  id: number;
  broker_uuid: string;
  amount: number;
  edited_email: string | null;
  note: string | null;
  created_at: string;
};

export function BoostForm({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedUuid, setSelectedUuid] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Boost[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const selected = brokers.find((b) => b.uuid === selectedUuid);

  const filtered = useMemo(() => {
    if (!search) return brokers.slice(0, 20);
    const q = search.toLowerCase();
    return brokers.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 20);
  }, [brokers, search]);

  // Load history when broker selected
  useEffect(() => {
    if (!selectedUuid) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    fetch(`/api/admin/boost?broker_uuid=${selectedUuid}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.boosts || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [selectedUuid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const num = parseInt(amount, 10);
    if (!selectedUuid) return setError('Pilih broker dulu');
    if (!Number.isFinite(num) || num === 0) return setError('Amount harus angka, tidak boleh 0');

    setSubmitting(true);
    const res = await fetch('/api/admin/boost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        broker_uuid: selectedUuid,
        amount: num,
        note: note || null,
      }),
    });

    if (!res.ok) {
      const j = await res.json();
      setError(j.error || 'Gagal');
      setSubmitting(false);
      return;
    }

    const { boost } = await res.json();
    setHistory((prev) => [boost, ...prev]);
    setAmount('');
    setNote('');
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-xl mb-6"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        {/* Broker picker */}
        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
            Broker
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedUuid('');
            }}
            placeholder="Cari nama broker..."
            className="w-full px-3 py-2 rounded mb-2"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          />
          {!selectedUuid && search && (
            <div
              className="rounded max-h-60 overflow-y-auto"
              style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
            >
              {filtered.length === 0 ? (
                <div className="p-2 text-xs" style={{ color: '#7A8FA6' }}>
                  No matches.
                </div>
              ) : (
                filtered.map((b) => (
                  <button
                    key={b.uuid}
                    type="button"
                    onClick={() => {
                      setSelectedUuid(b.uuid);
                      setSearch(b.name);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:opacity-80"
                    style={{ color: '#E8EDF4', background: 'transparent' }}
                  >
                    {b.name}{' '}
                    <span style={{ color: '#7A8FA6' }}>
                      · rank {b.rank ?? '—'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
          {selected && (
            <div className="text-xs" style={{ color: '#00A86B' }}>
              Selected: {selected.name} (UUID: {selected.uuid.slice(0, 8)}...)
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
            Amount (positif untuk tambah, negatif untuk kurangi)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full px-3 py-2 rounded"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          />
        </div>

        {/* Note (optional) */}
        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
            Note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alasan boost / referensi..."
            className="w-full px-3 py-2 rounded"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          />
        </div>

        {error && (
          <div
            className="mb-3 p-2 rounded text-sm"
            style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !selectedUuid}
          className="px-4 py-2 rounded font-medium disabled:opacity-50"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          {submitting ? 'Saving...' : 'Apply Boost'}
        </button>
      </form>

      {/* History */}
      {selectedUuid && (
        <div
          className="p-4 rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
            Boost History {selected ? `— ${selected.name}` : ''}
          </h3>
          {loadingHistory ? (
            <p className="text-xs" style={{ color: '#7A8FA6' }}>
              Loading...
            </p>
          ) : history.length === 0 ? (
            <p className="text-xs" style={{ color: '#7A8FA6' }}>
              No boost history yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: '#7A8FA6' }}>
                  <th className="text-left py-2">When</th>
                  <th className="text-left py-2">By</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2 pl-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b) => (
                  <tr key={b.id} style={{ borderTop: '1px solid #1A2E45' }}>
                    <td className="py-2 text-xs" style={{ color: '#7A8FA6' }}>
                      {new Date(b.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 text-xs">{b.edited_email ?? '—'}</td>
                    <td
                      className="py-2 text-right font-mono"
                      style={{ color: b.amount > 0 ? '#00A86B' : '#E53E3E' }}
                    >
                      {b.amount > 0 ? '+' : ''}
                      {b.amount}
                    </td>
                    <td className="py-2 pl-3 text-xs" style={{ color: '#E8EDF4' }}>
                      {b.note ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
