import { createClient } from '@supabase/supabase-js';

// We map your existing .env names to the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using your existing key name

// Check if variables are loading correctly
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase variables are missing! Check if .env has VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);