
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface MessageButtonProps {
  userId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({ userId, variant = "default", className }) => {
  const { conversationWith } = useMessaging();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleMessage = async () => {
    try {
      setIsLoading(true);
      const conversationId = await conversationWith(userId);
      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMessage}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner size="sm" className="mr-2" />
      ) : (
        <MessageCircle className="mr-2 h-4 w-4" />
      )}
      Message
    </Button>
  );
};
