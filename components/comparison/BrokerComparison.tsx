'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Broker } from '@/types/broker';

// --- CUSTOM SEARCHABLE DROPDOWN (PENGGANTI SELECT2) ---
function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  slotIndex,
  activeSlot,
  setActiveSlot,
  onClear
}: {
  options: Broker[];
  value: string | null;
  onChange: (slug: string) => void;
  placeholder: string;
  slotIndex: number;
  activeSlot: number | null;
  setActiveSlot: (s: number | null) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = activeSlot === slotIndex;
  
  const selectedBroker = options.find(b => b.slug === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (isOpen) setActiveSlot(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setActiveSlot]);

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      (opt.name || opt.legal_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <div className="mtr-cmp-select-wrap" ref={dropdownRef}>
      <div 
        className={`mtr-custom-select-trigger ${isOpen ? 'is-open' : ''} ${!selectedBroker ? 'is-empty' : ''}`}
        onClick={() => setActiveSlot(isOpen ? null : slotIndex)}
      >
        <span className="mtr-custom-select-icon"></span>
        <span className="truncate">{selectedBroker ? selectedBroker.name : placeholder}</span>
        
        {selectedBroker && (
          <span 
            className="mtr-custom-select-clear"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mtr-custom-select-dropdown">
          <div className="mtr-custom-select-search">
            <input 
              type="text" 
              autoFocus 
              placeholder="Search broker..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mtr-custom-select-list">
            {filteredOptions.length === 0 ? (
              <div className="mtr-custom-select-empty">No brokers found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.slug} 
                  className={`mtr-custom-select-option ${opt.slug === value ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(opt.slug);
                    setActiveSlot(null);
                  }}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPARISON COMPONENT ---
export default function BrokerComparison({ initialBrokers }: { initialBrokers: Broker[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State untuk 3 slot komparasi
  const [selectedSlugs, setSelectedSlugs] = useState<(string | null)[]>([null, null, null]);
  const [activeDropdownSlot, setActiveDropdownSlot] = useState<number | null>(null);

  // Sync dari URL pas load awal
  useEffect(() => {
    const s1 = searchParams.get('broker_1');
    const s2 = searchParams.get('broker_2');
    const s3 = searchParams.get('broker_3');
    setSelectedSlugs([s1 || null, s2 || null, s3 || null]);
  }, [searchParams]);

  const handleSelect = (index: number, slug: string | null) => {
    const newSelected = [...selectedSlugs];
    newSelected[index] = slug;
    
    // Update URL Params biar shareable
    const params = new URLSearchParams(searchParams.toString());
    newSelected.forEach((s, i) => {
      if (s) params.set(`broker_${i + 1}`, s);
      else params.delete(`broker_${i + 1}`);
    });
    
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const getBrokerObj = (slug: string | null) => {
    return initialBrokers.find(b => b.slug === slug) || null;
  };

  const hasAnySelection = selectedSlugs.some(s => s !== null);

  // --- Scroll Effect (Fade mask) ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const leftFadeRef = useRef<HTMLDivElement>(null);
  const rightFadeRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    if (leftFadeRef.current) {
      leftFadeRef.current.style.opacity = scrollLeft <= 4 ? '0' : '1';
    }
    if (rightFadeRef.current) {
      rightFadeRef.current.style.opacity = scrollLeft >= (scrollWidth - clientWidth - 4) ? '0' : '1';
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  // --- Render Helpers ---
  const getDomain = (url?: string | null) => {
    if (!url || url === '-' || url === '--') return '';
    try {
      const obj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return obj.hostname.replace('www.', '');
    } catch { return ''; }
  };

  const renderLogo = (broker: Broker) => {
    const domain = getDomain(broker.website);
    const customLogo = broker.logo_url;
    const fallbackSrc = customLogo || (domain ? `https://logo.clearbit.com/${domain}` : null);
    
    if (fallbackSrc) {
      return (
        <img 
          src={fallbackSrc} 
          alt={broker.name} 
          onError={(e) => {
            if (domain) { e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }
            else { e.currentTarget.style.display = 'none'; }
          }} 
        />
      );
    }
    return <span>{broker.name.charAt(0).toUpperCase()}</span>;
  };

  const renderTier = (tier: string | null | undefined) => {
    if (!tier) return null;
    const t = tier.toLowerCase();
    const className = t.includes('tier-1') || t.includes('tier 1') ? 'mtr-cmp-tier-1' 
                    : t.includes('tier-2') || t.includes('tier 2') ? 'mtr-cmp-tier-2' 
                    : 'mtr-cmp-tier-3';
    return <span className={`mtr-cmp-tier ${className}`}>{tier}</span>;
  };

  const renderAvail = (val: string | null | undefined) => {
    if (!val) return null;
    const isAvail = val.toLowerCase().includes('available') && !val.toLowerCase().includes('not');
    return (
      <span className={`mtr-cmp-avail ${isAvail ? 'mtr-cmp-avail-yes' : 'mtr-cmp-avail-no'}`}>
        {isAvail ? '✓ Available' : '✗ Not Available'}
      </span>
    );
  };

  const renderProsCons = (items: string[] | null | undefined, type: 'pros' | 'cons') => {
    if (!items || items.length === 0) return <span className="mtr-cmp-dash">-</span>;
    return (
      <div className={`mtr-cmp-proscons ${type === 'pros' ? 'mtr-cmp-pros' : 'mtr-cmp-cons'}`}>
        <ul>{items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
      </div>
    );
  };

  return (
    <div className="mtr-cmp-wrap">
      
      {/* TOP SECTION */}
      <div className="mtr-cmp-top">
        <div className="mtr-cmp-hero">
          <h1>Compare Brokers.<br/>Find the <span style={{color: '#00A86B'}}>Right Fit.</span></h1>
          <p>Side-by-side comparison of top brokers based on fees, regulation, platforms, features, and more.</p>
        </div>
        
        <div className="mtr-cmp-selector" id="mtr-cmp-selector-slot">
          <p className="mtr-cmp-selector-label">Compare up to 3 brokers</p>
          <div className="mtr-cmp-dropdowns">
            {[0, 1, 2].map((slotIdx) => (
              <CustomSelect 
                key={slotIdx}
                options={initialBrokers}
                value={selectedSlugs[slotIdx]}
                onChange={(slug) => handleSelect(slotIdx, slug)}
                onClear={() => handleSelect(slotIdx, null)}
                placeholder={`Select Broker ${slotIdx + 1}`}
                slotIndex={slotIdx}
                activeSlot={activeDropdownSlot}
                setActiveSlot={setActiveDropdownSlot}
              />
            ))}
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!hasAnySelection && (
        <div className="mtr-cmp-empty" id="mtr-cmp-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <p>Select a broker above to start comparing</p>
        </div>
      )}

      {/* COMPARISON TABLE */}
      {hasAnySelection && (
        <div className="mtr-cmp-table-outer" id="mtr-cmp-table-outer">
          <div className="mtr-cmp-fade-left" ref={leftFadeRef}></div>
          <div className="mtr-cmp-fade-right" ref={rightFadeRef}></div>
          
          <div className="mtr-cmp-table-scroll" ref={scrollRef} onScroll={handleScroll}>
            <table className="mtr-cmp-table">
              <thead>
                <tr className="mtr-cmp-header-row">
                  <th className="mtr-cmp-th-label-header">Brokers</th>
                  
                  {/* HEADERS UNTUK 3 SLOT */}
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <th key={i} className="mtr-cmp-th-broker mtr-cmp-th-empty"></th>;
                    return (
                      <th key={i} className="mtr-cmp-th-broker">
                        <div className="mtr-cmp-broker-head">
                          <div className="mtr-cmp-broker-identity">
                            <div className="mtr-cmp-broker-logo">{renderLogo(b)}</div>
                            <div className="mtr-cmp-broker-info">
                              <span className="mtr-cmp-broker-name">{b.name}</span>
                              {b.account_type && b.account_type.length > 0 && (
                                <span className="mtr-cmp-broker-type">{b.account_type.slice(0, 2).join(', ')}</span>
                              )}
                            </div>
                          </div>
                          {b.quick_verdict && <span className="mtr-cmp-broker-verdict">{b.quick_verdict}</span>}
                          <div className="mtr-cmp-broker-ctas">
                            <a href={b.affiliate_url || b.website || '#'} target="_blank" rel="nofollow noopener noreferrer" className="mtr-cmp-btn mtr-cmp-btn-primary">Open Account</a>
                            <Link href={`/brokers/${b.slug}`} className="mtr-cmp-btn mtr-cmp-btn-secondary">View Profile</Link>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {/* 1. Min Deposit */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Min. Deposit</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.min_deposit === 0 ? '$0' : (b.min_deposit ? `$${b.min_deposit}` : '-')}</span>
                        {b.min_deposit_note && <span className="mtr-cmp-note">{b.min_deposit_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Max Leverage */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Max. Leverage</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.max_leverage ? `1:${b.max_leverage}` : '-'}</span>
                        {b.leverage_note && <span className="mtr-cmp-note">{b.leverage_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Regulation */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Regulation</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {renderTier(b.regulation_tier)}
                        {b.regulation && b.regulation.length > 0 && (
                          <div className="mtr-cmp-badges">{b.regulation.map((l, x) => <span key={x} className="mtr-cmp-badge mtr-cmp-badge-blue">{l}</span>)}</div>
                        )}
                        {b.regulation_note && <span className="mtr-cmp-note">{b.regulation_note}</span>}
                        {(!b.regulation_tier && (!b.regulation || b.regulation.length === 0)) && <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Broker Type */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Broker Type</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.account_type && b.account_type.length > 0 ? (
                          <div className="mtr-cmp-badges">{b.account_type.map((t, x) => <span key={x} className="mtr-cmp-badge mtr-cmp-badge-green">{t}</span>)}</div>
                        ) : <span className="mtr-cmp-dash">-</span>}
                        {b.broker_type_note && <span className="mtr-cmp-note">{b.broker_type_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Copy Trading */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Copy Trading</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.copy_trading ? renderAvail(b.copy_trading) : <span className="mtr-cmp-dash">-</span>}
                        {b.copy_trading_note && <span className="mtr-cmp-note">{b.copy_trading_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Founded */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Founded</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.founded_approx || '-'}</span>
                        {b.founded_note && <span className="mtr-cmp-note">{b.founded_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Spreads From */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Spreads From</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.spreads_from || '-'}</span>
                        {b.spreads_note && <span className="mtr-cmp-note">{b.spreads_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Withdrawal Time */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Withdrawal Time</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.withdrawal_time || '-'}</span>
                        {b.withdrawal_note && <span className="mtr-cmp-note">{b.withdrawal_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 9. Instruments */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Instruments</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        <span className="mtr-cmp-val">{b.instruments || '-'}</span>
                        {b.instruments_note && <span className="mtr-cmp-note">{b.instruments_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 10. Demo Account */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Demo Account</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.demo_account ? renderAvail(b.demo_account) : <span className="mtr-cmp-dash">-</span>}
                        {b.demo_account_note && <span className="mtr-cmp-note">{b.demo_account_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 11. Platforms */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Trading Platforms</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.platforms && b.platforms.length > 0 ? (
                          <div className="mtr-cmp-platforms">
                            {b.platforms.map((p, x) => <span key={x} className="mtr-cmp-platform">{p}</span>)}
                          </div>
                        ) : <span className="mtr-cmp-dash">-</span>}
                        {b.platform_note && <span className="mtr-cmp-note">{b.platform_note}</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 12. Payment Methods */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Payment Methods</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.payment_methods && b.payment_methods.length > 0 ? (
                          <div className="mtr-cmp-badges">
                            {b.payment_methods.map((p, x) => <span key={x} className="mtr-cmp-badge mtr-cmp-badge-blue">{p}</span>)}
                          </div>
                        ) : <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 13. Registered Country */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Registered Country</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td mtr-cmp-td-center">
                        <span className="mtr-cmp-val">{b.hq_country || '-'}</span>
                      </td>
                    );
                  })}
                </tr>

                {/* 14. Bonuses */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Bonus & Promotions</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.offer_title ? (
                          <div className="mtr-cmp-bonus">
                            <span className="mtr-cmp-bonus-title">{b.offer_title}</span>
                            {(b.offer_desc || b.offer_note) && <span className="mtr-cmp-note">{b.offer_desc || b.offer_note}</span>}
                          </div>
                        ) : <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 15. Trustpilot Score */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Trustpilot Score</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.trust_pilot_score ? (
                          <span className="mtr-cmp-trustpilot">
                            <span className="mtr-cmp-score-num">{b.trust_pilot_score}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5A623" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                            <span className="mtr-cmp-score-sub">/ 5</span>
                          </span>
                        ) : <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 16. Overall Score */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Overall Score</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.score ? (
                          <span className="mtr-cmp-overall-score">{b.score}<span className="mtr-cmp-score-sub"> / 10</span></span>
                        ) : <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 17. Quick Verdict */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Quick Verdict</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td">
                        {b.quick_verdict ? <span className="mtr-cmp-verdict">{b.quick_verdict}</span> : <span className="mtr-cmp-dash">-</span>}
                      </td>
                    );
                  })}
                </tr>

                {/* 18. Pros */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Pros</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td mtr-cmp-td-proscons">
                        {renderProsCons(b.pros, 'pros')}
                      </td>
                    );
                  })}
                </tr>

                {/* 19. Cons */}
                <tr className="mtr-cmp-tr">
                  <td className="mtr-cmp-td-label"><span className="mtr-cmp-row-label">Cons</span></td>
                  {[0, 1, 2].map(i => {
                    const b = getBrokerObj(selectedSlugs[i]);
                    if (!b) return <td key={i} className="mtr-cmp-td mtr-cmp-td-empty"><span className="mtr-cmp-dash">-</span></td>;
                    return (
                      <td key={i} className="mtr-cmp-td mtr-cmp-td-proscons">
                        {renderProsCons(b.cons, 'cons')}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <p className="mtr-cmp-disclaimer">Data is for reference only and may change. Please visit the broker's official website for the latest information.</p>
    </div>
  );
}