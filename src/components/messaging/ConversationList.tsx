
import { useMessaging, Conversation } from '@/contexts/MessagingContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';

export const ConversationList = () => {
  const {
    conversations,
    isLoadingConversations,
    selectConversation,
    currentConversation,
    onlineUsers,
    refreshConversations
  } = useMessaging();

  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation.id);
  };

  if (isLoadingConversations) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refreshConversations()}
          className="h-8 w-8 p-0"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`flex items-start p-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-muted transition-colors ${
                currentConversation === conversation.id ? 'bg-slate-50 dark:bg-muted' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.participant.avatar_url || undefined} />
                  <AvatarFallback>
                    {conversation.participant.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {onlineUsers[conversation.participant.id] && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>

              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-sm truncate">
                    {conversation.participant.full_name}
                  </h3>
                  {conversation.last_message_time && (
                    <span className="text-xs text-gray-500 dark:text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                  {conversation.last_message_text || 'Start a conversation'}
                </p>
              </div>

              {conversation.unread_count > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
