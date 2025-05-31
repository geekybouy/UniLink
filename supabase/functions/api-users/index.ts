
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

    // Verify API token
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
      .select(`
        *,
        application:api_applications(*)
      `)
      .eq('token_hash', tokenHash)
      .eq('is_revoked', false)
      .single()

    if (tokenError || !apiToken) {
      return new Response(
        JSON.stringify({ error: 'invalid_token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check token expiration
    if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'token_expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update last used timestamp
    await supabase
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiToken.id)

    // Log API usage
    const url = new URL(req.url)
    await supabase
      .from('api_usage_logs')
      .insert({
        application_id: apiToken.application_id,
        endpoint: url.pathname,
        method: req.method,
        status_code: 200,
        user_agent: req.headers.get('User-Agent') || null
      })

    const pathSegments = url.pathname.split('/').filter(Boolean)

    if (req.method === 'GET' && pathSegments[2] === 'profile') {
      // Check scope
      if (!apiToken.scopes.includes('profile:read')) {
        return new Response(
          JSON.stringify({ error: 'insufficient_scope' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userId = pathSegments[3] || apiToken.user_id

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          university_name,
          branch,
          graduation_year,
          location,
          bio,
          avatar_url,
          current_company,
          job_title
        `)
        .eq('user_id', userId)
        .single()

      if (profileError) {
        return new Response(
          JSON.stringify({ error: 'profile_not_found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(profile),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && pathSegments[2] === 'directory') {
      // Check scope
      if (!apiToken.scopes.includes('directory:read')) {
        return new Response(
          JSON.stringify({ error: 'insufficient_scope' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const searchParams = url.searchParams
      const university = searchParams.get('university')
      const graduationYear = searchParams.get('graduation_year')
      const field = searchParams.get('field')
      const limit = parseInt(searchParams.get('limit') || '50')

      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          university_name,
          branch,
          graduation_year,
          location,
          current_company,
          job_title,
          avatar_url
        `)
        .eq('is_profile_complete', true)

      if (university) {
        query = query.ilike('university_name', `%${university}%`)
      }
      if (graduationYear) {
        query = query.eq('graduation_year', parseInt(graduationYear))
      }
      if (field) {
        query = query.ilike('branch', `%${field}%`)
      }

      const { data: profiles, error: searchError } = await query.limit(limit)

      if (searchError) {
        return new Response(
          JSON.stringify({ error: 'search_failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ profiles, total: profiles.length }),
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
