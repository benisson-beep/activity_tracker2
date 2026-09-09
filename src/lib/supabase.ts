import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL || 'https://myfbxkytugekmnvuvhfg.supabase.co'
).trim();

// Use real project anon key as primary default to ensure immediate availability in all environments
export const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZmJ4a3l0dWdla21udnV2aGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTUxMDcsImV4cCI6MjEwNDM3MTEwN30.S_XWgafnUux5sv6pApQhOqNrO61yxdBSdd55no73Bjs'
).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 20);
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/**
 * Initiates the real native Google OAuth Sign-in flow via Supabase.
 * Immediately redirects the browser to Supabase -> Google OAuth authorization page.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; url?: string }> {
  try {
    const redirectTo = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.warn('Supabase signInWithOAuth error, initiating direct authorize redirect:', error);
      const directUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
      window.location.href = directUrl;
      return { error: null, url: directUrl };
    }

    if (data?.url) {
      window.location.href = data.url;
      return { error: null, url: data.url };
    }

    // Direct fallback
    const directUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = directUrl;
    return { error: null, url: directUrl };
  } catch (err: any) {
    const directUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
    window.location.href = directUrl;
    return { error: null, url: directUrl };
  }
}

/**
 * Sign out of Supabase session
 */
export async function signOutSupabase(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
