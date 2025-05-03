
import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ConversationView } from '@/components/messaging/ConversationView';
import { useMessaging } from '@/contexts/MessagingContext';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

const MessagingPage = () => {
  const { currentConversation, selectConversation } = useMessaging();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check for conversation parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const conversationId = searchParams.get('conversation');
    
    if (conversationId) {
      selectConversation(conversationId);
      
      // In mobile view, show conversation directly
      if (isMobileView) {
        setShowConversationList(false);
      }
    }
  }, [location.search, selectConversation, isMobileView]);
  
  // In mobile view, show conversation view when a conversation is selected
  useEffect(() => {
    if (isMobileView && currentConversation) {
      setShowConversationList(false);
    }
  }, [currentConversation, isMobileView]);
  
  const handleBack = () => {
    setShowConversationList(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] border rounded-md overflow-hidden">
          {/* Conversation List (always visible on desktop, conditionally on mobile) */}
          {(showConversationList || !isMobileView) && (
            <div className={`${isMobileView ? 'w-full' : 'w-1/3 border-r'} h-full bg-white`}>
              <ConversationList />
            </div>
          )}
          
          {/* Conversation View (always visible on desktop, conditionally on mobile) */}
          {(!showConversationList || !isMobileView) && (
            <div className={`${isMobileView ? 'w-full' : 'w-2/3'} h-full bg-white flex flex-col`}>
              <ConversationView onBack={isMobileView ? handleBack : undefined} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagingPage;
