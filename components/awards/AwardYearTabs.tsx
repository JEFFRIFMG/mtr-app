'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AwardsCarousel from './AwardsCarousel';
import type { AwardYearBlock, AwardWinnerBroker } from '@/types/award';

type Props = {
  years: AwardYearBlock[];
};

const FALLBACK_COLORS = ['#00A86B', '#0066FF', '#7B2FBE', '#E53E3E', '#D69E2E', '#0BC5EA'];

/* =====================================================
   BROKER LOGO — Fallback chain:
   1. Supabase logo_url
   2. Google Favicon (by domain)
   3. Initial circle
   ===================================================== */
function WinnerLogo({ broker }: { broker: AwardWinnerBroker }) {
  const sources = useMemo(() => {
    const chain: string[] = [];
    if (broker.logo_url) chain.push(broker.logo_url);
    if (broker.domain) {
      chain.push(`https://www.google.com/s2/favicons?domain=${broker.domain}&sz=128`);
    }
    return chain;
  }, [broker.logo_url, broker.domain]);

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const advance = () => {
    if (idx < sources.length - 1) {
      setIdx(idx + 1);
    } else {
      setFailed(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= 2 || img.naturalHeight <= 2) {
      advance();
    }
  };

  if (failed || sources.length === 0) {
    const fallbackColor =
      FALLBACK_COLORS[(broker.name.charCodeAt(0) || 0) % FALLBACK_COLORS.length];
    return (
      <div
        className="aw-card-icon"
        style={{
          background: fallbackColor,
          color: '#fff',
          fontWeight: 700,
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
        }}
      >
        {broker.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="aw-card-icon"
      style={{
        padding: 0,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <img
        key={sources[idx]}
        src={sources[idx]}
        onError={advance}
        onLoad={handleLoad}
        alt={broker.name}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}

export default function AwardYearTabs({ years }: Props) {
  const [activeYear, setActiveYear] = useState<number>(years[0]?.year ?? 0);

  const activeBlock = years.find((y) => y.year === activeYear) ?? years[0];
  if (!activeBlock) return null;

  return (
    <section className="aw-categories" id="award-categories">
      {/* Header */}
      <div className="aw-cat-header">
        <div>
          <p className="aw-cat-eyebrow">{activeBlock.year} Award Categories</p>
          <h2 className="aw-cat-title">
            {activeBlock.categories_count} Categories.{' '}
            <span className="aw-green">One Standard.</span>
          </h2>
        </div>
        <p className="aw-cat-desc">
          Winners are determined through independent research, live testing, and editorial review.
        </p>
      </div>

      {/* Year tabs */}
      {years.length > 1 && (
        <div className="aw-year-tabs">
          {years.map((y) => (
            <button
              key={y.year}
              type="button"
              onClick={() => setActiveYear(y.year)}
              className={`aw-year-tab${y.year === activeYear ? ' aw-year-tab-active' : ''}`}
              aria-selected={y.year === activeYear}
            >
              {y.year}
            </button>
          ))}
        </div>
      )}

      {/* Active year content */}
      {activeBlock.groups.map((group, groupIndex) => (
        <div className="aw-group" key={`${activeBlock.year}-${group.uuid}`}>
          <div className="aw-group-header">
            <div
              className="aw-group-icon"
              dangerouslySetInnerHTML={{ __html: group.icon_svg ?? '' }}
            />
            <span className="aw-group-name">{group.name}</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">{group.categories.length} awards</span>
          </div>

          <AwardsCarousel carouselId={`${activeBlock.year}-${groupIndex}`}>
            {group.categories.map((cat, catIndex) => {
              const cardNum = String(catIndex + 1).padStart(2, '0');
              const isFirstOfFirstGroup = groupIndex === 0 && catIndex === 0;

              const broker = cat.winner?.broker ?? null;
              const hasWinner = !!broker;

              return (
                <div
                  className={`aw-card${isFirstOfFirstGroup ? ' aw-card-active' : ''}`}
                  key={`${activeBlock.year}-${cat.uuid}`}
                >
                  <div className="aw-card-fold">
                    <span className="aw-card-num">#{cardNum}</span>
                  </div>

                  <div className="aw-card-inner">
                    <div className="aw-card-head">
                      <div className="aw-card-head-left">
                        {/* MERAH — icon kategori (default) atau logo broker (winner) */}
                        {hasWinner ? (
                          <WinnerLogo broker={broker} />
                        ) : (
                          <div
                            className="aw-card-icon"
                            dangerouslySetInnerHTML={{ __html: cat.icon_svg ?? '' }}
                          />
                        )}

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {/* KUNING — nama broker (winner) */}
                          {hasWinner && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'var(--aw-green)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                              }}
                            >
                              {broker.name}
                            </span>
                          )}
                          <h3 className="aw-card-title">{cat.title}</h3>
                        </div>
                      </div>
                    </div>

                    <p className="aw-card-desc">{cat.description}</p>

                    {cat.tags && cat.tags.length > 0 && (
                      <div className="aw-card-tags">
                        {cat.tags.map((t, ti) => (
                          <span className="aw-tag" key={ti}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FOOTER — Winner TBA (default) atau button CTA View Profile (winner) */}
                  <div className="aw-card-footer">
                    {hasWinner ? (
                      <Link
                        href={`/brokers/${broker.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--aw-green)',
                          color: 'var(--aw-green)',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: 'transparent',
                          transition: 'background 0.18s, color 0.18s',
                          lineHeight: 1,
                        }}
                      >
                        View Profile
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="aw-winner">
                        <span className="aw-winner-dot"></span>
                        Winner TBA
                      </span>
                    )}
                    <span className="aw-season">{activeBlock.year} Season</span>
                  </div>
                </div>
              );
            })}
          </AwardsCarousel>
        </div>
      ))}
    </section>
  );
}
