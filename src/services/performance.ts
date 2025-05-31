
/**
 * Performance monitoring service
 */

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('[Performance] Performance API not supported');
      return;
    }

    // Monitor First Contentful Paint
    this.observeFCP();

    // Monitor Largest Contentful Paint
    this.observeLCP();

    // Monitor First Input Delay
    this.observeFID();

    // Monitor Cumulative Layout Shift
    this.observeCLS();

    // Monitor Time to First Byte
    this.measureTTFB();
  }

  /**
   * Observe First Contentful Paint
   */
  private observeFCP(): void {
    const fcpObserver = new PerformanceObserver((entries) => {
      const firstEntry = entries.getEntries()[0];
      this.metrics.fcp = firstEntry ? firstEntry.startTime : null;
      console.debug('[Performance] FCP:', this.metrics.fcp);
      this.reportMetric('FCP', this.metrics.fcp);
    });

    fcpObserver.observe({ type: 'paint', buffered: true });
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    const lcpObserver = new PerformanceObserver((entries) => {
      const lastEntry = entries.getEntries().pop();
      this.metrics.lcp = lastEntry ? lastEntry.startTime : null;
      console.debug('[Performance] LCP:', this.metrics.lcp);
      this.reportMetric('LCP', this.metrics.lcp);
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /**
   * Observe First Input Delay
   */
  private observeFID(): void {
    const fidObserver = new PerformanceObserver((entries) => {
      const firstEntry = entries.getEntries()[0];
      this.metrics.fid = firstEntry ? firstEntry.processingStart - firstEntry.startTime : null;
      console.debug('[Performance] FID:', this.metrics.fid);
      this.reportMetric('FID', this.metrics.fid);
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const clsObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach(entry => {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsEntries.push(entry);
          clsValue += (entry as any).value;
        }
      });

      this.metrics.cls = clsValue;
      console.debug('[Performance] CLS:', this.metrics.cls);
      this.reportMetric('CLS', this.metrics.cls);
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });
  }

  /**
   * Measure Time to First Byte
   */
  private measureTTFB(): void {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      this.metrics.ttfb = navEntry.responseStart;
      console.debug('[Performance] TTFB:', this.metrics.ttfb);
      this.reportMetric('TTFB', this.metrics.ttfb);
    }
  }

  /**
   * Report metric to analytics
   */
  private reportMetric(name: string, value: number | null): void {
    if (value === null) return;

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Measure resource load time
   */
  measureResourceLoad(resourceUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const resourceObserver = new PerformanceObserver((entries) => {
        const entry = entries.getEntries().find(e => e.name.includes(resourceUrl));
        if (entry) {
          resolve(entry.duration);
        }
        resourceObserver.disconnect();
      });

      resourceObserver.observe({ type: 'resource', buffered: true });

      // Fallback in case the resource isn't found
      setTimeout(() => resolve(-1), 10000);
    });
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.debug(`[Performance] Component "${componentName}" render time: ${duration.toFixed(2)}ms`);
      return duration;
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
