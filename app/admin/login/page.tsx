'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#060D18' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#00A86B' }}>
          MTR Admin
        </h1>
        <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
          Sign in to manage broker data.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#E8EDF4' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded"
              style={{
                background: '#0A1220',
                border: '1px solid #1A2E45',
                color: '#E8EDF4',
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#E8EDF4' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded"
              style={{
                background: '#0A1220',
                border: '1px solid #1A2E45',
                color: '#E8EDF4',
              }}
            />
          </div>

          {error && (
            <div
              className="text-sm p-2 rounded"
              style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded font-medium disabled:opacity-50"
            style={{ background: '#00A86B', color: '#fff' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
