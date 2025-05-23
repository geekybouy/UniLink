
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

    const { event_type, payload, webhook_id } = await req.json()

    // Get webhook endpoint
    const { data: webhook } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhook_id)
      .eq('is_active', true)
      .single()

    if (!webhook) {
      return new Response(
        JSON.stringify({ error: 'webhook_not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if event is subscribed
    if (!webhook.events.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: 'event_not_subscribed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deliver webhook
    const deliveryResult = await deliverWebhook(webhook, event_type, payload)

    // Log delivery
    await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_endpoint_id: webhook.id,
        event_type,
        payload,
        response_status: deliveryResult.status,
        response_body: deliveryResult.body,
        delivery_attempts: 1,
        delivered_at: deliveryResult.success ? new Date().toISOString() : null
      })

    return new Response(
      JSON.stringify({ 
        success: deliveryResult.success, 
        status: deliveryResult.status,
        delivery_id: crypto.randomUUID()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'internal_server_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function deliverWebhook(webhook: any, eventType: string, payload: any) {
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret,
        'X-Webhook-Event': eventType,
        'X-Webhook-Signature': await generateSignature(JSON.stringify(payload), webhook.secret)
      },
      body: JSON.stringify(payload)
    })

    return {
      success: response.ok,
      status: response.status,
      body: await response.text()
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      body: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const hashArray = Array.from(new Uint8Array(signature))
  return 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
