import { createClient } from '@supabase/supabase-js';


if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Falta a variável de ambiente NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Falta a variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
);

export const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
} 