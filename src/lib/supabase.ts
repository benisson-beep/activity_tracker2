import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://myfbxkytugekmnvuvhfg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here');
};

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = supabaseInstance;

/**
 * Initiates Google OAuth Sign-in flow.
 * If Supabase is configured with an anon key, redirects to Google.
 * If not configured yet, returns a clear message instructing the user to supply the anon key.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; url?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      error: new Error(
        'Supabase is not fully configured with an Anon Key yet. Add VITE_SUPABASE_ANON_KEY in your .env file.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    if (data?.url) {
      window.location.href = data.url;
      return { error: null, url: data.url };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign out of Supabase session
 */
export async function signOutSupabase(): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
