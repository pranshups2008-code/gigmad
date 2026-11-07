import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axerzbkubdxfffpazawm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ6Ymt1YmR4ZmZmcGF6YXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMzE0MzgsImV4cCI6MjEwOTYwNzQzOH0.kAnqDI6fFR4_mUDnp4ti04Ld5z7siR2Mw-bgN8_KuWM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
