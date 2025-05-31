
import React, { useEffect, useRef, useState } from 'react';
import { useMessaging, Message } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/contexts/ProfileContext';
import { Check, CheckCheck } from 'lucide-react';

export const MessageList = () => {
  const { messages, isLoadingMessages, fetchMoreMessages } = useMessaging();
  const { user } = useAuth();
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && !isLoadingMessages) {
        const scrollHeight = container.scrollHeight;

        fetchMoreMessages().then(() => {
          if (container.scrollHeight > scrollHeight) {
            container.scrollTop = container.scrollHeight - scrollHeight;
          }
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchMoreMessages, isLoadingMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderMessageStatus = (message: Message) => {
    if (message.sender_id === user?.id) {
      switch (message.status) {
        case 'read':
          return <CheckCheck className="h-3.5 w-3.5 text-primary ml-1" />;
        case 'delivered':
          return <Check className="h-3.5 w-3.5 text-gray-400 ml-1" />;
        default:
          return <Check className="h-3.5 w-3.5 text-gray-300 ml-1" />;
      }
    }
    return null;
  };

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        {Array(5).fill(0).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${i % 2 === 0 ? '' : 'flex-row-reverse space-x-reverse'}`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className={`h-16 w-44 ${i % 2 === 0 ? 'rounded-r-xl rounded-bl-xl' : 'rounded-l-xl rounded-br-xl'}`} />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div
      className="flex flex-col h-full overflow-y-auto px-4 py-2"
      ref={messagesContainerRef}
    >
      {isLoadingMessages && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <Skeleton className="h-6 w-24" />
        </div>
      )}

      {Object.keys(messageGroups).map(date => (
        <div key={date} className="mb-4">
          <div className="text-xs text-center text-gray-500 dark:text-muted-foreground mb-2">
            <span className="bg-white dark:bg-background px-2 py-1 rounded-full">{date}</span>
          </div>

          {messageGroups[date].map((message, index) => {
            const isCurrentUser = message.sender_id === user?.id;
            const showAvatar = index === 0 ||
              messageGroups[date][index - 1].sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={`flex items-end mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Non-current user avatar */}
                {!isCurrentUser && showAvatar && (
                  <Avatar className="h-6 w-6 mr-2 mb-1 flex-shrink-0">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}

                <div className="max-w-[80%]">
                  <div
                    className={`px-3 py-2 rounded-t-lg ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground rounded-bl-lg'
                        : 'bg-muted rounded-br-lg'
                    }`}
                  >
                    {message.content}
                    {message.attachment_url && (
                      <div className="mt-2">
                        <img
                          src={message.attachment_url}
                          alt="Attachment"
                          className="rounded-md max-w-full max-h-60 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center text-xs text-gray-500 dark:text-muted-foreground mt-1 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    {renderMessageStatus(message)}
                  </div>
                </div>

                {/* Current user avatar */}
                {isCurrentUser && showAvatar && (
                  <Avatar className="h-6 w-6 ml-2 mb-1 flex-shrink-0">
                    <AvatarImage src={profile?.profile_image_url || undefined} />
                    <AvatarFallback>
                      {(profile?.name?.charAt(0) || user.email?.charAt(0) || 'U')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-primary text-white rounded-full p-2 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
