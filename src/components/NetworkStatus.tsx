
import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function NetworkStatus() {
  const { online, effectiveConnectionType } = useNetworkStatus();
  const [previousOnline, setPreviousOnline] = useState(online);

  useEffect(() => {
    // Only show notifications when the status changes, not on initial render
    if (previousOnline !== online) {
      if (online) {
        // Back online
        toast.success(
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>You're back online</span>
          </div>
        );
      } else {
        // Went offline
        toast.error(
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline</span>
          </div>,
          {
            duration: 5000,
          }
        );
      }
      
      setPreviousOnline(online);
    }
  }, [online, previousOnline]);

  // Don't render anything if online
  if (online) return null;

  return (
    <Alert 
      variant="destructive" 
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 animate-fade-in"
    >
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You're offline</AlertTitle>
      <AlertDescription>
        Some features may not be available. We'll keep trying to reconnect.
      </AlertDescription>
    </Alert>
  );
}

export default NetworkStatus;
