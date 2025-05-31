import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ConversationView } from '@/components/messaging/ConversationView';
import { useMessaging } from '@/contexts/MessagingContext';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ErrorBoundary from "@/components/ErrorBoundary";

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      selectConversation(conversationId);
      if (isMobileView) {
        setShowConversationList(false);
      }
    }
  }, [location.search, selectConversation, isMobileView]);

  useEffect(() => {
    if (isMobileView && currentConversation) {
      setShowConversationList(false);
    }
  }, [currentConversation, isMobileView]);

  const handleBack = () => {
    setShowConversationList(true);
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] border rounded-md overflow-hidden bg-background">
            {(showConversationList || !isMobileView) && (
              <div className={`${isMobileView ? 'w-full' : 'w-1/3 border-r'} h-full bg-background`}>
                <ConversationList />
              </div>
            )}
            {(!showConversationList || !isMobileView) && (
              <div className={`${isMobileView ? 'w-full' : 'w-2/3'} h-full bg-background flex flex-col`}>
                <ConversationView onBack={isMobileView ? handleBack : undefined} />
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default MessagingPage;
