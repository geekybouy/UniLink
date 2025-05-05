
type EventOptions = {
  category?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  [key: string]: any;
};

class Analytics {
  private initialized = false;
  private queue: Array<() => void> = [];

  constructor() {
    // Setup queue for events before initialization
    this.queue = [];

    // Try to initialize automatically when the script is loaded
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize analytics providers
   */
  initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.initialized) {
        resolve(true);
        return;
      }

      try {
        // Load Google Analytics
        this.loadGoogleAnalytics();
        
        // Process queued events
        this.processQueue();
        
        this.initialized = true;
        resolve(true);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        resolve(false);
      }
    });
  }

  /**
   * Load Google Analytics script
   */
  private loadGoogleAnalytics(): void {
    // Check if GA is already loaded
    if (window.gtag) return;

    const MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA measurement ID
    
    // Create script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });
    
    // Add script to document
    document.head.appendChild(script);
  }

  /**
   * Process queued events
   */
  private processQueue(): void {
    this.queue.forEach(fn => fn());
    this.queue = [];
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    const handler = () => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_title: title || document.title
        });
      }
      
      console.debug('[Analytics] Tracked page view:', path);
    };

    if (this.initialized) {
      handler();
    } else {
      this.queue.push(handler);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(action: string, options: EventOptions = {}): void {
    const handler = () => {
      const { category, label, value, nonInteraction, ...rest } = options;
      
      // Track in Google Analytics
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          non_interaction: nonInteraction,
          ...rest
        });
      }
      
      console.debug('[Analytics] Tracked event:', action, options);
    };

    if (this.initialized) {
      handler();
    } else {
      this.queue.push(handler);
    }
  }

  /**
   * Set user identity
   */
  setUser(userId: string, properties: Record<string, any> = {}): void {
    const handler = () => {
      // Set user ID in Google Analytics
      if (window.gtag) {
        window.gtag('set', {
          user_id: userId,
          ...properties
        });
      }
      
      console.debug('[Analytics] Set user:', userId, properties);
    };

    if (this.initialized) {
      handler();
    } else {
      this.queue.push(handler);
    }
  }
}

// Add typings for global window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Create singleton instance
const analytics = new Analytics();
export default analytics;
