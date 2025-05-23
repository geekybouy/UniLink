
export interface ApiApplication {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  scopes: string[];
  application_type: 'web' | 'mobile' | 'server';
  owner_id: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  id: string;
  application_id: string;
  user_id: string;
  token_hash: string;
  scopes: string[];
  expires_at?: string;
  last_used_at?: string;
  is_revoked: boolean;
  created_at: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  type: string;
  description?: string;
  endpoint_url?: string;
  authentication_method?: string;
  configuration: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEndpoint {
  id: string;
  application_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_endpoint_id: string;
  event_type: string;
  payload: Record<string, any>;
  response_status?: number;
  response_body?: string;
  delivery_attempts: number;
  delivered_at?: string;
  created_at: string;
}

export interface ApiUsageLog {
  id: string;
  application_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}
