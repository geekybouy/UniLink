import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import UpdatePrompt from '@/components/pwa/UpdatePrompt';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import NetworkStatus from '@/components/NetworkStatus';

type MainLayoutProps = {
  children: ReactNode;
  hideFooter?: boolean;
};

const MainLayout = ({ children, hideFooter = false }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  // Debug output
  if (typeof window !== "undefined") {
    console.log("MainLayout render: isMobile =", isMobile, "window.innerWidth =", window.innerWidth);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      {/* PWA Components */}
      <UpdatePrompt />
      <InstallPrompt />
      <NetworkStatus />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow pt-16 pb-20 md:pb-4 w-full min-h-[70vh] bg-background">
        {/* DEBUG: Give a colored border for mobile */}
        <div className="block md:hidden border-2 border-blue-400 rounded-lg p-1">
          {/* Only visible on mobile for troubleshooting background/border */}
          <span className="text-xs text-blue-700 font-bold">[MOBILE MAIN WRAPPER]</span>
        </div>
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
