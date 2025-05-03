
import { useEffect, useState } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { MessageHeader } from './MessageHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Spinner } from '@/components/ui/spinner';

export const ConversationView = ({ onBack }: { onBack?: () => void }) => {
  const { 
    currentConversation,
    conversations,
    isLoadingMessages
  } = useMessaging();

  const [recipientId, setRecipientId] = useState<string | null>(null);
  
  // Get the recipient ID from the current conversation
  useEffect(() => {
    if (!currentConversation) return;

    const conversation = conversations.find(c => c.id === currentConversation);
    if (conversation) {
      setRecipientId(conversation.participant.id);
    }
  }, [currentConversation, conversations]);

  if (!currentConversation) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-8">
        <div className="p-6 bg-gray-50 rounded-full mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="h-12 w-12 text-gray-400"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-2">Your Messages</h2>
        <p className="text-gray-500 max-w-sm">
          Select a conversation to start chatting, or search for a user to start a new conversation.
        </p>
      </div>
    );
  }
  
  if (!recipientId) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageHeader participantId={recipientId} onBack={onBack} />
      <div className="flex-1 overflow-hidden relative">
        {isLoadingMessages && (
          <div className="absolute inset-0 bg-white/50 flex justify-center items-center z-10">
            <Spinner size="lg" />
          </div>
        )}
        <MessageList />
      </div>
      <MessageInput recipientId={recipientId} />
    </div>
  );
};
