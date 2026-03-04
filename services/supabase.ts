import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cxwpdyitvhydjnkweeiy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4d3BkeWl0dmh5ZGpua3dlZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODM3MzcsImV4cCI6MjA4NTc1OTczN30.VuEGz9DP5xskSvHdKHDVU5LZS61cTCBFfFNsrZKU4Yw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
