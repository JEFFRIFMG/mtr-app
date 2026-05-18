'use client';

import { useState, useEffect } from 'react';
import { hasVoted, submitVote } from '@/lib/vote/useVoteRealtime';

type Props = {
  brokerUuid: string;
  initialCount: number;
  /** Override count dari parent (kalau pakai realtime) */
  liveCount?: number;
};

export function VoteButton({ brokerUuid, initialCount, liveCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setVoted(hasVoted(brokerUuid));
  }, [brokerUuid]);

  // Sync live count dari realtime (kalau ada)
  useEffect(() => {
    if (typeof liveCount === 'number') setCount(liveCount);
  }, [liveCount]);

  async function handleClick() {
    if (voted || submitting) return;
    setSubmitting(true);

    // Optimistic update
    setCount((c) => c + 1);
    setVoted(true);

    const ok = await submitVote(brokerUuid);
    if (!ok) {
      // Rollback
      setCount((c) => c - 1);
      setVoted(false);
    }
    setSubmitting(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={voted || submitting}
      aria-label={voted ? 'Already voted' : 'Vote for this broker'}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-opacity"
      style={{
        background: voted ? 'rgba(0, 168, 107, 0.15)' : 'transparent',
        color: voted ? '#00A86B' : '#7A8FA6',
        cursor: voted ? 'default' : 'pointer',
        opacity: submitting ? 0.6 : 1,
      }}
    >
      <span>👍</span>
      <span>{count > 0 ? count : 'Recommend'}</span>
    </button>
  );
}
