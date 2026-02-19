
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = import.meta.env.VITE_SITE_URL;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase variables are missing. Please check your .env file.');
}
if (!siteUrl) {
    throw new Error('VITE_SITE_URL is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { siteUrl };
