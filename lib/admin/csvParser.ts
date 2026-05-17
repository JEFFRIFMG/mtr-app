import Papa from 'papaparse';

// Canonical Supabase column names ← CSV header
export const FIELD_MAP: Record<string, string> = {
  rank: 'rank',
  name: 'name',
  score: 'score',
  legal_name: 'legal_name',
  founded_approx: 'founded_approx',
  hq_country: 'hq_country',
  address: 'address',
  phone: 'phone',
  email: 'email',
  website: 'website',
  affiliate_url: 'affiliate_url',
  regulation: 'regulation',
  regulation_tier: 'regulation_tier',
  platforms: 'platforms',
  eur_usd_spread: 'eur_usd_spread',
  min_deposit: 'min_deposit',
  max_leverage: 'max_leverage',
  commission: 'commission',
  instruments: 'instruments',
  account_type: 'account_type',
  color: 'color',
  status: 'status',
  warning_reason: 'warning_reason',
  description: 'description',
  quick_verdict: 'quick_verdict',
  pros: 'pros',
  cons: 'cons',
  spreads_from: 'spreads_from',
  spreads_note: 'spreads_note',
  withdrawal_time: 'withdrawal_time',
  withdrawal_note: 'withdrawal_note',
  copy_trading: 'copy_trading',
  copy_trading_note: 'copy_trading_note',
  demo_account: 'demo_account',
  demo_account_note: 'demo_account_note',
  min_deposit_note: 'min_deposit_note',
  leverage_note: 'leverage_note',
  regulation_note: 'regulation_note',
  broker_type_note: 'broker_type_note',
  instruments_note: 'instruments_note',
  founded_note: 'founded_note',
  platform_note: 'platform_note',
  payment_methods: 'payment_methods',
  trust_pilot_score: 'trust_pilot_score',
  awards: 'awards',
  offer_title: 'offer_title',
  offer_desc: 'offer_desc',
  offer_note: 'offer_note',
  offer_url: 'offer_url',
  offer_label: 'offer_label',
  trust_signals: 'trust_signals',
};

export const PIPE_ARRAYS = ['pros', 'cons', 'awards', 'trust_signals'];
export const COMMA_ARRAYS = ['regulation', 'platforms', 'payment_methods', 'account_type'];
export const INTEGER_FIELDS = ['rank', 'min_deposit', 'max_leverage'];
export const DECIMAL_FIELDS = ['score', 'eur_usd_spread'];

function slugify(str: string): string {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function parseValue(field: string, raw: unknown): unknown {
  if (raw === null || raw === undefined || raw === '') return null;
  const v = String(raw).trim();
  if (v === '') return null;

  if (PIPE_ARRAYS.includes(field)) {
    return v.split('|').map((s) => s.trim()).filter(Boolean);
  }
  if (COMMA_ARRAYS.includes(field)) {
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (INTEGER_FIELDS.includes(field)) {
    const n = parseInt(v.replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
  }
  if (DECIMAL_FIELDS.includes(field)) {
    const n = parseFloat(v.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return v;
}

export type ParsedRow = Record<string, unknown> & {
  slug: string;
  domain: string | null;
  name: string;
};

/**
 * Parse CSV text → array of broker rows ready to insert.
 * NO dedup. Asumsi CSV udah clean (per instruksi).
 */
export function parseCsv(csvText: string): {
  rows: ParsedRow[];
  skipped: number;
  unknownCols: string[];
} {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows: ParsedRow[] = [];
  const usedSlugs = new Set<string>();
  const usedDomains = new Set<string>();
  let skipped = 0;
  const unknownSet = new Set<string>();

  for (const raw of data) {
    const row: Record<string, unknown> = {};
    for (const [csvKey, value] of Object.entries(raw)) {
      const canonical = FIELD_MAP[csvKey];
      if (!canonical) {
        unknownSet.add(csvKey);
        continue;
      }
      row[canonical] = parseValue(canonical, value);
    }
    if (!row.name) {
      skipped++;
      continue;
    }

    // Slug: handle collision
    const baseSlug = slugify(row.name as string);
    let slug = baseSlug;
    let n = 1;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${++n}`;
    usedSlugs.add(slug);
    row.slug = slug;

    // Domain: null kalau collision (constraint UNIQUE)
    const domain = extractDomain(row.website as string);
    if (domain && !usedDomains.has(domain)) {
      row.domain = domain;
      usedDomains.add(domain);
    } else {
      row.domain = null;
    }

    rows.push(row as ParsedRow);
  }

  return { rows, skipped, unknownCols: Array.from(unknownSet) };
}
