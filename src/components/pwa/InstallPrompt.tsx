
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the user has dismissed the prompt before
    const hasUserDismissedPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    if (hasUserDismissedPrompt === 'true') {
      setIsDismissed(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if not dismissed
      if (hasUserDismissedPrompt !== 'true') {
        showInstallPrompt();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = () => {
    if (!deferredPrompt) return;
    
    toast(
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Install UniLink App</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 -mr-2" 
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm">Install UniLink on your device for a better experience and offline access.</p>
        <div className="flex gap-2 mt-1">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={installApp}
          >
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
        </div>
      </div>,
      {
        duration: 10000,
        id: 'pwa-install',
      }
    );
  };

  const installApp = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt as it can't be used again
      setDeferredPrompt(null);
      toast.dismiss('pwa-install');
    });
  };

  const dismissPrompt = () => {
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    setIsDismissed(true);
    toast.dismiss('pwa-install');
  };

  return null; // This component doesn't render anything visible
}

export default InstallPrompt;
