
export type NotificationType = 
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'event_reminder'
  | 'job_application'
  | 'job_status_change'
  | 'admin_announcement'
  | 'content_mention'
  | 'post_liked'
  | 'comment_added';

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string | null;
  type: NotificationType | string;
  content: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any>;
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType | string;
  email: boolean;
  push: boolean;
  in_app: boolean;
  created_at?: string;
  updated_at?: string;
}
