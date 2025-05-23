
import { supabase } from '@/integrations/supabase/client';
import type { WebhookDelivery } from '@/types/integration';

export class WebhookService {
  private static async getActiveWebhooks(eventType: string) {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (error) throw error;
    return data;
  }

  static async triggerWebhook(eventType: string, payload: Record<string, any>) {
    const webhooks = await this.getActiveWebhooks(eventType);

    for (const webhook of webhooks) {
      await this.deliverWebhook(webhook.id, eventType, payload);
    }
  }

  private static async deliverWebhook(webhookId: string, eventType: string, payload: Record<string, any>) {
    const webhook = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (!webhook.data) return;

    const deliveryData: Partial<WebhookDelivery> = {
      webhook_endpoint_id: webhookId,
      event_type: eventType,
      payload,
      delivery_attempts: 1
    };

    try {
      const response = await fetch(webhook.data.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.data.secret,
          'X-Webhook-Event': eventType
        },
        body: JSON.stringify(payload)
      });

      deliveryData.response_status = response.status;
      deliveryData.response_body = await response.text();
      deliveryData.delivered_at = new Date().toISOString();

      await supabase
        .from('webhook_deliveries')
        .insert([deliveryData]);

    } catch (error) {
      deliveryData.response_status = 0;
      deliveryData.response_body = error instanceof Error ? error.message : 'Unknown error';

      await supabase
        .from('webhook_deliveries')
        .insert([deliveryData]);

      // Retry logic could be implemented here
      this.scheduleRetry(webhookId, eventType, payload, 1);
    }
  }

  private static scheduleRetry(webhookId: string, eventType: string, payload: Record<string, any>, attempt: number) {
    if (attempt >= 3) return; // Max 3 attempts

    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
    setTimeout(() => {
      this.deliverWebhook(webhookId, eventType, payload);
    }, delay);
  }

  static async getWebhookDeliveries(webhookId: string) {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_endpoint_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  }
}
