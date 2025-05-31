
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BellOff, Trash2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
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
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'No unread notifications'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
            <Button asChild>
              <Link to="/notification-settings">
                Settings
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border shadow">
          <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
            <div className="px-4 pt-4 border-b">
              <TabsList className="grid w-full max-w-md grid-cols-2">
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
            
            <TabsContent value="all" className="flex-1">
              <ScrollArea className="h-full max-h-[70vh]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You'll receive notifications for connection requests, messages, and other important updates
                    </p>
                    <Button asChild>
                      <Link to="/dashboard">Return to Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="unread" className="flex-1">
              <ScrollArea className="h-full max-h-[70vh]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading notifications...</p>
                  </div>
                ) : unreadCount === 0 ? (
                  <div className="p-16 text-center">
                    <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No unread notifications</h3>
                    <p className="text-muted-foreground mb-2">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
