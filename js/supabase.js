/* =========================================================
   SHOTMARKET - SUPABASE CONNECTION
   SINGLE SUPABASE CLIENT
   ========================================================= */

const SUPABASE_URL =
    "https://xplcaiygifwnxyevvqsr.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";


/*
    Create ONE Supabase client.

    This file is loaded after the Supabase CDN
    in our HTML files.
*/

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


console.log(
    "ShotMarket Supabase connected successfully."
);