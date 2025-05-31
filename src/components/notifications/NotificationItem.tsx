
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useConnections } from '@/contexts/ConnectionContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserCheck, 
  UserX, 
  Bell, 
  MessageCircle, 
  Calendar, 
  Briefcase, 
  Flag, 
  ThumbsUp, 
  MessageSquare 
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const { acceptConnectionRequest, rejectConnectionRequest } = useConnections();
  const [fromUser, setFromUser] = useState<any | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (notification.from_user_id) {
      fetchFromUser(notification.from_user_id);
    }
  }, [notification.from_user_id]);
  
  const fetchFromUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username, user_id')
      .eq('user_id', userId)
      .single();
      
    if (!error && data) {
      setFromUser(data);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };
  
  const handleNotificationClick = async () => {
    // Mark as read when clicked
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type and metadata
    const handleNavigation = () => {
      if (notification.type === 'connection_request' && notification.from_user_id) {
        navigate(`/profile/${notification.from_user_id}`);
      } else if (notification.type === 'connection_accepted' && notification.from_user_id) {
        navigate(`/profile/${notification.from_user_id}`);
      } else if (notification.type === 'message' && notification.metadata?.conversation_id) {
        navigate(`/messages/${notification.metadata.conversation_id}`);
      } else if (notification.type === 'event_reminder' && notification.metadata?.event_id) {
        navigate(`/events/${notification.metadata.event_id}`);
      } else if (notification.type === 'job_application' && notification.metadata?.job_id) {
        navigate(`/jobs/${notification.metadata.job_id}`);
      } else if (notification.type === 'job_status_change' && notification.metadata?.job_id) {
        navigate(`/my-applications`);
      } else if (notification.type === 'content_mention' && notification.metadata?.post_id) {
        navigate(`/knowledge/${notification.metadata.post_id}`);
      } else if (notification.type === 'post_liked' && notification.metadata?.post_id) {
        navigate(`/knowledge/${notification.metadata.post_id}`);
      } else if (notification.type === 'comment_added' && notification.metadata?.post_id) {
        navigate(`/knowledge/${notification.metadata.post_id}`);
      }
      
      if (onClose) onClose();
    };
    
    handleNavigation();
  };
  
  const renderActions = () => {
    if (notification.type === 'connection_request') {
      // For connection requests, show accept/reject buttons
      const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.metadata?.connection_id) return;
        
        await acceptConnectionRequest(notification.metadata.connection_id);
        await markAsRead(notification.id);
        if (onClose) onClose();
      };
      
      const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.metadata?.connection_id) return;
        
        await rejectConnectionRequest(notification.metadata.connection_id);
        await markAsRead(notification.id);
        if (onClose) onClose();
      };
      
      return (
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={handleAccept}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleReject}
          >
            <UserX className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  const getNotificationIcon = () => {
    switch(notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserCheck className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'event_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'job_application':
      case 'job_status_change':
        return <Briefcase className="h-4 w-4" />;
      case 'admin_announcement':
        return <Flag className="h-4 w-4" />;
      case 'post_liked':
        return <ThumbsUp className="h-4 w-4" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  return (
    <div 
      className={`p-4 border-b hover:bg-slate-50 ${!notification.is_read ? 'bg-slate-50' : ''} relative cursor-pointer`}
      onClick={handleNotificationClick}
    >
      {!notification.is_read && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
      )}
      <div className="flex gap-3">
        {fromUser ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={fromUser.avatar_url || ''} />
            <AvatarFallback>
              {fromUser.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
            {getNotificationIcon()}
          </div>
        )}
        
        <div className="flex-1">
          <div className="text-sm">
            <span className="font-medium">
              {fromUser ? fromUser.full_name : 'System'}
            </span>{' '}
            {notification.content}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeAgo}
          </div>
          
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
