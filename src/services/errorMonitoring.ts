
/**
 * Error monitoring service
 */

// The DSN should be set as an environment variable in production
const SENTRY_DSN = ''; // Replace with your Sentry DSN

/**
 * Initialize error monitoring
 */
export const initErrorMonitoring = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!SENTRY_DSN || window.Sentry) {
      resolve(true);
      return;
    }

    try {
      // Load Sentry
      const script = document.createElement('script');
      script.crossOrigin = 'anonymous';
      script.src = 'https://js.sentry-cdn.com/your-key.min.js'; // Replace with your actual script URL
      
      script.onload = () => {
        if (window.Sentry) {
          window.Sentry.init({
            dsn: SENTRY_DSN,
            release: import.meta.env.VITE_APP_VERSION || '1.0.0',
            environment: import.meta.env.MODE || 'production',
            integrations: [
              new window.Sentry.BrowserTracing(),
              new window.Sentry.Replay(),
            ],
            tracesSampleRate: 1.0, // Capture 100% of transactions in development, lower in prod
            replaysSessionSampleRate: 0.1, // Sample 10% of sessions
          });
          
          console.debug('[ErrorMonitoring] Initialized');
          resolve(true);
        } else {
          console.error('[ErrorMonitoring] Failed to initialize Sentry');
          resolve(false);
        }
      };
      
      script.onerror = () => {
        console.error('[ErrorMonitoring] Failed to load Sentry script');
        resolve(false);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('[ErrorMonitoring] Initialization error:', error);
      resolve(false);
    }
  });
};

/**
 * Capture and report an error
 */
export const captureError = (error: Error, context?: Record<string, any>): void => {
  console.error('[Error]', error);
  
  if (window.Sentry) {
    if (context) {
      window.Sentry.setContext('additional', context);
    }
    window.Sentry.captureException(error);
  }
};

/**
 * Set user information for error reports
 */
export const setErrorUser = (
  userId: string | null, 
  userData?: { email?: string; username?: string }
): void => {
  if (window.Sentry) {
    if (userId) {
      window.Sentry.setUser({
        id: userId,
        ...userData,
      });
    } else {
      window.Sentry.setUser(null);
    }
  }
};

// Update global declaration
declare global {
  interface Window {
    Sentry?: {
      init: (config: any) => void;
      captureException: (error: Error) => void;
      setUser: (user: any) => void;
      setContext: (name: string, context: Record<string, any>) => void;
      BrowserTracing: any;
      Replay: any;
    };
  }
}
