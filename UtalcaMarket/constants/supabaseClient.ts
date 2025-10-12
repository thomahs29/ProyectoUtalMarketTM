import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if the variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anonymous key is missing in .env file");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);