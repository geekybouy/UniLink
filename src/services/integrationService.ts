
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { 
  ApiApplication, 
  ApiToken, 
  IntegrationConnector, 
  WebhookEndpoint,
  WebhookDelivery,
  ApiUsageLog
} from '@/types/integration';

// API Application Management
export const createApiApplication = async (data: Omit<ApiApplication, 'id' | 'created_at' | 'updated_at'>) => {
  const { data: result, error } = await supabase
    .from('api_applications')
    .insert({
      name: data.name,
      description: data.description,
      client_id: data.client_id,
      client_secret: data.client_secret,
      redirect_uris: data.redirect_uris,
      scopes: data.scopes,
      application_type: data.application_type,
      owner_id: data.owner_id,
      is_active: data.is_active,
      rate_limit_per_hour: data.rate_limit_per_hour
    })
    .select()
    .single();

  if (error) throw error;
  
  // Type assertion to ensure compatibility
  return {
    ...result,
    application_type: result.application_type as 'web' | 'mobile' | 'server'
  } as ApiApplication;
};

export const getApiApplications = async (userId: string): Promise<ApiApplication[]> => {
  const { data, error } = await supabase
    .from('api_applications')
    .select('*')
    .eq('owner_id', userId);

  if (error) throw error;
  
  // Type assertion to ensure compatibility
  return (data || []).map(app => ({
    ...app,
    application_type: app.application_type as 'web' | 'mobile' | 'server'
  })) as ApiApplication[];
};

export const updateApiApplication = async (id: string, data: Partial<ApiApplication>) => {
  const { data: result, error } = await supabase
    .from('api_applications')
    .update({
      name: data.name,
      description: data.description,
      redirect_uris: data.redirect_uris,
      scopes: data.scopes,
      is_active: data.is_active,
      rate_limit_per_hour: data.rate_limit_per_hour
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Type assertion to ensure compatibility
  return {
    ...result,
    application_type: result.application_type as 'web' | 'mobile' | 'server'
  } as ApiApplication;
};

// Integration Connector Management
export const createIntegrationConnector = async (data: Omit<IntegrationConnector, 'id' | 'created_at' | 'updated_at'>) => {
  const { data: result, error } = await supabase
    .from('integration_connectors')
    .insert({
      name: data.name,
      type: data.type,
      description: data.description,
      endpoint_url: data.endpoint_url,
      authentication_method: data.authentication_method,
      configuration: data.configuration,
      is_active: data.is_active,
      created_by: data.created_by
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getIntegrationConnectors = async () => {
  const { data, error } = await supabase
    .from('integration_connectors')
    .select('*');

  if (error) throw error;
  return data;
};

export const updateIntegrationConnector = async (id: string, data: Partial<IntegrationConnector>) => {
  const { data: result, error } = await supabase
    .from('integration_connectors')
    .update({
      name: data.name,
      description: data.description,
      endpoint_url: data.endpoint_url,
      authentication_method: data.authentication_method,
      configuration: data.configuration,
      is_active: data.is_active
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
};

// Webhook Management
export const createWebhook = async (data: Omit<WebhookEndpoint, 'id' | 'created_at' | 'updated_at'>) => {
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

export const getWebhooks = async (applicationId: string) => {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('application_id', applicationId);

  if (error) throw error;
  return data;
};

export const updateWebhook = async (id: string, data: Partial<WebhookEndpoint>) => {
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

// API Usage Logging
export const logApiUsage = async (data: Omit<ApiUsageLog, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('api_usage_logs')
    .insert([{
      application_id: data.application_id,
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.status_code,
      response_time_ms: data.response_time_ms,
      user_agent: data.user_agent,
      ip_address: data.ip_address
    }]);

  if (error) throw error;
};

// Generate API access tokens
export const generateApiToken = async (applicationId: string, userId: string, scopes: string[]) => {
  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Token valid for 1 year

  const { error } = await supabase
    .from('api_tokens')
    .insert([{
      application_id: applicationId,
      user_id: userId,
      token_hash: tokenId,
      scopes,
      expires_at: expiresAt.toISOString()
    }]);

  if (error) throw error;
  return tokenId;
};

// Get API token for an application
export const getApiTokens = async (applicationId: string) => {
  const { data, error } = await supabase
    .from('api_tokens')
    .select('*')
    .eq('application_id', applicationId)
    .eq('is_revoked', false);

  if (error) throw error;
  return data;
};

// Revoke an API token
export const revokeApiToken = async (tokenId: string) => {
  const { error } = await supabase
    .from('api_tokens')
    .update({ is_revoked: true })
    .eq('id', tokenId);

  if (error) throw error;
  return true;
};
