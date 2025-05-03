
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

// Define types for our messaging system
export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  content: string;
  attachment_url: string | null;
  status: 'sent' | 'delivered' | 'read';
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_id: string | null;
  last_message_text: string | null;
  last_message_time: string | null;
  participant1_unread_count: number;
  participant2_unread_count: number;
  created_at: string;
  updated_at: string;
  participant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  unread_count: number;
};

export type UserPresence = {
  user_id: string;
  online_status: boolean;
  last_seen_at: string;
};

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  sendMessage: (recipientId: string, content: string, attachmentUrl?: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  onlineUsers: Record<string, boolean>;
  totalUnreadMessages: number;
  refreshConversations: () => Promise<void>;
  conversationWith: (userId: string) => Promise<string>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [messagesPage, setMessagesPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);

  // Fetch conversations when user is logged in
  useEffect(() => {
    if (user) {
      fetchConversations();
      setupMessagingSubscriptions();
      setupPresence();
    }

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user]);

  // Set up realtime subscriptions for messages and conversations
  const setupMessagingSubscriptions = () => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Update messages if we're in the relevant conversation
          if (newMessage.conversation_id === currentConversation) {
            setMessages(prev => [...prev, newMessage]);
            markMessageAsRead(newMessage.id);
          } else {
            // Update unread count and show notification
            toast.info(`New message from ${getParticipantName(newMessage.sender_id)}`, {
              description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              action: {
                label: 'View',
                onClick: () => setCurrentConversation(newMessage.conversation_id)
              }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('public:conversations')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant1_id=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant2_id=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  };

  const setupPresence = () => {
    if (!user) return;

    // Update our own presence status
    updateUserPresence(true);

    // Set up presence subscriptions
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newOnlineUsers: Record<string, boolean> = {};
        
        Object.keys(state).forEach(userId => {
          newOnlineUsers[userId] = true;
        });
        
        setOnlineUsers(newOnlineUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // Handle window events for setting online/offline status
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserPresence(true);
        channel.track({ online_at: new Date().toISOString() });
      }
    };

    const handleBeforeUnload = () => {
      updateUserPresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    setPresenceChannel(channel);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateUserPresence(false);
      supabase.removeChannel(channel);
    };
  };

  // Update user presence in database
  const updateUserPresence = async (status: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: user.id,
            online_status: status,
            last_seen_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Get participant name for notifications
  const getParticipantName = (userId: string): string => {
    for (const convo of conversations) {
      if (convo.participant.id === userId) {
        return convo.participant.full_name;
      }
    }
    return 'Someone';
  };

  // Fetch user's conversations
  const fetchConversations = async () => {
    if (!user) return;

    try {
      setIsLoadingConversations(true);

      // First get all conversations the user is part of
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Now for each conversation, get the other participant's details
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          const otherParticipantId = 
            conversation.participant1_id === user.id 
              ? conversation.participant2_id 
              : conversation.participant1_id;
          
          const unreadCount = 
            conversation.participant1_id === user.id 
              ? conversation.participant1_unread_count 
              : conversation.participant2_unread_count;

          // Get user profile information
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('user_id', otherParticipantId)
            .single();

          return {
            ...conversation,
            participant: profileData || { 
              id: otherParticipantId, 
              full_name: 'Unknown User',
              avatar_url: null 
            },
            unread_count: unreadCount || 0
          } as Conversation;
        })
      );

      setConversations(conversationsWithParticipants);
      
      // Calculate total unread messages
      const unreadTotal = conversationsWithParticipants.reduce(
        (sum, convo) => sum + convo.unread_count, 0
      );
      setTotalUnreadMessages(unreadTotal);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Refresh conversations list
  const refreshConversations = async () => {
    return fetchConversations();
  };

  // Get or create a conversation with a specific user
  const conversationWith = async (userId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Check if conversation already exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${userId}),and(participant1_id.eq.${userId},participant2_id.eq.${user.id})`)
        .single();

      if (existingConvo) {
        return existingConvo.id;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: userId
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (!newConvo) throw new Error('Failed to create conversation');
      
      // Refresh conversations list
      await fetchConversations();
      
      return newConvo.id;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      toast.error('Failed to start conversation');
      throw error;
    }
  };

  // Select a conversation and load its messages
  const selectConversation = async (conversationId: string) => {
    setCurrentConversation(conversationId);
    setMessagesPage(0);
    setHasMoreMessages(true);
    await fetchMessages(conversationId);
    await markMessagesAsRead(conversationId);
  };

  // Fetch messages for a conversation with pagination
  const fetchMessages = async (conversationId: string, page = 0) => {
    if (!user || !conversationId) return;

    try {
      setIsLoadingMessages(true);
      
      const PAGE_SIZE = 20;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // Check if we have more messages to load
      setHasMoreMessages(data.length === PAGE_SIZE);
      
      const sortedMessages = [...data].reverse();
      setMessages(page === 0 ? sortedMessages : [...messages, ...sortedMessages]);
      setMessagesPage(page);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load more messages (pagination)
  const fetchMoreMessages = async () => {
    if (!hasMoreMessages || !currentConversation) return;
    await fetchMessages(currentConversation, messagesPage + 1);
  };

  // Send a new message
  const sendMessage = async (recipientId: string, content: string, attachmentUrl?: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!content.trim() && !attachmentUrl) throw new Error('Message cannot be empty');

    try {
      // Get or create conversation
      const conversationId = await conversationWith(recipientId);

      // Insert the message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          conversation_id: conversationId,
          content,
          attachment_url: attachmentUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update local messages if we're in this conversation
      if (currentConversation === conversationId) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversation in realtime happens through subscription
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  // Mark a single message as read
  const markMessageAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages in a conversation as read
  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      // Mark all messages as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local conversation's unread count
      setConversations(prevConversations => {
        return prevConversations.map(convo => {
          if (convo.id === conversationId) {
            const updatedConvo = { ...convo, unread_count: 0 };
            return updatedConvo;
          }
          return convo;
        });
      });
      
      // Recalculate total unread
      const newTotal = conversations.reduce(
        (sum, convo) => sum + (convo.id === conversationId ? 0 : convo.unread_count), 0
      );
      setTotalUnreadMessages(newTotal);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        sendMessage,
        selectConversation,
        markMessagesAsRead,
        fetchMoreMessages,
        onlineUsers,
        totalUnreadMessages,
        refreshConversations,
        conversationWith
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
