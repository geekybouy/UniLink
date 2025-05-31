
import { supabase } from '@/integrations/supabase/client';
import { WebhookEndpoint, WebhookDelivery } from '@/types/integration';

export const createWebhookEndpoint = async (data: Omit<WebhookEndpoint, 'id' | 'created_at' | 'updated_at'>) => {
  const { data: result, error } = await supabase
    .from('webhook_endpoints')
    .insert({
      application_id: data.application_id,
      url: data.url,
      events: data.events,
      secret: data.secret,
      is_active: data.is_active
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getWebhookEndpoints = async (applicationId: string) => {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('application_id', applicationId);

  if (error) throw error;
  return data;
};

export const updateWebhookEndpoint = async (id: string, data: Partial<WebhookEndpoint>) => {
  const { data: result, error } = await supabase
    .from('webhook_endpoints')
    .update({
      url: data.url,
      events: data.events,
      is_active: data.is_active
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const logWebhookDelivery = async (deliveryData: Omit<WebhookDelivery, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('webhook_deliveries')
    .insert([{
      webhook_endpoint_id: deliveryData.webhook_endpoint_id,
      event_type: deliveryData.event_type,
      payload: deliveryData.payload,
      response_status: deliveryData.response_status,
      response_body: deliveryData.response_body,
      delivery_attempts: deliveryData.delivery_attempts,
      delivered_at: deliveryData.delivered_at
    }]);

  if (error) throw error;
};

export const retryFailedDeliveries = async () => {
  const { data: failedDeliveries, error: fetchError } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .is('delivered_at', null)
    .lt('delivery_attempts', 3);

  if (fetchError) throw fetchError;

  if (failedDeliveries && failedDeliveries.length > 0) {
    const retries = failedDeliveries.map(delivery => ({
      ...delivery,
      delivery_attempts: delivery.delivery_attempts + 1
    }));

    const { error: updateError } = await supabase
      .from('webhook_deliveries')
      .upsert(retries);

    if (updateError) throw updateError;
  }
};

export const sendWebhook = async (endpointId: string, eventType: string, payload: Record<string, any>) => {
  const { data: endpoint, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('id', endpointId)
    .eq('is_active', true)
    .single();

  if (error || !endpoint) return;

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': endpoint.secret
      },
      body: JSON.stringify(payload)
    });

    await logWebhookDelivery({
      webhook_endpoint_id: endpointId,
      event_type: eventType,
      payload,
      response_status: response.status,
      response_body: await response.text(),
      delivery_attempts: 1,
      delivered_at: response.ok ? new Date().toISOString() : undefined
    });
  } catch (error) {
    await logWebhookDelivery({
      webhook_endpoint_id: endpointId,
      event_type: eventType,
      payload,
      delivery_attempts: 1
    });
  }
};
