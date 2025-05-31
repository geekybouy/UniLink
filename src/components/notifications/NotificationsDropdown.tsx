
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationsCenter from './NotificationsCenter';

interface NotificationsDropdownProps {
  variant?: 'default' | 'outline' | 'ghost';
}

const NotificationsDropdown = ({ variant = 'ghost' }: NotificationsDropdownProps) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
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
        <NotificationsCenter onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
