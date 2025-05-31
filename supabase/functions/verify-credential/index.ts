
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

interface VerificationRequestBody {
  credentialId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VerificationRequestBody = await req.json();
    const { credentialId } = body;

    if (!credentialId) {
      return new Response(
        JSON.stringify({ error: "credentialId is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Verifying credential with ID: ${credentialId}`);

    const { data: credential, error: dbError } = await supabaseClient
      .from("credentials")
      .select("id, title, issuer, expiry_date, verification_status")
      .eq("id", credentialId)
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      if (dbError.code === 'PGRST116') { // PostgREST error for "No rows found"
        return new Response(
          JSON.stringify({ status: "not_found", message: "Credential not found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }
      return new Response(
        JSON.stringify({ error: "Database query failed", details: dbError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!credential) {
      return new Response(
        JSON.stringify({ status: "not_found", message: "Credential not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Check for expiry if expiry_date exists
    let effectiveStatus = credential.verification_status;
    if (credential.expiry_date && new Date(credential.expiry_date) < new Date()) {
        effectiveStatus = 'expired';
    }

    console.log(`Credential found: ${credential.title}, Status: ${effectiveStatus}`);

    return new Response(
      JSON.stringify({
        status: effectiveStatus,
        credentialTitle: credential.title,
        issuer: credential.issuer,
        expiryDate: credential.expiry_date,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-credential function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
