
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: For production, you should use environment variables.
// These values are hardcoded here for demonstration purposes only.
const supabaseUrl = 'https://dddakwsjlwfgxutihjsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZGFrd3NqbHdmZ3h1dGloanN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDcyOTEsImV4cCI6MjA3NDEyMzI5MX0.jGU302BebqNhxtqc1KQfutBXwgoGh962KNtH7nlfIBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
