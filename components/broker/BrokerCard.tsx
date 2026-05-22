'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { hasVoted as checkHasVoted, submitVote } from '@/lib/vote/useVoteRealtime';
import { Tooltip } from '@/components/ui/Tooltip';

interface BrokerCardProps {
  broker: any;
  rank: number;
  idx: number;
  liveCount?: number;
  medal?: 'gold' | 'silver' | 'bronze' | null;
}

const MTR_COLORS = ['#00A86B','#0066FF','#7B2FBE','#E53E3E','#D69E2E','#0BC5EA','#F6AD55','#68D391','#F687B3','#76E4F7'];

const formatVotes = (n: number): string => {
  if (n < 1000) return n.toString();
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n < 1000000) return Math.floor(n / 1000) + 'K';
  if (n < 10000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return Math.floor(n / 1000000) + 'M';
};

/* =====================================================
   BROKER LOGO — Fallback chain: Supabase → Clearbit → Google Favicon → Initial
   Detect Clearbit placeholder/empty response via onLoad dimension check
   ===================================================== */
function BrokerLogo({ customLogo, domain, brokerName, color }: {
  customLogo: string | null;
  domain: string;
  brokerName: string;
  color: string;
}) {
  const sources = useMemo(() => {
    const chain: string[] = [];
    if (customLogo) chain.push(customLogo);
    if (domain) {
      chain.push(`https://logo.clearbit.com/${domain}`);
      chain.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    }
    return chain;
  }, [customLogo, domain]);

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIdx(0);
    setFailed(false);
  }, [customLogo, domain]);

  const advance = () => {
    if (idx < sources.length - 1) {
      setIdx(idx + 1);
    } else {
      setFailed(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Clearbit/empty placeholder detection: real logos are >2px
    if (img.naturalWidth <= 2 || img.naturalHeight <= 2) {
      advance();
    }
  };

  if (failed || sources.length === 0) {
    return (
      <div className="mtr-logo-col">
        <div className="mtr-logo-circle" style={{ background: color }}>
          {brokerName.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="mtr-logo-col">
      <img
        key={sources[idx]}
        src={sources[idx]}
        onError={advance}
        onLoad={handleLoad}
        className="mtr-logo-img"
        alt={brokerName}
      />
    </div>
  );
}

export default function BrokerCard({ broker, rank, idx, liveCount, medal }: BrokerCardProps) {
  const [votes, setVotes] = useState<number>(broker.total_votes ?? 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const isInst = broker.status === 'institution';
  const score = parseFloat(broker.score) || 0;
  const color = (broker.color && broker.color !== '--') ? broker.color : MTR_COLORS[idx % MTR_COLORS.length];
  const brokerName = broker.name || broker.legal_name || 'Unknown';

  useEffect(() => {
    if (broker.uuid) setHasVoted(checkHasVoted(broker.uuid));
  }, [broker.uuid]);

  useEffect(() => {
    if (typeof liveCount === 'number') setVotes(liveCount);
  }, [liveCount]);

  const handleVote = async () => {
    if (hasVoted || isVoting || !broker.uuid) return;
    setIsVoting(true);
    setVotes(v => v + 1);
    setHasVoted(true);

    const ok = await submitVote(broker.uuid);
    if (!ok) {
      setVotes(v => v - 1);
      setHasVoted(false);
    }
    setIsVoting(false);
  };

  const rankCls = isInst ? '' : medal === 'gold' ? 'gold' : medal === 'silver' ? 'silver' : medal === 'bronze' ? 'bronze' : '';
  const scoreColor = score >= 8 ? 'high' : score >= 6.5 ? 'mid' : 'low';
  
  const spread = parseFloat(broker.eur_usd_spread);
  const dep = parseFloat(broker.min_deposit);
  
  const formatCommaText = (txt: string) => {
    if (!txt || txt === '—' || txt.trim() === '') return '—';
    if (/^\d+\+?$/.test(txt.trim())) return txt;
    return txt.split(/[|,/]/).map(item => item.trim()).filter(Boolean).join(', ');
  };

  let domain = '';
  try {
    if (broker.website && broker.website !== '--') {
      const urlObj = new URL(broker.website.startsWith('http') ? broker.website : 'https://' + broker.website);
      domain = urlObj.hostname.replace('www.', '');
    }
  } catch(e) {}

  const voteTooltip = `${votes.toLocaleString()} ${votes === 1 ? 'recommendation' : 'recommendations'}`;

  const parsedRegulations = useMemo(() => {
    if (!broker.regulation || !Array.isArray(broker.regulation)) return [];
    return broker.regulation
      .flatMap((reg: string) => reg.split('|').map((item) => item.trim()))
      .filter(Boolean);
  }, [broker.regulation]);

  return (
    <div className={`mtr-card ${isInst ? 'mtr-inst' : ''}`} style={{ animationDelay: `${Math.min(rank * 0.018, 0.28)}s` }}>
      <div 
        className="mtr-accent" 
        style={{ 
          background: medal === 'gold' ? 'var(--mtr-gold)' : 
                      medal === 'silver' ? 'var(--mtr-silver)' : 
                      medal === 'bronze' ? 'var(--mtr-bronze)' : 
                      'transparent' 
        }}
      ></div>
      
      <div className="mtr-rank-col">
        <span className={`mtr-rank-num ${rankCls}`}>
          {isInst ? '—' : rank}
        </span>
      </div>

      <BrokerLogo 
        customLogo={broker.logo_url || null}
        domain={domain}
        brokerName={brokerName}
        color={color}
      />

      <div className="mtr-identity">
        <div className="mtr-name">{brokerName}</div>
        <div className="mtr-tag-row">
          {!isInst && (broker.account_type || []).slice(0,2).map((t: string, i: number) => (
             <span key={i} className="mtr-acct-tag mtr-acct-stp">{t}</span>
          ))}
          {isInst ? <span className="mtr-inst-badge">Inst.</span> : (
            broker.regulation_tier === 'Tier-1' ? <span className="mtr-tier-badge mtr-tier-1">T1</span> :
            broker.regulation_tier === 'Tier-2' ? <span className="mtr-tier-badge mtr-tier-2">T2</span> :
            <span className="mtr-tier-badge mtr-tier-3">T3</span>
          )}
        </div>
      </div>
      <div className="mtr-boxes">
        <div className="mtr-dbox mtr-dbox-reg">
          <div className="mtr-dbox-label">Regulation</div>
          <div className="mtr-lic-tags">
            {parsedRegulations.slice(0, 2).map((l: string, i: number) => (
              <span key={i} className="mtr-lic-tag">{l}</span>
            ))}
            {parsedRegulations.length > 2 && (
              <span className="mtr-lic-tag" style={{ opacity: 0.65, fontWeight: 700 }}>
                +{parsedRegulations.length - 2}
              </span>
            )}
            {parsedRegulations.length === 0 && <span className="mtr-dbox-value muted">—</span>}
          </div>
        </div>
        <div className="mtr-dbox">
          <div className="mtr-dbox-label">EUR/USD</div>
          {isNaN(spread) || isInst ? <span className="mtr-dbox-value muted">—</span> : spread === 0 ? <span className="mtr-dbox-value teal">0.0 pips</span> : <span className="mtr-dbox-value">{spread.toFixed(1)} pips</span>}
        </div>
        <div className="mtr-dbox">
          <div className="mtr-dbox-label">Min. Deposit</div>
          {isNaN(dep) || isInst ? <span className="mtr-dbox-value muted">—</span> : dep === 0 ? <span className="mtr-dbox-value green">$0</span> : <span className="mtr-dbox-value">${dep.toLocaleString()}</span>}
        </div>
        <div className="mtr-dbox">
          <div className="mtr-dbox-label">Leverage</div>
          {isInst || !broker.max_leverage ? <span className="mtr-dbox-value muted">—</span> : <span className="mtr-dbox-value">1:{broker.max_leverage.toLocaleString()}</span>}
        </div>
        <div className="mtr-dbox">
          <div className="mtr-dbox-label">Instruments</div>
          {isInst || !broker.instruments ? <span className="mtr-dbox-value muted">—</span> : <span className="mtr-dbox-value">{formatCommaText(broker.instruments)}</span>}
        </div>
        <div className="mtr-dbox">
          <div className="mtr-dbox-label">HQ</div>
          <span className="mtr-dbox-value" style={{ fontSize: '11px' }}>{broker.hq_country ? formatCommaText(broker.hq_country) : '—'}</span>
        </div>
      </div>
      <div className="mtr-score-col">
        <div className="mtr-score-lbl">Score</div>
        {isInst ? (
          <div className="mtr-score-inner"><span className="mtr-score-val" style={{ fontSize: '13px', color: 'var(--mtr-muted)' }}>N/A</span></div>
        ) : (
          <div className="mtr-score-inner"><span className={`mtr-score-val ${scoreColor}`}>{score.toFixed(1)}</span><span className="mtr-score-denom">/10</span></div>
        )}
      </div>
      <div className="mtr-vote-col">
        <Tooltip content={voteTooltip}>
          <button
            className={`mtr-thumb-btn ${hasVoted ? 'voted' : ''}`}
            disabled={isVoting || hasVoted}
            onClick={handleVote}
            aria-label={voteTooltip}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span className="mtr-vc">{formatVotes(votes)}</span>
          </button>
        </Tooltip>
      </div>
      <div className="mtr-actions">
        <Link className="mtr-btn mtr-btn-secondary" href={`/brokers/${broker.slug}`}>View Hub</Link>
        <a className="mtr-btn mtr-btn-primary" href={broker.affiliate_url || broker.website || '#'} target="_blank" rel="nofollow noopener noreferrer">
          Visit Broker
          <svg style={{ marginLeft: '4px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    </div>
  );
}