import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ========== DEMO DATA ==========

// Demo users
const demoUsers = [
  {
    id: 'u_priya',
    full_name: 'Priya Sharma',
    avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    online: true,
  },
  {
    id: 'u_arjun',
    full_name: 'Arjun Patel',
    avatar_url: 'https://randomuser.me/api/portraits/men/27.jpg',
    online: true,
  },
  {
    id: 'u_sneha',
    full_name: 'Sneha Gupta',
    avatar_url: 'https://randomuser.me/api/portraits/women/33.jpg',
    online: false,
  },
  {
    id: 'u_rajesh',
    full_name: 'Dr. Rajesh Mehta',
    avatar_url: 'https://randomuser.me/api/portraits/men/40.jpg',
    online: true,
  },
  {
    id: 'u_vikram',
    full_name: 'Vikram Reddy',
    avatar_url: 'https://randomuser.me/api/portraits/men/65.jpg',
    online: false,
  },
  {
    id: 'u_placement',
    full_name: 'Placement Cell',
    avatar_url: '',
    online: false,
  },
  {
    id: 'u_alumni',
    full_name: 'Alumni Network Group',
    avatar_url: '',
    online: false,
    group: true,
    participants: ['u_priya', 'u_arjun', 'u_rajesh'],
  },
  {
    id: 'u_studygroup',
    full_name: 'Study Group - Data Structures',
    avatar_url: '',
    online: true,
    group: true,
    participants: ['u_sneha', 'u_priya', 'u_arjun'],
  },
];

// Utility: force status to type MessageStatus ('sent' | 'delivered' | 'read')
const toMessageStatus = (input: string): "sent" | "delivered" | "read" => {
  if (input === "read" || input === "delivered" || input === "sent") return input;
  // fallback for typo/mistake in data: treat as delivered
  return "delivered";
};

// Demo conversations (fix: make sure status is typed as MessageStatus)
const demoConversations = [
  {
    id: 'c_priya',
    participant: demoUsers[0],
    last_message_text: "Hey! Are you attending the placement drive tomorrow? 🤔",
    last_message_time: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2hr ago
    unread_count: 1,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_priya',
        recipient_id: 'me',
        content: "Hey! Are you attending the placement drive tomorrow? 🤔",
        created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      },
      {
        id: uuidv4(),
        sender_id: 'me',
        recipient_id: 'u_priya',
        content: "Definitely! Let's go together. When are you heading there?",
        created_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_arjun',
    participant: demoUsers[1],
    last_message_text: "Just finished my internship presentation. Thanks for the tips! 🙏",
    last_message_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1hr ago
    unread_count: 0,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_arjun',
        recipient_id: 'me',
        content: "Just finished my internship presentation. Thanks for the tips! 🙏",
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      },
      {
        id: uuidv4(),
        sender_id: 'me',
        recipient_id: 'u_arjun',
        content: "Congrats! Hope it went well 🚀",
        created_at: new Date(Date.now() - 54 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_alumni',
    participant: demoUsers[6],
    last_message_text: "Monthly meetup this Saturday at Cafe Coffee Day, Koramangala",
    last_message_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5hr ago
    unread_count: 2,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_alumni',
        recipient_id: 'me',
        content: "Monthly meetup this Saturday at Cafe Coffee Day, Koramangala",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_sneha',
    participant: demoUsers[2],
    last_message_text: "Can you share the ML assignment notes? Struggling with SVMs 😅",
    last_message_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20m ago
    unread_count: 1,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_sneha',
        recipient_id: 'me',
        content: "Can you share the ML assignment notes? Struggling with SVMs 😅",
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'delivered' as "delivered",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_placementcell',
    participant: demoUsers[5],
    last_message_text: "Microsoft is visiting campus next week. Update your resumes!",
    last_message_time: new Date(Date.now() - 400 * 60 * 1000).toISOString(), // yesterday
    unread_count: 0,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_placement',
        recipient_id: 'me',
        content: "Microsoft is visiting campus next week. Update your resumes!",
        created_at: new Date(Date.now() - 400 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_rajesh',
    participant: demoUsers[3],
    last_message_text: "Happy to mentor any students interested in AI/ML careers",
    last_message_time: new Date(Date.now() - 200 * 60 * 1000).toISOString(), // few hrs ago
    unread_count: 0,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_rajesh',
        recipient_id: 'me',
        content: "Happy to mentor any students interested in AI/ML careers",
        created_at: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
        status: 'read' as "read",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_studygroup',
    participant: demoUsers[7],
    last_message_text: "Let's solve today's coding problems together",
    last_message_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m ago
    unread_count: 3,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_studygroup',
        recipient_id: 'me',
        content: "Let's solve today's coding problems together",
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'delivered' as "delivered",
        attachment_url: undefined,
      }
    ]
  },
  {
    id: 'c_vikram',
    participant: demoUsers[4],
    last_message_text: "Startup hiring interns! Remote work, stipend 25K. DM if interested",
    last_message_time: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    unread_count: 0,
    messages: [
      {
        id: uuidv4(),
        sender_id: 'u_vikram',
        recipient_id: 'me',
        content: "Startup hiring interns! Remote work, stipend 25K. DM if interested",
        created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        status: 'delivered' as "delivered",
        attachment_url: undefined,
      }
    ]
  },
];

// ========== CONTEXT SETUP ==========

type MessageStatus = 'sent' | 'delivered' | 'read';

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  status: MessageStatus;
  attachment_url?: string;
};

export type Conversation = {
  id: string;
  participant: typeof demoUsers[number];
  last_message_text: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
};

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: string | null;
  selectConversation: (conversationId: string) => void;
  messages: Message[];
  sendMessage: (recipientId: string, content: string, attachment_url?: string) => Promise<void>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  onlineUsers: Record<string, boolean>;
  totalUnreadMessages: number;
  refreshConversations: () => void;
  fetchMoreMessages: () => Promise<void>;
  conversationWith: (userId: string) => Promise<string>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  // For demo, "me" is the current user
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Build online map
  const onlineUsers: Record<string, boolean> = {};
  demoUsers.forEach(u => { onlineUsers[u.id] = !!u.online; });

  useEffect(() => {
    setIsLoadingConversations(true);
    // Simulate async fetch
    setTimeout(() => {
      setConversations(demoConversations);
      setIsLoadingConversations(false);
    }, 300);
  }, []);

  // When conversation is selected
  const selectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
    setIsLoadingMessages(true);
    setTimeout(() => {
      const convo = (demoConversations.find(c => c.id === conversationId));
      setMessages(convo ? convo.messages : []);
      setIsLoadingMessages(false);
    }, 250);
  };

  // Send message (demo-only)
  const sendMessage = async (recipientId: string, content: string, attachment_url?: string) => {
    const msg: Message = {
      id: uuidv4(),
      sender_id: 'me',
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString(),
      status: 'sent',
      attachment_url,
    };
    // Add message to current conversation
    setMessages(prev => [...prev, msg]);
    setConversations(prevCons =>
      prevCons.map(convo =>
        convo.id === currentConversation
          ? {
              ...convo,
              last_message_text: content,
              last_message_time: msg.created_at,
              messages: [...(convo.messages ?? []), msg]
            }
          : convo
      )
    );
  };

  // Calculate total unread messages across all conversations
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  // Demo: "refresh" simply resets to demo data
  const refreshConversations = () => {
    setIsLoadingConversations(true);
    setTimeout(() => {
      setConversations(demoConversations);
      setIsLoadingConversations(false);
    }, 300);
  };

  // Demo: fetch more messages pagination
  const fetchMoreMessages = async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 250));
    // For demo, does nothing
  };

  // Demo: get conversation id by userId, if it doesn't exist, create a new one
  const conversationWith = async (userId: string) => {
    let convo = conversations.find(
      c => c.participant.id === userId
    );
    if (!convo) {
      // If not exist, create demo conversation
      convo = {
        id: 'c_' + userId,
        participant: demoUsers.find((u) => u.id === userId) || {
          id: userId,
          full_name: `User ${userId}`,
          avatar_url: '',
          online: false
        },
        last_message_text: '',
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        messages: [],
      };
      setConversations((prev) => [...prev, convo!]);
    }
    // Select it
    selectConversation(convo.id);
    return convo.id;
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      currentConversation,
      selectConversation,
      messages,
      sendMessage,
      isLoadingConversations,
      isLoadingMessages,
      onlineUsers,
      totalUnreadMessages,
      refreshConversations,
      fetchMoreMessages,
      conversationWith,
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within a MessagingProvider');
  return ctx;
};
