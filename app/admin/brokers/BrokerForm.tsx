'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Broker } from '@/types/broker';

type Mode = 'create' | 'edit';

export function BrokerForm({ broker, mode }: { broker?: Broker; mode: Mode }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Broker>>(
    broker || {
      name: '',
      rank: null,
      score: null,
      legal_name: null,
      founded_approx: null,
      hq_country: null,
      website: null,
      affiliate_url: null,
      regulation_tier: null,
      min_deposit: null,
      max_leverage: null,
      description: null,
      quick_verdict: null,
      is_published: true,
      status: 'legitimate',
    }
  );

  function setField<K extends keyof Broker>(key: K, value: Broker[K] | null) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setArrayField(key: keyof Broker, raw: string, sep: string = ',') {
    const arr = raw.split(sep).map((s) => s.trim()).filter(Boolean);
    setForm((f) => ({ ...f, [key]: arr.length ? arr : null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = mode === 'create' ? '/api/admin/brokers' : `/api/admin/brokers/${broker!.uuid}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Unknown error');
      setSubmitting(false);
      return;
    }

    router.push('/admin/brokers');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div
          className="mb-4 p-3 rounded"
          style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}
        >
          {error}
        </div>
      )}

      <Section title="Basic">
        <Field label="Name *">
          <input
            type="text"
            required
            value={form.name || ''}
            onChange={(e) => setField('name', e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Legal Name">
          <input
            type="text"
            value={form.legal_name || ''}
            onChange={(e) => setField('legal_name', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Founded (year)">
          <input
            type="text"
            value={form.founded_approx || ''}
            onChange={(e) => setField('founded_approx', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
        <Field label="HQ Country">
          <input
            type="text"
            value={form.hq_country || ''}
            onChange={(e) => setField('hq_country', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Ranking & Score">
        <Field label="Rank">
          <input
            type="number"
            value={form.rank ?? ''}
            onChange={(e) => setField('rank', e.target.value ? parseInt(e.target.value, 10) : null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Score (0-10)">
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={form.score ?? ''}
            onChange={(e) => setField('score', e.target.value ? parseFloat(e.target.value) : null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Regulation Tier">
          <select
            value={form.regulation_tier || ''}
            onChange={(e) => setField('regulation_tier', e.target.value || null)}
            style={inputStyle}
          >
            <option value="">— Unrated —</option>
            <option value="Tier-1">Tier-1</option>
            <option value="Tier-2">Tier-2</option>
            <option value="Tier-3">Tier-3</option>
          </select>
        </Field>
        <Field label="Regulation (comma-separated, e.g. FCA, ASIC)">
          <input
            type="text"
            defaultValue={(form.regulation || []).join(', ')}
            onBlur={(e) => setArrayField('regulation', e.target.value, ',')}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Trading">
        <Field label="EUR/USD Spread">
          <input
            type="number"
            step="0.01"
            value={form.eur_usd_spread ?? ''}
            onChange={(e) =>
              setField('eur_usd_spread', e.target.value ? parseFloat(e.target.value) : null)
            }
            style={inputStyle}
          />
        </Field>
        <Field label="Min Deposit (USD)">
          <input
            type="number"
            value={form.min_deposit ?? ''}
            onChange={(e) =>
              setField('min_deposit', e.target.value ? parseInt(e.target.value, 10) : null)
            }
            style={inputStyle}
          />
        </Field>
        <Field label="Max Leverage (e.g. 500 → 1:500)">
          <input
            type="number"
            value={form.max_leverage ?? ''}
            onChange={(e) =>
              setField('max_leverage', e.target.value ? parseInt(e.target.value, 10) : null)
            }
            style={inputStyle}
          />
        </Field>
        <Field label="Platforms (comma-separated)">
          <input
            type="text"
            defaultValue={(form.platforms || []).join(', ')}
            onBlur={(e) => setArrayField('platforms', e.target.value, ',')}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Web & Contact">
        <Field label="Website">
          <input
            type="url"
            value={form.website || ''}
            onChange={(e) => setField('website', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Affiliate URL">
          <input
            type="url"
            value={form.affiliate_url || ''}
            onChange={(e) => setField('affiliate_url', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Content">
        <Field label="Quick Verdict">
          <textarea
            rows={2}
            value={form.quick_verdict || ''}
            onChange={(e) => setField('quick_verdict', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={4}
            value={form.description || ''}
            onChange={(e) => setField('description', e.target.value || null)}
            style={inputStyle}
          />
        </Field>
        <Field label="Pros (pipe-separated, e.g. Low spreads | Fast withdrawal)">
          <input
            type="text"
            defaultValue={(form.pros || []).join(' | ')}
            onBlur={(e) => setArrayField('pros', e.target.value, '|')}
            style={inputStyle}
          />
        </Field>
        <Field label="Cons (pipe-separated)">
          <input
            type="text"
            defaultValue={(form.cons || []).join(' | ')}
            onBlur={(e) => setArrayField('cons', e.target.value, '|')}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Visibility">
        <Field label="Status">
          <select
            value={form.status || 'legitimate'}
            onChange={(e) => setField('status', e.target.value)}
            style={inputStyle}
          >
            <option value="legitimate">Legitimate</option>
            <option value="warning">Warning</option>
            <option value="scam">Scam</option>
            <option value="delisted">Delisted</option>
          </select>
        </Field>
        <Field label="Published on website">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.is_published}
              onChange={(e) => setField('is_published', e.target.checked)}
            />
            <span>Tampilkan di website publik</span>
          </label>
        </Field>
      </Section>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded font-medium disabled:opacity-50"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Broker' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded"
          style={{ background: '#1A2E45', color: '#E8EDF4' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A1220',
  border: '1px solid #1A2E45',
  color: '#E8EDF4',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-6 p-4 rounded-xl"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
