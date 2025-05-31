
import { useMessaging } from '@/contexts/MessagingContext';
import { Badge } from '@/components/ui/badge';

interface MessagingBadgeProps {
  className?: string;
}

export const MessagingBadge = ({ className }: MessagingBadgeProps) => {
  const { totalUnreadMessages } = useMessaging();

  if (totalUnreadMessages === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className={`absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs ${className || ''}`}
    >
      {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
    </Badge>
  );
};
