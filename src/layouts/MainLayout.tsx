
import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import UpdatePrompt from '@/components/pwa/UpdatePrompt';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import NetworkStatus from '@/components/NetworkStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

type MainLayoutProps = {
  children: ReactNode;
  hideFooter?: boolean;
};

const MainLayout = ({ children, hideFooter = false }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-background ${theme === 'dark' ? 'text-foreground' : ''}`}>
      {/* PWA Components */}
      <UpdatePrompt />
      <InstallPrompt />
      <NetworkStatus />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow pt-16 pb-20 md:pb-4">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Bottom Navigation - Only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
};

export default MainLayout;
