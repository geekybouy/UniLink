
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Loader2,
  ShieldAlert,
  MoreHorizontal
} from 'lucide-react';
import { useConnections } from '@/contexts/ConnectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface ConnectionButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({ 
  userId, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const { user } = useAuth();
  const { 
    sendConnectionRequest, 
    acceptConnectionRequest, 
    rejectConnectionRequest, 
    removeConnection, 
    blockUser,
    connections,
    isConnected,
    isPending,
    isBlocked
  } = useConnections();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If it's the current user, don't show the button
  if (user?.id === userId) {
    return null;
  }

  // Find the connection if it exists
  const connection = connections.find(
    conn => (conn.sender_id === user?.id && conn.receiver_id === userId) || 
           (conn.sender_id === userId && conn.receiver_id === user?.id)
  );

  const isReceived = connection?.receiver_id === user?.id && connection?.status === 'pending';

  const handleConnect = async () => {
    setIsSubmitting(true);
    try {
      await sendConnectionRequest(userId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (!connection) return;
    setIsSubmitting(true);
    try {
      await acceptConnectionRequest(connection.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!connection) return;
    setIsSubmitting(true);
    try {
      await rejectConnectionRequest(connection.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!connection) return;
    setIsSubmitting(true);
    try {
      await removeConnection(connection.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await blockUser(userId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlocked(userId)) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        className={`text-destructive ${className}`}
        disabled
      >
        <ShieldAlert className="h-4 w-4 mr-2" />
        Blocked
      </Button>
    );
  }

  if (isSubmitting) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Processing
      </Button>
    );
  }

  if (isConnected(userId)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={size} 
            className={`text-green-600 border-green-600 ${className}`}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Connected
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleRemove}>
            <UserX className="h-4 w-4 mr-2" />
            Remove Connection
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleBlock} className="text-destructive">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isPending(userId)) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        className={className}
        disabled
      >
        <Clock className="h-4 w-4 mr-2" />
        Request Sent
      </Button>
    );
  }

  if (isReceived) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size={size} 
          className={`text-green-600 border-green-600 ${className}`}
          onClick={handleAccept}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button 
          variant="outline" 
          size={size} 
          className={`text-destructive ${className}`}
          onClick={handleReject}
        >
          <UserX className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Connect
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleConnect}>
          <UserPlus className="h-4 w-4 mr-2" />
          Send Connection Request
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleBlock} className="text-destructive">
          <ShieldAlert className="h-4 w-4 mr-2" />
          Block User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectionButton;
