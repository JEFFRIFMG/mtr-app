'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================
type Broker = { uuid: string; name: string; slug: string; logo_url: string | null };
type Group = { uuid: string; name: string; slug?: string; sort_order: number };
type Category = {
  uuid: string; slug: string; title: string; description: string;
  sort_order: number; group_id: string; group: Group | Group[] | null;
};
type WinnerRow = {
  uuid: string; category_id: string; broker_uuid: string | null;
  year: number; announced_at: string | null;
  category: Category | Category[] | null;
  broker: Broker | Broker[] | null;
};
type AvailableCategory = { uuid: string; title: string; group_name: string };
type GroupMaster = { uuid: string; slug: string; name: string; icon_svg: string | null; sort_order: number };
type IconMaster = { uuid: string; slug: string; label: string; svg: string; category: string | null };

type Props = { initialYear: number };

function unwrap<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// ============================================================================
// ICON PICKER (reusable component)
// ============================================================================
function IconPicker({
  icons,
  selectedSvg,
  onSelect,
}: {
  icons: IconMaster[];
  selectedSvg: string;
  onSelect: (svg: string) => void;
}) {
  if (icons.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--mtr-muted)' }}>
        No icons in library yet. Ask dev to seed icons.
      </p>
    );
  }

  return (
    <div
      className="rounded p-2 grid gap-2"
      style={{
        background: 'var(--mtr-inner)',
        border: '1px solid var(--mtr-border)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
        maxHeight: '240px',
        overflowY: 'auto',
      }}
    >
      {icons.map((ic) => {
        const isActive = selectedSvg === ic.svg;
        return (
          <button
            key={ic.uuid}
            type="button"
            onClick={() => onSelect(isActive ? '' : ic.svg)}
            title={ic.label}
            className="flex items-center justify-center rounded p-2 transition"
            style={{
              background: isActive ? 'var(--mtr-green-glow)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--mtr-green)' : 'var(--mtr-border)'}`,
              aspectRatio: '1 / 1',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                width: '24px',
                height: '24px',
                color: isActive ? 'var(--mtr-green)' : 'var(--mtr-text)',
              }}
              dangerouslySetInnerHTML={{ __html: ic.svg }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function AwardsTable({ initialYear }: Props) {
  const [year, setYear] = useState<number>(initialYear);
  const [years, setYears] = useState<number[]>([]);
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [available, setAvailable] = useState<AvailableCategory[]>([]);
  const [groupsMaster, setGroupsMaster] = useState<GroupMaster[]>([]);
  const [iconsMaster, setIconsMaster] = useState<IconMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  // Setup new year
  const [newYearInput, setNewYearInput] = useState<string>('');
  const [sourceYear, setSourceYear] = useState<string>('');

  // Add category modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'pick' | 'create'>('pick');
  const [addCategoryId, setAddCategoryId] = useState<string>('');
  // Create form
  const [newCatGroup, setNewCatGroup] = useState<string>('');
  const [newCatTitle, setNewCatTitle] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [newCatTags, setNewCatTags] = useState<string>('');
  const [newCatIconSvg, setNewCatIconSvg] = useState<string>('');

  // Add group modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupIcon, setNewGroupIcon] = useState<string>('');

  // Broker dropdown state per-row
  const [brokerSearchRow, setBrokerSearchRow] = useState<string | null>(null);
  const [brokerQuery, setBrokerQuery] = useState<string>('');
  const [brokerResults, setBrokerResults] = useState<Broker[]>([]);

  // ============================================================================
  // FETCHERS
  // ============================================================================
  const fetchAll = useCallback(async (y: number) => {
    setLoading(true);
    setMsg(null);
    try {
      const [winnersRes, metaRes, groupsRes, iconsRes] = await Promise.all([
        fetch(`/api/admin/awards/winners?year=${y}`),
        fetch(`/api/admin/awards/meta?year=${y}`),
        fetch(`/api/admin/awards/groups`),
        fetch(`/api/admin/awards/icons`),
      ]);
      const winnersJson = await winnersRes.json();
      const metaJson = await metaRes.json();
      const groupsJson = await groupsRes.json();
      const iconsJson = await iconsRes.json();

      setRows(winnersJson.winners ?? []);
      setYears(metaJson.years ?? []);
      setAvailable(metaJson.available_categories ?? []);
      setGroupsMaster(groupsJson.groups ?? []);
      setIconsMaster(iconsJson.icons ?? []);
    } catch (e) {
      console.error(e);
      setMsg({ text: 'Failed to fetch data', tone: 'err' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(year); }, [year, fetchAll]);

  // Filter icons by category for picker convenience
  const groupIcons = useMemo(
    () => iconsMaster.filter((i) => i.category === 'group' || i.category === null),
    [iconsMaster]
  );
  const categoryIcons = useMemo(
    () => iconsMaster.filter((i) => i.category === 'category' || i.category === 'utility' || i.category === null),
    [iconsMaster]
  );

  // ============================================================================
  // DERIVED
  // ============================================================================
  const grouped = useMemo(() => {
    const map = new Map<string, { groupName: string; sortOrder: number; rows: WinnerRow[] }>();
    for (const r of rows) {
      const cat = unwrap(r.category);
      const grp = unwrap(cat?.group ?? null);
      const key = grp?.uuid ?? 'unknown';
      const groupName = grp?.name ?? 'Unknown';
      const sortOrder = grp?.sort_order ?? 999;
      if (!map.has(key)) map.set(key, { groupName, sortOrder, rows: [] });
      map.get(key)!.rows.push(r);
    }
    const arr = Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    for (const g of arr) {
      g.rows.sort((a, b) => {
        const ca = unwrap(a.category);
        const cb = unwrap(b.category);
        return (ca?.sort_order ?? 0) - (cb?.sort_order ?? 0);
      });
    }
    return arr;
  }, [rows]);

  // ============================================================================
  // ACTIONS
  // ============================================================================
  async function handleSetupSeason() {
    const y = parseInt(newYearInput, 10);
    if (!y || isNaN(y)) { setMsg({ text: 'Enter a valid year', tone: 'err' }); return; }
    setLoading(true); setMsg(null);
    try {
      const payload: { year: number; source_year?: number } = { year: y };
      const src = parseInt(sourceYear, 10);
      if (src && !isNaN(src)) payload.source_year = src;

      const res = await fetch('/api/admin/awards/winners/setup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Setup failed');

      setMsg({ text: `Setup ${y}: ${json.inserted_count} categories inserted`, tone: 'ok' });
      setNewYearInput(''); setSourceYear(''); setYear(y);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function handleAssignWinner(winnerUuid: string, brokerUuid: string | null) {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/awards/winners/${winnerUuid}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker_uuid: brokerUuid }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json.error ?? 'Update failed'); }
      setMsg({ text: brokerUuid ? 'Winner assigned' : 'Winner cleared (back to TBA)', tone: 'ok' });
      setBrokerSearchRow(null); setBrokerQuery(''); setBrokerResults([]);
      await fetchAll(year);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function handleRemoveFromYear(winnerUuid: string, categoryTitle: string) {
    if (!confirm(`Remove "${categoryTitle}" from ${year}? Data tahun lain ga keganggu.`)) return;
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/awards/winners/${winnerUuid}`, { method: 'DELETE' });
      if (!res.ok) { const json = await res.json(); throw new Error(json.error ?? 'Delete failed'); }
      setMsg({ text: `Removed from ${year}`, tone: 'ok' });
      await fetchAll(year);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function handleAddExistingToYear() {
    if (!addCategoryId) return;
    setLoading(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/awards/winners', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: addCategoryId, year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Add failed');

      setMsg({ text: 'Category added to year', tone: 'ok' });
      closeAddModal();
      await fetchAll(year);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function handleCreateNewCategory() {
    if (!newCatGroup || !newCatTitle.trim() || !newCatDesc.trim()) {
      setMsg({ text: 'Group, title, and description are required', tone: 'err' }); return;
    }
    setLoading(true); setMsg(null);
    try {
      const tags = newCatTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      const res = await fetch('/api/admin/awards/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: newCatGroup, slug: slugify(newCatTitle),
          title: newCatTitle.trim(), description: newCatDesc.trim(),
          icon_svg: newCatIconSvg.trim() || null,
          tags: tags.length > 0 ? tags : null,
          add_to_year: year,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Create failed');

      setMsg({ text: `Category "${newCatTitle}" created and added to ${year}`, tone: 'ok' });
      closeAddModal();
      await fetchAll(year);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) { setMsg({ text: 'Group name required', tone: 'err' }); return; }
    setLoading(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/awards/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugify(newGroupName), name: newGroupName.trim(),
          icon_svg: newGroupIcon.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Create failed');

      setMsg({ text: `Group "${newGroupName}" created`, tone: 'ok' });
      setShowGroupModal(false); setNewGroupName(''); setNewGroupIcon('');
      await fetchAll(year);
    } catch (e) { setMsg({ text: (e as Error).message, tone: 'err' }); }
    finally { setLoading(false); }
  }

  async function searchBrokers(q: string) {
    setBrokerQuery(q);
    try {
      const res = await fetch(`/api/admin/awards/brokers-search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setBrokerResults(json.brokers ?? []);
    } catch (e) { console.error(e); }
  }

  function closeAddModal() {
    setShowAddModal(false); setAddMode('pick'); setAddCategoryId('');
    setNewCatGroup(''); setNewCatTitle(''); setNewCatDesc('');
    setNewCatTags(''); setNewCatIconSvg('');
  }

  // ============================================================================
  // STYLES
  // ============================================================================
  const card: React.CSSProperties = { background: 'var(--mtr-card)', border: '1px solid var(--mtr-border)', borderRadius: 'var(--mtr-radius)' };
  const innerBox: React.CSSProperties = { background: 'var(--mtr-inner)', border: '1px solid var(--mtr-border)', color: 'var(--mtr-text)' };
  const btnPrimary: React.CSSProperties = { background: 'var(--mtr-green)', color: '#fff', border: 0 };
  const btnDanger: React.CSSProperties = { background: 'rgba(229, 62, 62, 0.2)', color: 'var(--mtr-red)', border: '1px solid rgba(229, 62, 62, 0.4)' };
  const btnWarn: React.CSSProperties = { background: 'rgba(214, 158, 46, 0.15)', color: 'var(--mtr-amber)', border: '1px solid rgba(214, 158, 46, 0.4)' };
  const btnNeutral: React.CSSProperties = { background: 'var(--mtr-border)', color: 'var(--mtr-text)', border: 0 };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Awards — Manage Winners</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mtr-muted)' }}>
            Setup season, assign winners, manage categories per year.
          </p>
        </div>
        <button onClick={() => setShowGroupModal(true)} className="px-3 py-2 rounded text-sm font-medium" style={btnNeutral}>
          + Add Group
        </button>
      </div>

      {/* YEAR CONTROLS */}
      <div className="rounded-xl p-5 mb-6 flex flex-wrap gap-6" style={card}>
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--mtr-muted)' }}>Manage Year</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} className="px-3 py-2 rounded text-sm min-w-[140px]" style={innerBox}>
            {years.length === 0 && <option value={year}>{year}</option>}
            {years.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>

        <div className="flex-1" style={{ borderLeft: '1px solid var(--mtr-border)', paddingLeft: '24px' }}>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--mtr-muted)' }}>Setup New Year</label>
          <div className="flex gap-2 flex-wrap items-center">
            <input type="number" placeholder="e.g. 2027" value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} className="px-3 py-2 rounded text-sm w-32" style={innerBox} />
            <select value={sourceYear} onChange={(e) => setSourceYear(e.target.value)} className="px-3 py-2 rounded text-sm" style={innerBox}>
              <option value="">From all master</option>
              {years.map((y) => (<option key={y} value={y}>Copy from {y}</option>))}
            </select>
            <button onClick={handleSetupSeason} disabled={loading || !newYearInput} className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-50" style={btnPrimary}>
              Setup Season
            </button>
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {msg && (
        <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{
          background: msg.tone === 'ok' ? 'rgba(0, 168, 107, 0.1)' : 'rgba(229, 62, 62, 0.1)',
          borderLeft: `4px solid ${msg.tone === 'ok' ? 'var(--mtr-green)' : 'var(--mtr-red)'}`,
          color: msg.tone === 'ok' ? 'var(--mtr-green)' : 'var(--mtr-red)',
        }}>{msg.text}</div>
      )}

      {/* SEASON HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Season {year}</h2>
        <button onClick={() => setShowAddModal(true)} className="px-3 py-2 rounded text-sm font-medium" style={btnPrimary}>
          + Add Category to {year}
        </button>
      </div>

      {loading && (<p className="text-sm mb-4" style={{ color: 'var(--mtr-muted)' }}>Loading...</p>)}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl p-10 text-center" style={card}>
          <p className="mb-2" style={{ color: 'var(--mtr-text)' }}>No categories set up for {year} yet.</p>
          <p className="text-sm" style={{ color: 'var(--mtr-muted)' }}>Use &quot;Setup New Year&quot; above to initialize this year.</p>
        </div>
      )}

      {/* GROUPED TABLES */}
      {grouped.map((g) => (
        <div key={g.groupName} className="mb-6 rounded-xl overflow-hidden" style={card}>
          <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--mtr-border)' }}>
            <h3 className="text-base font-semibold" style={{ color: 'var(--mtr-green)' }}>{g.groupName}</h3>
            <span className="text-xs" style={{ color: 'var(--mtr-muted)' }}>{g.rows.length} {g.rows.length === 1 ? 'award' : 'awards'}</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--mtr-inner)', color: 'var(--mtr-muted)' }}>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Winner</th>
                <th className="text-left p-3 font-medium" style={{ width: '380px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => {
                const cat = unwrap(r.category);
                const broker = unwrap(r.broker);
                const isEditing = brokerSearchRow === r.uuid;
                return (
                  <tr key={r.uuid} style={{ borderTop: '1px solid var(--mtr-border)' }}>
                    <td className="p-3 font-medium">{cat?.title}</td>
                    <td className="p-3">
                      {broker ? (
                        <span className="font-semibold" style={{ color: 'var(--mtr-green)' }}>{broker.name}</span>
                      ) : (
                        <span style={{ color: 'var(--mtr-muted)' }}>Winner TBA</span>
                      )}
                    </td>
                    <td className="p-3">
                      {!isEditing ? (
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => { setBrokerSearchRow(r.uuid); setBrokerQuery(''); searchBrokers(''); }} className="px-3 py-1.5 rounded text-xs font-medium" style={btnNeutral}>
                            {broker ? 'Change Winner' : 'Assign Winner'}
                          </button>
                          {broker && (
                            <button onClick={() => handleAssignWinner(r.uuid, null)} className="px-3 py-1.5 rounded text-xs font-medium" style={btnWarn}>
                              Clear (TBA)
                            </button>
                          )}
                          <button onClick={() => handleRemoveFromYear(r.uuid, cat?.title ?? '')} className="px-3 py-1.5 rounded text-xs font-medium" style={btnDanger}>
                            Remove from {year}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <input type="text" placeholder="Search broker..." value={brokerQuery} onChange={(e) => searchBrokers(e.target.value)} autoFocus className="px-2 py-1.5 rounded text-xs" style={innerBox} />
                          <div className="rounded overflow-y-auto" style={{ ...innerBox, maxHeight: '180px' }}>
                            {brokerResults.map((b) => (
                              <div key={b.uuid} onClick={() => handleAssignWinner(r.uuid, b.uuid)} className="px-2 py-1.5 text-xs cursor-pointer hover:opacity-80" style={{ borderBottom: '1px solid var(--mtr-border)' }}>
                                {b.name}
                              </div>
                            ))}
                            {brokerResults.length === 0 && (<div className="px-2 py-2 text-xs" style={{ color: 'var(--mtr-muted)' }}>No results</div>)}
                          </div>
                          <button onClick={() => { setBrokerSearchRow(null); setBrokerQuery(''); setBrokerResults([]); }} className="px-2 py-1 rounded text-xs" style={btnNeutral}>Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <Modal onClose={closeAddModal}>
          <h3 className="text-lg font-bold mb-1">Add Category to {year}</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--mtr-muted)' }}>Pick from master, or create a new one.</p>

          <div className="flex gap-1 mb-4 p-1 rounded" style={innerBox}>
            <button onClick={() => setAddMode('pick')} className="flex-1 px-3 py-1.5 rounded text-xs font-medium" style={addMode === 'pick' ? btnPrimary : { background: 'transparent', color: 'var(--mtr-muted)', border: 0 }}>Pick Existing</button>
            <button onClick={() => setAddMode('create')} className="flex-1 px-3 py-1.5 rounded text-xs font-medium" style={addMode === 'create' ? btnPrimary : { background: 'transparent', color: 'var(--mtr-muted)', border: 0 }}>Create New</button>
          </div>

          {addMode === 'pick' && (
            <>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Category (not yet in {year})</label>
              <select value={addCategoryId} onChange={(e) => setAddCategoryId(e.target.value)} className="w-full px-3 py-2 rounded text-sm mb-4" style={innerBox}>
                <option value="">-- Select category --</option>
                {available.map((c) => (<option key={c.uuid} value={c.uuid}>[{c.group_name}] {c.title}</option>))}
              </select>
              {available.length === 0 && (<p className="text-xs mb-4" style={{ color: 'var(--mtr-muted)' }}>All master categories are already in {year}. Switch to &quot;Create New&quot; to add a new one.</p>)}
              <div className="flex justify-end gap-2">
                <button onClick={closeAddModal} className="px-4 py-2 rounded text-sm" style={btnNeutral}>Cancel</button>
                <button onClick={handleAddExistingToYear} disabled={!addCategoryId || loading} className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-50" style={btnPrimary}>Add</button>
              </div>
            </>
          )}

          {addMode === 'create' && (
            <>
              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Group <span style={{ color: 'var(--mtr-red)' }}>*</span></label>
                  <select value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={innerBox}>
                    <option value="">-- Select group --</option>
                    {groupsMaster.map((g) => (<option key={g.uuid} value={g.uuid}>{g.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Title <span style={{ color: 'var(--mtr-red)' }}>*</span></label>
                  <input type="text" placeholder="Best Crypto Broker" value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={innerBox} />
                  {newCatTitle && (<p className="text-xs mt-1" style={{ color: 'var(--mtr-muted)' }}>slug: {slugify(newCatTitle)}</p>)}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Description <span style={{ color: 'var(--mtr-red)' }}>*</span></label>
                  <textarea placeholder="What this award recognises..." value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded text-sm resize-y" style={innerBox} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Tags (comma-separated)</label>
                  <input type="text" placeholder="Spreads, Liquidity, Execution" value={newCatTags} onChange={(e) => setNewCatTags(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={innerBox} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--mtr-muted)' }}>
                    Icon <span className="text-xs" style={{ color: 'var(--mtr-muted)' }}>(click to select, click again to deselect)</span>
                  </label>
                  <IconPicker icons={categoryIcons} selectedSvg={newCatIconSvg} onSelect={setNewCatIconSvg} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={closeAddModal} className="px-4 py-2 rounded text-sm" style={btnNeutral}>Cancel</button>
                <button onClick={handleCreateNewCategory} disabled={loading} className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-50" style={btnPrimary}>Create & Add to {year}</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ADD GROUP MODAL */}
      {showGroupModal && (
        <Modal onClose={() => { setShowGroupModal(false); setNewGroupName(''); setNewGroupIcon(''); }}>
          <h3 className="text-lg font-bold mb-1">Add New Group</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--mtr-muted)' }}>Groups organize categories on the public page.</p>

          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--mtr-muted)' }}>Group Name <span style={{ color: 'var(--mtr-red)' }}>*</span></label>
              <input type="text" placeholder="Trading Excellence" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={innerBox} />
              {newGroupName && (<p className="text-xs mt-1" style={{ color: 'var(--mtr-muted)' }}>slug: {slugify(newGroupName)}</p>)}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--mtr-muted)' }}>
                Icon <span className="text-xs" style={{ color: 'var(--mtr-muted)' }}>(click to select)</span>
              </label>
              <IconPicker icons={groupIcons} selectedSvg={newGroupIcon} onSelect={setNewGroupIcon} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowGroupModal(false); setNewGroupName(''); setNewGroupIcon(''); }} className="px-4 py-2 rounded text-sm" style={btnNeutral}>Cancel</button>
            <button onClick={handleCreateGroup} disabled={loading || !newGroupName.trim()} className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-50" style={btnPrimary}>Create Group</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// MODAL SHELL
// ============================================================================
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-xl p-6 w-full max-w-lg" style={{
        background: 'var(--mtr-card)', border: '1px solid var(--mtr-border)',
        color: 'var(--mtr-text)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  );
}
