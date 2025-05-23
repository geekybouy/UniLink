
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  client_id: string;
  client_secret: string;
  grant_type: 'client_credentials' | 'authorization_code';
  code?: string;
  redirect_uri?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { client_id, client_secret, grant_type, code, redirect_uri }: AuthRequest = await req.json()

      // Verify client credentials
      const { data: application, error: appError } = await supabase
        .from('api_applications')
        .select('*')
        .eq('client_id', client_id)
        .eq('client_secret', client_secret)
        .eq('is_active', true)
        .single()

      if (appError || !application) {
        return new Response(
          JSON.stringify({ error: 'invalid_client' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (grant_type === 'client_credentials') {
        // Generate access token
        const token = crypto.randomUUID().replace(/-/g, '')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Store token
        await supabase
          .from('api_tokens')
          .insert({
            application_id: application.id,
            user_id: application.owner_id,
            token_hash: await hashToken(token),
            scopes: application.scopes,
            expires_at: expiresAt.toISOString()
          })

        return new Response(
          JSON.stringify({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 86400,
            scope: application.scopes.join(' ')
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'unsupported_grant_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'internal_server_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
