import { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import {
  Card, Stack, Flex, Text, Badge, Button, TextInput, Select, Box, Spinner, Inline,
} from '@sanity/ui';
import { AddIcon, EditIcon, SearchIcon } from '@sanity/icons';

type CategoryRef = { _id: string; name: string; slug: string };

type SanityBlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  status: 'draft' | 'published';
  publishedAt: string | null;
  _updatedAt: string;
  categories: CategoryRef[] | null;
  authorName: string | null;
  featuredImageUrl: string | null;
};

type StatusFilter = 'all' | 'published' | 'draft';
type SortKey = 'updated' | 'published' | 'title';

const MTR = {
  card: '#0F1825',
  inner: '#0A1220',
  border: '#1A2E45',
  borderLight: '#243548',
  text: '#E8EDF4',
  muted: '#7A8FA6',
  green: '#00A86B',
};

export function BlogPostDashboard() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const router = useRouter();

  const [posts, setPosts] = useState<SanityBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('updated');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.fetch<SanityBlogPost[]>(
          `*[_type == "blogPost"]{
            _id,
            title,
            slug,
            status,
            publishedAt,
            _updatedAt,
            "categories": categories[]->{ _id, name, "slug": slug.current },
            "authorName": author->name,
            "featuredImageUrl": featuredImage.asset->url
          }`
        );
        setPosts(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [client]);

  const counts = useMemo(() => {
    const total = posts.length;
    let published = 0, draft = 0;
    for (const p of posts) {
      if (p.status === 'published') published++;
      else draft++;
    }
    return { total, published, draft };
  }, [posts]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => {
      p.categories?.forEach((c) => {
        if (c.slug && !map.has(c.slug)) map.set(c.slug, c.name);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slug, name]) => ({ slug, name }));
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }
    if (filterCategory !== 'all') {
      if (filterCategory === 'none') {
        result = result.filter((p) => !p.categories || p.categories.length === 0);
      } else {
        result = result.filter((p) =>
          p.categories?.some((c) => c.slug === filterCategory)
        );
      }
    }

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === 'updated') return (b._updatedAt || '').localeCompare(a._updatedAt || '');
      if (sortBy === 'published') return (b.publishedAt || '').localeCompare(a.publishedAt || '');
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    return sorted;
  }, [posts, search, filterStatus, filterCategory, sortBy]);

  async function handleCreate() {
    try {
      const doc = await client.create({
        _type: 'blogPost',
        status: 'draft',
        commentsEnabled: true,
        schemaType: 'BlogPosting',
        noIndex: false,
      });
      router.navigateIntent('edit', { id: doc._id, type: 'blogPost' });
    } catch (e) {
      alert('Failed to create: ' + (e instanceof Error ? e.message : 'unknown'));
    }
  }

  function handleEdit(id: string) {
    router.navigateIntent('edit', { id, type: 'blogPost' });
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
        <Flex gap={3} align="center" wrap="wrap">
          <Box flex={1}>
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
                  {counts.total} posts total
                </Text>
                <Text size={2} style={{ color: MTR.text }}>· {counts.published} published</Text>
                <Text size={2} style={{ color: MTR.muted }}>· {counts.draft} drafts</Text>
              </Inline>
            </Card>
          </Box>
          <Button
            icon={AddIcon}
            text="Create New Post"
            tone="primary"
            onClick={handleCreate}
          />
        </Flex>

        <Card
          padding={3}
          radius={2}
          style={{ background: MTR.card, border: `1px solid ${MTR.border}` }}
        >
          <Flex gap={3} wrap="wrap">
            <Box flex={2}>
              <TextInput
                icon={SearchIcon}
                placeholder="Search post title..."
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
              />
            </Box>
            <Box flex={1}>
              <Select
                value={filterStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.currentTarget.value as StatusFilter)}
              >
                <option value="all">All status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Select
                value={filterCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.currentTarget.value)}
              >
                <option value="all">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
                <option value="none">Uncategorized</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Select
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.currentTarget.value as SortKey)}
              >
                <option value="updated">Sort: Last updated</option>
                <option value="published">Sort: Published date</option>
                <option value="title">Sort: Title</option>
              </Select>
            </Box>
          </Flex>
        </Card>

        <Card
          radius={2}
          overflow="auto"
          style={{ background: MTR.card, border: `1px solid ${MTR.border}` }}
        >
          <Box style={{ minWidth: 900 }}>
            <Flex
              padding={3}
              style={{
                borderBottom: `1px solid ${MTR.border}`,
                background: MTR.inner,
              }}
            >
              <Box flex={3}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Post</Text></Box>
              <Box flex={1.5}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Categories</Text></Box>
              <Box flex={1.2}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Author</Text></Box>
              <Box flex={1}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Status</Text></Box>
              <Box flex={1.3}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Last updated</Text></Box>
              <Box flex={1}><Text size={1} weight="semibold" style={{ color: MTR.muted }}>Action</Text></Box>
            </Flex>

            {filtered.length === 0 ? (
              <Box padding={4}>
                <Text muted>
                  {posts.length === 0
                    ? 'No blog posts yet. Click "Create New Post" to start.'
                    : 'No posts match the current filters.'}
                </Text>
              </Box>
            ) : (
              filtered.map((row) => (
                <Flex
                  key={row._id}
                  padding={3}
                  align="center"
                  style={{ borderBottom: `1px solid ${MTR.borderLight}` }}
                >
                  <Box flex={3}>
                    <Flex gap={3} align="center">
                      {row.featuredImageUrl ? (
                        <img
                          src={row.featuredImageUrl}
                          alt=""
                          style={{
                            width: 56,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 4,
                            background: MTR.inner,
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            width: 56,
                            height: 40,
                            background: MTR.inner,
                            borderRadius: 4,
                            border: `1px solid ${MTR.border}`,
                          }}
                        />
                      )}
                      <Stack space={1}>
                        <Text size={2} weight="medium" style={{ color: MTR.text }}>
                          {row.title || '(Untitled)'}
                        </Text>
                        {row.slug?.current && (
                          <Text size={1} style={{ color: MTR.muted }}>
                            /{row.slug.current}
                          </Text>
                        )}
                      </Stack>
                    </Flex>
                  </Box>
                  <Box flex={1.5}>
                    <Inline space={1}>
                      {row.categories && row.categories.length > 0 ? (
                        row.categories.map((c) => (
                          <Badge key={c._id} tone="primary" fontSize={0}>
                            {c.name}
                          </Badge>
                        ))
                      ) : (
                        <Text size={1} style={{ color: MTR.muted }}>—</Text>
                      )}
                    </Inline>
                  </Box>
                  <Box flex={1.2}>
                    <Text size={1} style={{ color: MTR.text }}>{row.authorName ?? '—'}</Text>
                  </Box>
                  <Box flex={1}>
                    {row.status === 'published' && <Badge tone="positive">🟢 Published</Badge>}
                    {row.status === 'draft' && <Badge tone="caution">🟡 Draft</Badge>}
                  </Box>
                  <Box flex={1.3}>
                    <Text size={1} style={{ color: MTR.muted }}>
                      {row._updatedAt
                        ? new Date(row._updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })
                        : '—'}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <Button
                      icon={EditIcon}
                      text="Edit"
                      tone="primary"
                      mode="ghost"
                      fontSize={1}
                      onClick={() => handleEdit(row._id)}
                    />
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
