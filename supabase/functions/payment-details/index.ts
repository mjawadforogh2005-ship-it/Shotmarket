import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (request: Request) => Promise<Response> | Response) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST")
    return respond({ error: "Method not allowed." }, 405);

  let body: {
    albumId?: string;
    galleryToken?: string;
    selectedPhotoIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Invalid request body." }, 400);
  }

  const { albumId, galleryToken, selectedPhotoIds = [] } = body;
  if (!albumId || !galleryToken)
    return respond({ error: "Album and gallery token are required." }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY");
  if (!url || !serviceKey)
    return respond({ error: "Missing Supabase server configuration." }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: album, error: albumError } = await admin
    .from("albums")
    .select("id, user_id, name, event_date")
    .eq("id", albumId)
    .eq("gallery_token", galleryToken)
    .maybeSingle();
  if (albumError || !album)
    return respond({ error: "Gallery not found or token is invalid." }, 404);

  let photosQuery = admin
    .from("photos")
    .select("id, price")
    .eq("album_id", album.id)
    .eq("is_available", true);
  if (selectedPhotoIds.length)
    photosQuery = photosQuery.in("id", selectedPhotoIds);
  const { data: photos, error: photosError } = await photosQuery;
  if (photosError || !photos?.length)
    return respond({ error: "No purchasable photos were found." }, 400);
  if (
    selectedPhotoIds.length &&
    photos.length !== new Set(selectedPhotoIds).size
  ) {
    return respond(
      { error: "One or more selected photos are unavailable." },
      400,
    );
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("bank_name, bank_account_name, bank_account_number, bank_currency")
    .eq("id", album.user_id)
    .maybeSingle();
  if (
    profileError ||
    !profile?.bank_name ||
    !profile.bank_account_name ||
    !profile.bank_account_number
  ) {
    return respond(
      {
        error:
          "The photographer has not completed payment details for this album.",
      },
      409,
    );
  }

  const amount =
    photos.reduce((sum, photo) => sum + Number(photo.price || 0), 0) ||
    photos.length * 1000;
  return respond({
    album: { id: album.id, name: album.name, event_date: album.event_date },
    photos,
    amount,
    currency: profile.bank_currency || "KZT",
    bankInformation: {
      bankName: profile.bank_name,
      accountName: profile.bank_account_name,
      accountNumber: profile.bank_account_number,
    },
  });
});
