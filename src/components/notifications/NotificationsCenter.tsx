
import React, { useState } from 'react';
import { Bell, BellOff, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationItem from './NotificationItem';

interface NotificationsCenterProps {
  onClose: () => void;
}

const NotificationsCenter = ({ onClose }: NotificationsCenterProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    loading 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
          >
            <BellOff className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
          <Link to="/notification-settings">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              Settings
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All{' '}
              <Badge variant="secondary" className="ml-1">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread{' '}
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-2">No notifications</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive notifications for connection requests and updates
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onClose={onClose}
                />
              ))
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unread" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : unreadCount === 0 ? (
              <div className="p-8 text-center">
                <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-2">No unread notifications</p>
                <p className="text-xs text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onClose={onClose}
                />
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="p-2 border-t text-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/notifications" onClick={onClose}>
            View all notifications
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotificationsCenter;
