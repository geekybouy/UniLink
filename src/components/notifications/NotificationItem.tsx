
import React, { useState, useEffect } from 'react';
import { Notification, useNotifications } from '@/contexts/NotificationContext';
import { useConnections } from '@/contexts/ConnectionContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { UserCheck, UserX, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const { 
    connections, 
    acceptConnectionRequest, 
    rejectConnectionRequest 
  } = useConnections();
  const [fromUser, setFromUser] = useState<any | null>(null);
  
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

  // Find the connection for connection-related notifications
  const getConnection = () => {
    if (!notification.metadata || !notification.metadata.connection_id) return null;
    
    return connections.find(conn => conn.id === notification.metadata.connection_id);
  };
  
  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };
  
  const renderActions = () => {
    if (notification.type === 'connection_request') {
      // Find the pending connection
      const pendingConnection = connections.find(
        conn => conn.sender_id === notification.from_user_id && 
               conn.receiver_id === notification.user_id &&
               conn.status === 'pending'
      );
      
      if (!pendingConnection) return null;
      
      const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await acceptConnectionRequest(pendingConnection.id);
        await markAsRead(notification.id);
        if (onClose) onClose();
      };
      
      const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await rejectConnectionRequest(pendingConnection.id);
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
  
  const getNotificationLink = () => {
    if (notification.type.startsWith('connection_') && notification.from_user_id) {
      return `/profile/${notification.from_user_id}`;
    }
    return '#';
  };
  
  const getNotificationIcon = () => {
    switch(notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  return (
    <div 
      className={`p-4 border-b hover:bg-slate-50 ${!notification.is_read ? 'bg-slate-50' : ''} relative`}
      onClick={() => markAsRead(notification.id)}
    >
      {!notification.is_read && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
      )}
      <Link 
        to={getNotificationLink()} 
        className="flex gap-3" 
        onClick={() => {
          markAsRead(notification.id);
          if (onClose) onClose();
        }}
      >
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
              {fromUser ? fromUser.full_name : 'Someone'}
            </span>{' '}
            {notification.content}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {timeAgo}
          </div>
          
          {renderActions()}
        </div>
      </Link>
    </div>
  );
};

export default NotificationItem;
