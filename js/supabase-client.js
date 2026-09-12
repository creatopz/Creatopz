/**
 * Supabase client configuration.
 *
 * SETUP:
 * 1. Create a project at https://supabase.com
 * 2. Go to Project Settings -> API
 * 3. Copy the "Project URL" into SUPABASE_URL below
 * 4. Copy the "anon public" key into SUPABASE_ANON_KEY below
 *
 * SECURITY NOTE: the anon key is safe to expose in frontend code —
 * it only grants whatever access your Row Level Security policies allow.
 * NEVER put the service_role key in any file that ships to the browser.
 */
const SUPABASE_URL = "https://vcidjppvvocdtrwanidp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaWRqcHB2dm9jZHRyd2FuaWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjEwMTAsImV4cCI6MjEwNDI5NzAxMH0.wcMGAE1mt6atU0q0qdWqOG90swlEokWMdRdejhrNInA";

// Loaded via the CDN script tag in each page's <head>:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
