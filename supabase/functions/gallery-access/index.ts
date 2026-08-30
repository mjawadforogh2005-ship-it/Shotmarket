import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  let body: { albumId?: string; galleryToken?: string };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  const { albumId, galleryToken } = body || {};

  if (!albumId || !galleryToken) {
    return new Response(
      JSON.stringify({ error: "albumId and galleryToken are required." }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        error: "Missing Supabase server configuration."
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  try {
    const { data: album, error: albumError } = await supabaseAdmin
      .from("albums")
      .select("*")
      .eq("id", albumId)
      .eq("gallery_token", galleryToken)
      .single();

    if (albumError || !album) {
      return new Response(
        JSON.stringify({
          error: "Gallery not found or token is invalid."
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const { data: photoRows, error: photoError } = await supabaseAdmin
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .eq("is_available", true)
      .order("created_at", { ascending: true });

    if (photoError) {
      return new Response(
        JSON.stringify({ error: photoError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const photosWithUrls: Array<Record<string, unknown>> = [];

    for (const photo of photoRows || []) {
      const privateResult = await supabaseAdmin.storage
        .from("shotmarket-private")
        .createSignedUrl(photo.storage_path, 3600);

      if (!privateResult.error && privateResult.data) {
        photosWithUrls.push({
          ...photo,
          displayUrl: privateResult.data.signedUrl,
          storageBucket: "shotmarket-private"
        });

        continue;
      }

      const oldPublicResult = supabaseAdmin.storage
        .from("shotmarket-photos")
        .getPublicUrl(photo.storage_path);

      photosWithUrls.push({
        ...photo,
        displayUrl: oldPublicResult.data?.publicUrl || null,
        storageBucket: "shotmarket-photos"
      });
    }

    return new Response(
      JSON.stringify({
        album,
        photos: photosWithUrls
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
