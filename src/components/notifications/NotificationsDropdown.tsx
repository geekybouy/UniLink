
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';

interface NotificationsDropdownProps {
  variant?: 'default' | 'outline' | 'ghost';
}

const NotificationsDropdown = ({ variant = 'ghost' }: NotificationsDropdownProps) => {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 md:w-96 p-0"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
            >
              Mark all as read
            </Button>
          </div>
        </div>
        
        <ScrollArea className="max-h-[min(80vh,500px)]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No notifications</p>
              <p className="text-xs text-muted-foreground">
                You'll receive notifications for connection requests and updates
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
