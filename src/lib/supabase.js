
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug log to help user verify keys (remove in production if needed, but helpful now)
// console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase variables are missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
