import { createClient } from '@/lib/shared/supabase/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side auth check. Pakai @supabase/ssr buat cookie-based session.
 * Return { user, role } kalau authenticated, null kalau ngga.
 */
export async function getAdminUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in server components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Role disimpen di user_metadata. Default 'editor' kalau ga di-set.
  // Owner pertama harus di-set manual via Supabase dashboard:
  // Authentication → Users → klik user → Raw User Meta Data → tambah { "role": "owner" }
  const role = (user.user_metadata?.role || 'editor') as 'owner' | 'editor';

  return { user, role };
}

export async function requireAdmin() {
  const session = await getAdminUser();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireOwner() {
  const session = await requireAdmin();
  if (session.role !== 'owner') {
    throw new Error('FORBIDDEN');
  }
  return session;
}
