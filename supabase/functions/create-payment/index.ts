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

  const authorization = request.headers.get("Authorization");
  if (!authorization)
    return respond({ error: "A customer session is required." }, 401);

  let body: {
    albumId?: string;
    galleryToken?: string;
    selectedPhotoIds?: string[];
    currency?: string;
  };
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Invalid request body." }, 400);
  }
  const {
    albumId,
    galleryToken,
    selectedPhotoIds = [],
    currency = "KZT",
  } = body;
  if (!albumId || !galleryToken || !selectedPhotoIds.length) {
    return respond(
      { error: "Album, gallery token, and selected photos are required." },
      400,
    );
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY");
  if (!url || !serviceKey)
    return respond({ error: "Missing Supabase server configuration." }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user)
    return respond({ error: "Customer session is invalid." }, 401);

  const { data: album, error: albumError } = await admin
    .from("albums")
    .select("id, user_id")
    .eq("id", albumId)
    .eq("gallery_token", galleryToken)
    .maybeSingle();
  if (albumError || !album)
    return respond({ error: "Gallery not found or token is invalid." }, 404);

  const uniquePhotoIds = [...new Set(selectedPhotoIds)];
  const { data: photos, error: photosError } = await admin
    .from("photos")
    .select("id, price")
    .eq("album_id", album.id)
    .eq("is_available", true)
    .in("id", uniquePhotoIds);
  if (photosError || !photos || photos.length !== uniquePhotoIds.length) {
    return respond(
      { error: "One or more selected photos are unavailable." },
      400,
    );
  }

  const amount =
    photos.reduce((sum, photo) => sum + Number(photo.price || 0), 0) ||
    photos.length * 1000;
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      album_id: album.id,
      user_id: album.user_id,
      customer_id: userData.user.id,
      amount,
      currency,
      status: "pending",
      selected_photos: uniquePhotoIds,
    })
    .select("id, album_id, status, selected_photos, amount, currency")
    .single();
  if (paymentError || !payment)
    return respond(
      { error: paymentError?.message || "Could not create payment." },
      500,
    );
  return respond({ success: true, payment }, 201);
});
