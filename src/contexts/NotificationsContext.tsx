
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationType, NotificationPreference } from '@/types/notifications';
import { toast } from 'sonner';

interface NotificationsContextType {
  notifications: Notification[];
  preferences: NotificationPreference[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreference: (
    type: NotificationType,
    channel: 'in_app' | 'email' | 'push',
    value: boolean
  ) => void;
  savePreferences: () => Promise<void>;
}

// Create context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Define default notification preferences for new users
const DEFAULT_NOTIFICATION_PREFERENCES: Array<Omit<NotificationPreference, 'id' | 'user_id'>> = [
  { type: 'connection_request', email: true, push: true, in_app: true },
  { type: 'connection_accepted', email: true, push: true, in_app: true },
  { type: 'message', email: true, push: true, in_app: true },
  { type: 'event_reminder', email: true, push: false, in_app: true },
  { type: 'job_application', email: true, push: true, in_app: true },
  { type: 'job_status_change', email: true, push: true, in_app: true },
  { type: 'admin_announcement', email: true, push: false, in_app: true },
  { type: 'content_mention', email: false, push: false, in_app: true },
  { type: 'post_liked', email: false, push: false, in_app: true },
  { type: 'comment_added', email: false, push: false, in_app: true },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch notifications and preferences
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();

      // Set up realtime subscription for notifications
      const notificationsChannel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [user]);

  // Fetch notifications from the database
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
      const typedNotifications: Notification[] = data?.map(notification => ({
        ...notification,
        metadata: typeof notification.metadata === 'string'
          ? JSON.parse(notification.metadata)
          : notification.metadata || {}
      })) || [];

      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user) return;

    try {
      // Check if preferences exist in the database
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching notification preferences:', fetchError);
        return;
      }

      // If preferences don't exist for this user, create defaults
      if (!existingPrefs || existingPrefs.length === 0) {
        const defaultPrefs = DEFAULT_NOTIFICATION_PREFERENCES.map((pref) => ({
          ...pref,
          user_id: user.id,
        }));

        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs);

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          return;
        }

        // Fetch the newly created preferences
        const { data: newPrefs, error: refetchError } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id);

        if (refetchError) {
          console.error('Error fetching new preferences:', refetchError);
          return;
        }

        setPreferences(newPrefs as NotificationPreference[]);
      } else {
        setPreferences(existingPrefs as NotificationPreference[]);
      }
    } catch (error) {
      console.error('Error handling notification preferences:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update notification preference in state (not yet saved to database)
  const updatePreference = (
    type: NotificationType,
    channel: 'in_app' | 'email' | 'push',
    value: boolean
  ) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.type === type ? { ...pref, [channel]: value } : pref
      )
    );
  };

  // Save all notification preferences to the database
  const savePreferences = async () => {
    if (!user) return;

    try {
      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          preferences.map((pref) => ({
            id: pref.id,
            user_id: user.id,
            type: pref.type,
            email: pref.email,
            push: pref.push,
            in_app: pref.in_app,
          }))
        );

      if (error) throw error;

      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const value = {
    notifications,
    preferences,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreference,
    savePreferences,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
