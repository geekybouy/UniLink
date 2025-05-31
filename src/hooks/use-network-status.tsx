
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  online: boolean;
  effectiveConnectionType: string | null;
  saveData: boolean | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveConnectionType: null,
    saveData: null,
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setStatus(prevStatus => ({
        ...prevStatus,
        online: navigator.onLine,
      }));
    };

    const updateConnectionQuality = () => {
      // Check if the Network Information API is available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        setStatus({
          online: navigator.onLine,
          effectiveConnectionType: connection?.effectiveType || null,
          saveData: connection?.saveData || null,
        });
      }
    };

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Check if the Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateConnectionQuality);
      }
    }

    // Initialize
    updateOnlineStatus();
    updateConnectionQuality();

    // Clean up
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionQuality);
        }
      }
    };
  }, []);

  return status;
}

export default useNetworkStatus;
