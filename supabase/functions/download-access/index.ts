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

  let body: { paymentId?: string; albumId?: string; photoIds?: string[] };

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

  const { paymentId, albumId, photoIds } = body || {};

  if (!paymentId || !albumId || !photoIds || photoIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "paymentId, albumId, and photoIds are required." }),
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
    // Verify payment exists and is marked as paid
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({
          error: "Payment not found or invalid."
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

    // Verify payment is marked as paid
    if (payment.status !== "paid") {
      return new Response(
        JSON.stringify({
          error: "Payment has not been approved yet."
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Verify album exists
    const { data: album, error: albumError } = await supabaseAdmin
      .from("albums")
      .select("*")
      .eq("id", albumId)
      .single();

    if (albumError || !album) {
      return new Response(
        JSON.stringify({
          error: "Album not found."
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

    // Verify payment belongs to this album
    if (payment.album_id !== albumId) {
      return new Response(
        JSON.stringify({
          error: "Payment does not match album."
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Get the photos
    const { data: photos, error: photosError } = await supabaseAdmin
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .in("id", photoIds)
      .eq("is_available", true);

    if (photosError || !photos) {
      return new Response(
        JSON.stringify({ error: "Could not load photos." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Create signed URLs for each photo
    const downloads: Array<{
      id: string;
      file_name: string;
      downloadUrl: string;
    }> = [];

    for (const photo of photos) {
      try {
        // Create a signed URL valid for 2 hours
        const { data: signedUrl, error: signError } = await supabaseAdmin.storage
          .from("shotmarket-private")
          .createSignedUrl(photo.storage_path, 7200); // 2 hours

        if (!signError && signedUrl) {
          downloads.push({
            id: photo.id,
            file_name: photo.file_name || `photo-${photo.id}.jpg`,
            downloadUrl: signedUrl.signedUrl
          });
        }
      } catch (error) {
        console.error(`Error creating signed URL for photo ${photo.id}:`, error);
      }
    }

    if (downloads.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Could not prepare any downloads."
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

    return new Response(
      JSON.stringify({
        success: true,
        downloads: downloads
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Download access error:", error);

    return new Response(
      JSON.stringify({
        error: "An error occurred while preparing your downloads."
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
});
