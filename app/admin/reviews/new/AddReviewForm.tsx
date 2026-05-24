'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Broker {
  uuid: string;
  name: string;
  slug: string;
}

interface Props {
  brokers: Broker[];
}

export function AddReviewForm({ brokers }: Props) {
  const router = useRouter();
  const [brokerUuid, setBrokerUuid] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brokerUuid) {
      setError('Please select a broker.');
      return;
    }
    if (reviewText.trim().length < 3) {
      setError('Review text is too short.');
      return;
    }
    if (guestName.trim().length < 2) {
      setError('Guest name is too short.');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        broker_uuid: brokerUuid,
        rating,
        review_text: reviewText,
        guest_name: guestName,
        guest_email: guestEmail || undefined,
      };

      if (customDate) {
        body.created_at = new Date(customDate).toISOString();
      }

      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to add review.');
        return;
      }

      router.push('/admin/reviews');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {/* Broker */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Broker <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <select
          value={brokerUuid}
          onChange={(e) => setBrokerUuid(e.target.value)}
          className="w-full bg-[#060D18] border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          required
        >
          <option value="">— Select broker —</option>
          {brokers.map((b) => (
            <option key={b.uuid} value={b.uuid}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rating <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={i <= rating ? '#00A86B' : 'none'}
                stroke="#00A86B"
                strokeWidth="1.5"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Review <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          placeholder="Write the review here..."
          className="w-full bg-[#060D18] border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] resize-y"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
        />
      </div>

      {/* Guest Name + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Guest Name <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-[#060D18] border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Guest Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="optional"
            className="w-full bg-[#060D18] border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          />
        </div>
      </div>

      {/* Custom Date */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Custom Created Date <span style={{ color: '#7A8FA6' }}>(optional, for backdating)</span>
        </label>
        <input
          type="datetime-local"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="bg-[#060D18] border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
        />
        <p className="text-xs mt-1" style={{ color: '#7A8FA6' }}>
          Leave empty to use current time.
        </p>
      </div>

      {error && (
        <div
          className="text-sm rounded-md px-3 py-2 border"
          style={{
            background: 'rgba(229,62,62,0.12)',
            borderColor: 'rgba(229,62,62,0.45)',
            color: '#E53E3E',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          {submitting ? 'Adding...' : 'Add Review'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/reviews')}
          className="px-5 py-2 rounded font-medium border"
          style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}