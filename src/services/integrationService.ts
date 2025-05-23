
import { supabase } from '@/integrations/supabase/client';
import type { 
  ApiApplication, 
  IntegrationConnector, 
  WebhookEndpoint, 
  ApiUsageLog,
  IntegrationSyncLog 
} from '@/types/integration';

export class IntegrationService {
  // API Application Management
  static async createApiApplication(data: Partial<ApiApplication>) {
    const { data: application, error } = await supabase
      .from('api_applications')
      .insert([{
        ...data,
        client_id: crypto.randomUUID(),
        client_secret: crypto.randomUUID().replace(/-/g, ''),
        owner_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return application;
  }

  static async getApiApplications() {
    const { data, error } = await supabase
      .from('api_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateApiApplication(id: string, updates: Partial<ApiApplication>) {
    const { data, error } = await supabase
      .from('api_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteApiApplication(id: string) {
    const { error } = await supabase
      .from('api_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Integration Connectors
  static async createConnector(data: Partial<IntegrationConnector>) {
    const user = await supabase.auth.getUser();
    const { data: connector, error } = await supabase
      .from('integration_connectors')
      .insert([{
        ...data,
        created_by: user.data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return connector;
  }

  static async getConnectors() {
    const { data, error } = await supabase
      .from('integration_connectors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateConnector(id: string, updates: Partial<IntegrationConnector>) {
    const { data, error } = await supabase
      .from('integration_connectors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteConnector(id: string) {
    const { error } = await supabase
      .from('integration_connectors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Webhook Management
  static async createWebhookEndpoint(data: Partial<WebhookEndpoint>) {
    const { data: webhook, error } = await supabase
      .from('webhook_endpoints')
      .insert([{
        ...data,
        secret: crypto.randomUUID().replace(/-/g, '')
      }])
      .select()
      .single();

    if (error) throw error;
    return webhook;
  }

  static async getWebhookEndpoints(applicationId: string) {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateWebhookEndpoint(id: string, updates: Partial<WebhookEndpoint>) {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteWebhookEndpoint(id: string) {
    const { error } = await supabase
      .from('webhook_endpoints')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // API Usage Analytics
  static async logApiUsage(data: Partial<ApiUsageLog>) {
    const { error } = await supabase
      .from('api_usage_logs')
      .insert([data]);

    if (error) throw error;
  }

  static async getApiUsageStats(applicationId: string, timeRange: string = '24h') {
    const timeFilter = timeRange === '24h' ? 
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() :
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .eq('application_id', applicationId)
      .gte('created_at', timeFilter)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Integration Sync Logs
  static async createSyncLog(data: Partial<IntegrationSyncLog>) {
    const { data: log, error } = await supabase
      .from('integration_sync_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  static async updateSyncLog(id: string, updates: Partial<IntegrationSyncLog>) {
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSyncLogs(connectorId: string) {
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('connector_id', connectorId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
}
