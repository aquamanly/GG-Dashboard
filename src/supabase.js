/* import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yidcglxaphpcphljohvo.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZGNnbHhhcGhwY3BobGpvaHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzI1ODIsImV4cCI6MjA3NjEwODU4Mn0.w7aNZ8w9FUFysh1CGKpVEi6zU0NT3UOLaievoDTkfYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 */

// supabase.js (JS-only)
import { createClient } from '@supabase/supabase-js';

// Detect RN/Expo vs Web so we set the right auth flag and env source
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Prefer environment variables, fall back to hardcoded ONLY for local dev
const SUPABASE_URL =
  (isReactNative ? process.env.EXPO_PUBLIC_SUPABASE_URL : import.meta?.env?.VITE_SUPABASE_URL) ||
  'https://yidcglxaphpcphljohvo.supabase.co';

const SUPABASE_ANON_KEY =
  (isReactNative ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY : import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZGNnbHhhcGhwY3BobGpvaHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzI1ODIsImV4cCI6MjA3NjEwODU4Mn0.w7aNZ8w9FUFysh1CGKpVEi6zU0NT3UOLaievoDTkfYk';

// Helpful runtime guard (won't crash, but warns loudly)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing URL or ANON key. Set VITE_SUPABASE_* for web or EXPO_PUBLIC_SUPABASE_* for Expo.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // On web, OAuth redirects land on the URL → detectSessionInUrl=true
    // On React Native, there is no URL to parse → set false
    detectSessionInUrl: !isReactNative,
  },
});
