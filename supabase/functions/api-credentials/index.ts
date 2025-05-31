
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Verify API token (same logic as api-users)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    const tokenHash = await hashToken(token)

    const { data: apiToken, error: tokenError } = await supabase
      .from('api_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('is_revoked', false)
      .single()

    if (tokenError || !apiToken) {
      return new Response(
        JSON.stringify({ error: 'invalid_token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)

    if (req.method === 'POST' && pathSegments[2] === 'verify') {
      // Check scope
      if (!apiToken.scopes.includes('credentials:verify')) {
        return new Response(
          JSON.stringify({ error: 'insufficient_scope' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { credential_id, verification_method } = await req.json()

      // Get credential
      const { data: credential, error: credError } = await supabase
        .from('credentials')
        .select('*')
        .eq('id', credential_id)
        .single()

      if (credError || !credential) {
        return new Response(
          JSON.stringify({ error: 'credential_not_found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Simulate verification process
      const verificationResult = {
        credential_id,
        verification_status: 'verified',
        verification_method,
        verified_at: new Date().toISOString(),
        issuer: credential.issuer,
        credential_type: credential.credential_type,
        blockchain_hash: credential.blockchain_hash
      }

      // Log verification
      await supabase
        .from('api_usage_logs')
        .insert({
          application_id: apiToken.application_id,
          endpoint: '/api/v1/credentials/verify',
          method: 'POST',
          status_code: 200
        })

      return new Response(
        JSON.stringify(verificationResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && pathSegments[2] === 'list') {
      // Check scope
      if (!apiToken.scopes.includes('credentials:read')) {
        return new Response(
          JSON.stringify({ error: 'insufficient_scope' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userId = url.searchParams.get('user_id') || apiToken.user_id

      const { data: credentials, error: listError } = await supabase
        .from('credentials')
        .select(`
          id,
          title,
          credential_type,
          issuer,
          issue_date,
          expiry_date,
          verification_status,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (listError) {
        return new Response(
          JSON.stringify({ error: 'fetch_failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ credentials }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'endpoint_not_found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
