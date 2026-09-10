import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://xplcaiygifwnxyevvqsr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";
export const supabase = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
