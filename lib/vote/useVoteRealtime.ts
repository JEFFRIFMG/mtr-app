'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Get atau generate voter ID dari sessionStorage.
 * Note: sebenernya kita pake localStorage biar 1 vote per broker per browser
 * (sesuai spec: incognito = browser baru = bisa vote lagi karena beda profile).
 */
export function getVoterId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('mtr_voter_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('mtr_voter_id', id);
  }
  return id;
}

/**
 * Check apakah voter udah pernah vote broker ini (localStorage).
 */
export function hasVoted(brokerUuid: string): boolean {
  if (typeof window === 'undefined') return false;
  const voted = localStorage.getItem(`mtr_voted_${brokerUuid}`);
  return voted === '1';
}

export function markVoted(brokerUuid: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`mtr_voted_${brokerUuid}`, '1');
}

/**
 * Subscribe perubahan total_votes di tabel brokers.
 * Setiap kali ada UPDATE → callback dipanggil dengan { uuid, total_votes }.
 */
export function useVoteRealtime(
  onUpdate: (uuid: string, totalVotes: number) => void
) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('broker-votes-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'brokers' },
        (payload) => {
          const row = payload.new as { uuid: string; total_votes: number };
          if (row?.uuid && typeof row.total_votes === 'number') {
            onUpdate(row.uuid, row.total_votes);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [onUpdate]);
}

/**
 * Kirim vote ke API. Optimistic — caller handle state update.
 */
export async function submitVote(brokerUuid: string): Promise<boolean> {
  if (hasVoted(brokerUuid)) return false;

  const voterId = getVoterId();
  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broker_uuid: brokerUuid, voter_id: voterId }),
    });
    if (!res.ok) return false;
    markVoted(brokerUuid);
    return true;
  } catch {
    return false;
  }
}
