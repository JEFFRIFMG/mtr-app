import { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import {
  Card, Stack, Flex, Text, Badge, Button, TextInput, Select, Box, Spinner, Inline,
} from '@sanity/ui';
import { AddIcon, EditIcon, SearchIcon } from '@sanity/icons';

type SupabaseBroker = {
  uuid: string;
  name: string;
  slug: string;
  rank: number | null;
  score: number | null;
  regulation_tier: string | null;
  is_published: boolean;
  status: string | null;
};

type SanityReview = {
  _id: string;
  brokerUuid: string;
  status: 'draft' | 'published';
  _updatedAt: string;
};

type Row = SupabaseBroker & {
  contentStatus: 'published' | 'draft' | 'none';
  reviewId: string | null;
  lastUpdated: string | null;
};

type ContentStatusFilter = 'all' | 'published' | 'draft' | 'none';
type SortKey = 'rank' | 'name' | 'score' | 'updated';

// MTR brand tokens
const MTR = {
  card: '#0F1825',
  inner: '#0A1220',
  border: '#1A2E45',
  borderLight: '#243548',
  text: '#E8EDF4',
  muted: '#7A8FA6',
  green: '#00A86B',
};

export function BrokerDashboard() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const router = useRouter();

  const [brokers, setBrokers] = useState<SupabaseBroker[]>([]);
  const [reviews, setReviews] = useState<SanityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContentStatusFilter>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('rank');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [brokersRes, sanityRes] = await Promise.all([
          fetch('/api/brokers/list'),
          client.fetch<SanityReview[]>(
            `*[_type == "brokerReview"]{ _id, brokerUuid, status, _updatedAt }`
          ),
        ]);

        if (!brokersRes.ok) throw new Error('Failed to fetch brokers');
        const brokersData = await brokersRes.json();

        setBrokers(brokersData.brokers || []);
        setReviews(sanityRes || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [client]);

  const rows: Row[] = useMemo(() => {
    const reviewMap = new Map(reviews.map((r) => [r.brokerUuid, r]));
    return brokers.map((b) => {
      const r = reviewMap.get(b.uuid);
      return {
        ...b,
        reviewId: r?._id || null,
        contentStatus: r ? r.status : 'none',
        lastUpdated: r?._updatedAt || null,
      };
    });
  }, [brokers, reviews]);

  const counts = useMemo(() => {
    const total = rows.length;
    let published = 0, draft = 0, none = 0;
    for (const r of rows) {
      if (r.contentStatus === 'published') published++;
      else if (r.contentStatus === 'draft') draft++;
      else none++;
    }
    return { total, published, draft, none };
  }, [rows]);

  const tiers = useMemo(() => {
    const set = new Set<string>();
    brokers.forEach((b) => b.regulation_tier && set.add(b.regulation_tier));
    return Array.from(set).sort();
  }, [brokers]);

  const filtered = useMemo(() => {
    let result = rows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter((r) => r.contentStatus === filterStatus);
    }
    if (filterTier !== 'all') {
      if (filterTier === 'unrated') result = result.filter((r) => !r.regulation_tier);
      else result = result.filter((r) => r.regulation_tier === filterTier);
    }

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === 'rank') return (a.rank ?? 9999) - (b.rank ?? 9999);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'updated') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      return 0;
    });
    return sorted;
  }, [rows, search, filterStatus, filterTier, sortBy]);

  async function handleCreate(broker: SupabaseBroker) {
    try {
      const doc = await client.create({
        _type: 'brokerReview',
        brokerUuid: broker.uuid,
        brokerName: broker.name,
        status: 'draft',
      });
      router.navigateIntent('edit', { id: doc._id, type: 'brokerReview' });
    } catch (e) {
      alert('Gagal membuat: ' + (e instanceof Error ? e.message : 'unknown'));
    }
  }

  function handleEdit(reviewId: string) {
    router.navigateIntent('edit', { id: reviewId, type: 'brokerReview' });
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" padding={4} style={{ minHeight: 300 }}>
        <Spinner /> <Box marginLeft={3}><Text>Loading...</Text></Box>
      </Flex>
    );
  }

  if (error) {
    return (
      <Card padding={4} tone="critical">
        <Text>Error: {error}</Text>
      </Card>
    );
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        {/* Header counter */}
        <Card
          padding={3}
          radius={2}
          style={{
            background: MTR.card,
            border: `1px solid ${MTR.green}`,
          }}
        >
          <Inline space={4}>
            <Text size={2} weight="semibold" style={{ color: MTR.green }}>
              {counts.total} brokers total
            </Text>
            <Text size={2} style={{ color: MTR.text }}>· {counts.published} published</Text>
            <Text size={2} style={{ color: MTR.text }}>· {counts.draft} drafts</Text>
            <Text size={2} style={{ color: MTR.muted }}>· {counts.none} no content</Text>
          </Inline>
        </Card>

        {/* Filters */}
        <Card
          padding={3}
          radius={2}
          style={{ background: MTR.card, border: `1px solid ${MTR.border}` }}
        >
          <Flex gap={3} wrap="wrap">
            <Box flex={2}>
              <TextInput
                icon={SearchIcon}
                placeholder="Search broker name..."
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
              />
            </Box>
            <Box flex={1}>
              <Select
                value={filterStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.currentTarget.value as ContentStatusFilter)}
              >
                <option value="all">All content status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="none">No content</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Select
                value={filterTier}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterTier(e.currentTarget.value)}
              >
                <option value="all">All tiers</option>
                {tiers.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="unrated">Unrated</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Select
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.currentTarget.value as SortKey)}
              >
                <option value="rank">Sort: Rank</option>
                <option value="name">Sort: Name</option>
                <option value="score">Sort: Score</option>
                <option value="updated">Sort: Last updated</option>
              </Select>
            </Box>
          </Flex>
        </Card>

        {/* Table */}
        <Card
          radius={2}
          overflow="auto"
          style={{ background: MTR.card, border: `1px solid ${MTR.border}` }}
        >
          <Box style={{ minWidth: 900 }}>
            {/* Header row */}
            <Flex
              padding={3}
              style={{
                borderBottom: `1px solid ${MTR.border}`,
                background: MTR.inner,
              }}
            >
              <Box flex={0.5}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Rank</Text></Box>
              <Box flex={2}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Broker</Text></Box>
              <Box flex={0.7}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Score</Text></Box>
              <Box flex={1}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Tier</Text></Box>
              <Box flex={1}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Content</Text></Box>
              <Box flex={1.3}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Last updated</Text></Box>
              <Box flex={1.2}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Action</Text></Box>
            </Flex>

            {filtered.length === 0 ? (
              <Box padding={4}><Text muted>No brokers match the current filters.</Text></Box>
            ) : (
              filtered.map((row) => (
                <Flex
                  key={row.uuid}
                  padding={3}
                  align="center"
                  style={{ borderBottom: `1px solid ${MTR.borderLight}` }}
                >
                  <Box flex={0.5}><Text size={1} style={{ color: MTR.text }}>{row.rank ?? '—'}</Text></Box>
                  <Box flex={2}>
                    <Stack space={1}>
                      <Text size={2} weight="medium" style={{ color: MTR.text }}>{row.name}</Text>
                      {!row.is_published && (
                        <Badge tone="caution" fontSize={0}>Hidden on website</Badge>
                      )}
                    </Stack>
                  </Box>
                  <Box flex={0.7}><Text size={1} style={{ color: MTR.text }}>{row.score ?? '—'}</Text></Box>
                  <Box flex={1}>
                    <Text size={1} style={{ color: MTR.text }}>{row.regulation_tier ?? 'Unrated'}</Text>
                  </Box>
                  <Box flex={1}>
                    {row.contentStatus === 'published' && <Badge tone="positive">🟢 Published</Badge>}
                    {row.contentStatus === 'draft' && <Badge tone="caution">🟡 Draft</Badge>}
                    {row.contentStatus === 'none' && <Badge tone="default">⚪ No content</Badge>}
                  </Box>
                  <Box flex={1.3}>
                    <Text size={1} style={{ color: MTR.muted }}>
                      {row.lastUpdated
                        ? new Date(row.lastUpdated).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })
                        : '—'}
                    </Text>
                  </Box>
                  <Box flex={1.2}>
                    {row.reviewId ? (
                      <Button
                        icon={EditIcon}
                        text="Edit Content"
                        tone="primary"
                        mode="ghost"
                        fontSize={1}
                        onClick={() => handleEdit(row.reviewId!)}
                      />
                    ) : (
                      <Button
                        icon={AddIcon}
                        text="Create Content"
                        tone="primary"
                        fontSize={1}
                        onClick={() => handleCreate(row)}
                      />
                    )}
                  </Box>
                </Flex>
              ))
            )}
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
