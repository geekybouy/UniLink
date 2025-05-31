
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for new service worker updates
      window.addEventListener('sw-update-found', () => {
        setUpdateAvailable(true);
        
        toast.warning(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>App update available</span>
            </div>
            <p className="text-sm">A new version is available. Update now for the latest features.</p>
            <Button 
              size="sm" 
              className="mt-1 w-full"
              onClick={updateServiceWorker}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Now
            </Button>
          </div>,
          {
            duration: Infinity,
            id: 'sw-update',
          }
        );
      });
      
      // Set up the service worker registration
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
      });
    }
  }, []);
  
  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload once the new service worker becomes active
      registration.waiting.addEventListener('statechange', (e) => {
        if ((e.target as ServiceWorker).state === 'activated') {
          window.location.reload();
        }
      });
    }
    
    toast.dismiss('sw-update');
  };

  return null; // This component doesn't render anything, it just shows toast notifications
}

export default UpdatePrompt;
