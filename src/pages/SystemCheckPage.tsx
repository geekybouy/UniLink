
import React from 'react';
import MainLayout from '@/layouts/MainLayout'; // Assuming you have a MainLayout
import SystemCheckDashboard from '@/components/system-check/SystemCheckDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';

const SystemCheckPage: React.FC = () => {
  return (
    <MainLayout>
      <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height as needed */}
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold">UniLink System Check</h1>
            <p className="text-muted-foreground">
              Verify core functionalities and system health.
            </p>
          </header>
          <SystemCheckDashboard />
        </div>
      </ScrollArea>
    </MainLayout>
  );
};

export default SystemCheckPage;

