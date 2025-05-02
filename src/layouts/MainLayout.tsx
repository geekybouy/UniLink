
import { ReactNode } from 'react';
import BottomNav from '@/components/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar is added directly in the pages */}
      
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-4">
        {children}
      </main>

      {/* Bottom Navigation - Only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
};

export default MainLayout;
