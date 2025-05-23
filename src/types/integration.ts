
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
  type: 'university_sis' | 'hr_platform' | 'certification_authority' | 'job_board';
  description?: string;
  endpoint_url?: string;
  authentication_method: 'oauth' | 'api_key' | 'basic_auth';
  configuration: Record<string, any>;
  is_active: boolean;
  created_by: string;
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

export interface IntegrationSyncLog {
  id: string;
  connector_id: string;
  sync_type: 'full' | 'incremental';
  status: 'running' | 'completed' | 'failed';
  records_processed: number;
  errors_count: number;
  error_details?: Record<string, any>;
  started_at: string;
  completed_at?: string;
}

export interface ExternalMapping {
  id: string;
  connector_id: string;
  local_entity_type: string;
  local_entity_id: string;
  external_entity_id: string;
  external_entity_data?: Record<string, any>;
  last_synced_at: string;
  created_at: string;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: Record<string, any>;
  response_schema?: Record<string, any>;
  required_scopes: string[];
}

export interface WebhookEvent {
  type: string;
  description: string;
  payload_schema: Record<string, any>;
}
