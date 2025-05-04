
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationType, NotificationPreference } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  preferences: NotificationPreference[];
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updatePreference: (type: NotificationType, channel: 'email' | 'push' | 'in_app', enabled: boolean) => Promise<void>;
  savePreferences: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
      
      // Set up realtime subscription for notifications
      const channel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            // Handle different types of changes
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification;
              // Show toast for new notifications
              toast({
                title: "New notification",
                description: newNotification.content.substring(0, 100),
              });
              fetchNotifications(); // Refresh all to ensure correct order
            } else if (payload.eventType === 'DELETE') {
              // Remove deleted notification
              setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            } else {
              // For UPDATE and other events, refresh all
              fetchNotifications();
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setPreferences([]);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Convert the JSON metadata to proper type
      const typedNotifications = data ? data.map((notification: any) => ({
        ...notification,
        metadata: typeof notification.metadata === 'string' 
          ? JSON.parse(notification.metadata) 
          : notification.metadata as Record<string, any>
      })) as Notification[] : [];
      
      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setPreferencesLoading(true);

      // First check if the table exists to avoid errors
      const { data: prefData, error: prefError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
      
      if (prefError) {
        // If the table doesn't exist yet, proceed with default preferences
        console.log('Notification preferences not available yet, using defaults');
        await createDefaultPreferences();
        return;
      }
      
      if (prefData && prefData.length > 0) {
        // Get all preferences for the user
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Cast the result to the correct type
          setPreferences(data as unknown as NotificationPreference[]);
        } else {
          await createDefaultPreferences();
        }
      } else {
        // If no preferences exist, create default ones
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Create defaults in case of error
      await createDefaultPreferences();
    } finally {
      setPreferencesLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;
    
    // Define default notification types and preferences
    const defaultTypes: NotificationType[] = [
      'connection_request',
      'connection_accepted',
      'message',
      'event_reminder',
      'job_application',
      'job_status_change',
      'admin_announcement',
      'content_mention',
      'post_liked',
      'comment_added'
    ];
    
    // Create default preferences (all enabled)
    const defaultPreferences: Omit<NotificationPreference, 'id'>[] = defaultTypes.map(type => ({
      user_id: user.id,
      type,
      email: type !== 'post_liked' && type !== 'comment_added', // Less important notifications don't email by default
      push: true, 
      in_app: true
    }));
    
    try {
      // Check if table exists by using a raw query
      const { data: prefData, error: prefError } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1);
      
      if (prefError) {
        console.error('Error checking notification_preferences table:', prefError);
        // Table doesn't exist yet, use local defaults
        const localDefaults = defaultTypes.map(type => ({
          id: `local-${type}`,
          user_id: user.id,
          type,
          email: type !== 'post_liked' && type !== 'comment_added',
          push: true, 
          in_app: true
        }));
        
        setPreferences(localDefaults);
        return;
      }
      
      // Table exists, proceed with insert
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(defaultPreferences as any)
        .select();
      
      if (error) throw error;
      
      if (data) {
        setPreferences(data as unknown as NotificationPreference[]);
      }
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      // Use local defaults in case of error
      const localDefaults = defaultTypes.map(type => ({
        id: `local-${type}`,
        user_id: user.id,
        type,
        email: type !== 'post_liked' && type !== 'comment_added',
        push: true, 
        in_app: true
      }));
      
      setPreferences(localDefaults);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const updatePreference = async (
    type: NotificationType, 
    channel: 'email' | 'push' | 'in_app', 
    enabled: boolean
  ) => {
    // Update local state first for immediate feedback
    setPreferences(prev => 
      prev.map(pref => 
        pref.type === type 
          ? { ...pref, [channel]: enabled } 
          : pref
      )
    );
  };
  
  const savePreferences = async () => {
    if (!user) return;
    
    try {
      // First check if table exists
      const { data: checkData, error: checkError } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('notification_preferences table not available:', checkError);
        toast({
          title: "Error",
          description: "Notification preferences cannot be saved - service not yet available",
          variant: "destructive"
        });
        return;
      }
      
      // Filter out any local temporary ids
      const prefsToSave = preferences
        .filter(p => !p.id.toString().startsWith('local-'))
        .map(({ id, ...rest }) => rest);
      
      // Update all preferences in batch
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(prefsToSave as any);
      
      if (error) throw error;
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated."
      });
    } catch (error: any) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: "Error",
        description: `Failed to save preferences: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    updatePreference,
    savePreferences
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
