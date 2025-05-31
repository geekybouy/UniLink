import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessaging } from '@/contexts/MessagingContext';

interface MessageHeaderProps {
  participantId: string;
  onBack?: () => void;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export const MessageHeader = ({ participantId, onBack }: MessageHeaderProps) => {
  const [participant, setParticipant] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useMessaging();

  useEffect(() => {
    const fetchParticipant = async () => {
      if (!participantId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url')
          .eq('user_id', participantId)
          .single();
          
        if (error) throw error;
        
        // Ensure id is a string
        setParticipant({
          ...data,
          id: data.id.toString()
        });
      } catch (error) {
        console.error('Error fetching participant:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipant();
  }, [participantId]);
  
  if (loading) {
    return (
      <div className="border-b p-3 flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3 space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }
  
  if (!participant) {
    return (
      <div className="border-b p-3 flex items-center">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <span>Unknown User</span>
      </div>
    );
  }

  const isOnline = onlineUsers[participantId];
  
  return (
    <div className="border-b p-3 flex items-center">
      {onBack && (
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="relative">
        <Avatar>
          <AvatarImage src={participant.avatar_url || undefined} />
          <AvatarFallback>{participant.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
        )}
      </div>
      
      <div className="ml-3">
        <h3 className="font-medium">{participant.full_name}</h3>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};
