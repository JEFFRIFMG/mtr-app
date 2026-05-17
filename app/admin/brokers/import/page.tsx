'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Result = {
  total: number;
  inserted: number;
  failed: number;
  skipped: number;
  unknownCols: string[];
  errors: Array<{ name: string; error: string }>;
};

export default function ImportCsvPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const text = await f.text();
    setCsvText(text);
  }

  async function handleSubmit() {
    if (!csvText.trim()) {
      setError('CSV kosong. Upload file atau paste isinya.');
      return;
    }
    if (!confirm('Import semua data dari CSV? Tidak ada dedup — semua row bakal masuk.')) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    const res = await fetch('/api/admin/brokers/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Unknown error');
      setSubmitting(false);
      return;
    }

    setResult(json);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Import CSV</h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        Bulk import broker dari CSV. Asumsi data CSV udah clean — tidak ada dedup check.
      </p>

      <div
        className="p-4 rounded-xl mb-4"
        style={{ background: 'rgba(214, 158, 46, 0.1)', border: '1px solid #D69E2E' }}
      >
        <p className="text-sm" style={{ color: '#D69E2E' }}>
          ⚠️ Warning: Import ga ngecek duplikat. Kalau broker yang sama udah ada di database,
          bakal ke-insert lagi (dengan UUID berbeda). Pastikan CSV bener-bener clean sebelum
          import.
        </p>
      </div>

      <div
        className="p-4 rounded-xl mb-4"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <label className="block text-sm font-medium mb-2">Upload CSV file</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm"
          style={{ color: '#E8EDF4' }}
        />
        {file && (
          <p className="text-xs mt-2" style={{ color: '#7A8FA6' }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div
        className="p-4 rounded-xl mb-4"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <label className="block text-sm font-medium mb-2">
          Or paste CSV content (with headers)
        </label>
        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="name,rank,score,..."
          className="w-full px-3 py-2 rounded text-xs font-mono"
          style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
        />
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded"
          style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-4 py-2 rounded font-medium disabled:opacity-50"
        style={{ background: '#00A86B', color: '#fff' }}
      >
        {submitting ? 'Importing...' : 'Import CSV'}
      </button>

      {result && (
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #00A86B' }}
        >
          <h3 className="font-semibold mb-2" style={{ color: '#00A86B' }}>
            Import complete
          </h3>
          <ul className="text-sm space-y-1">
            <li>Total rows parsed: {result.total}</li>
            <li style={{ color: '#00A86B' }}>Inserted: {result.inserted}</li>
            <li style={{ color: '#D69E2E' }}>Skipped (no name): {result.skipped}</li>
            <li style={{ color: '#E53E3E' }}>Failed: {result.failed}</li>
          </ul>
          {result.unknownCols.length > 0 && (
            <div className="mt-3">
              <p className="text-xs" style={{ color: '#7A8FA6' }}>
                Unknown CSV columns (ignored):
              </p>
              <p className="text-xs font-mono" style={{ color: '#7A8FA6' }}>
                {result.unknownCols.join(', ')}
              </p>
            </div>
          )}
          {result.errors.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs cursor-pointer" style={{ color: '#E53E3E' }}>
                Show errors ({result.errors.length})
              </summary>
              <ul className="text-xs mt-2 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    <strong>{e.name}</strong>: {e.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
