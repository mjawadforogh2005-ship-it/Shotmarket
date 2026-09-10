const SUPABASE_URL = "https://xplcaiygifwnxyevvqsr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

console.log("ShotMarket Supabase connected successfully.");
