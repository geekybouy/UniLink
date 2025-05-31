
/**
 * Image optimization utility functions for better performance
 */

// Image quality constants
const HIGH_QUALITY = 90;
const MEDIUM_QUALITY = 75;
const LOW_QUALITY = 60;

// Screen size breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Gets the appropriate image size based on screen width
 * @param width Original image width
 * @param screenSize Current screen size
 */
export const getOptimizedWidth = (width: number, screenSize = window.innerWidth): number => {
  if (screenSize < BREAKPOINTS.sm) return Math.min(width, 320);
  if (screenSize < BREAKPOINTS.md) return Math.min(width, 640);
  if (screenSize < BREAKPOINTS.lg) return Math.min(width, 768);
  if (screenSize < BREAKPOINTS.xl) return Math.min(width, 1024);
  return width;
};

/**
 * Creates a srcset attribute for responsive images
 * @param src Base image URL
 */
export const createSrcSet = (src: string): string => {
  if (!src) return '';
  
  // Handle already optimized images or external URLs
  if (src.includes('?w=') || !src.startsWith('/')) return src;
  
  return `${src}?w=320 320w, 
          ${src}?w=640 640w, 
          ${src}?w=768 768w, 
          ${src}?w=1024 1024w, 
          ${src}?w=1280 1280w`;
};

/**
 * Creates an optimized image URL with quality and width parameters
 * @param src Original image URL
 * @param width Desired width
 * @param quality Image quality (0-100)
 */
export const getOptimizedImageUrl = (
  src: string, 
  width?: number, 
  quality: number = MEDIUM_QUALITY
): string => {
  if (!src) return '';
  
  // Don't modify external URLs
  if (src.startsWith('http') && !src.includes(window.location.hostname)) {
    return src;
  }
  
  // Start with base URL
  let optimizedUrl = src;
  
  // Add width if specified
  if (width) {
    optimizedUrl += optimizedUrl.includes('?') ? '&' : '?';
    optimizedUrl += `w=${width}`;
  }
  
  // Add quality parameter
  optimizedUrl += optimizedUrl.includes('?') ? '&' : '?';
  optimizedUrl += `q=${quality}`;
  
  return optimizedUrl;
};

/**
 * Determines image quality based on network connection
 */
export const getConnectionBasedQuality = (): number => {
  // Check if Network Information API is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection) {
      // Use data saver preference if available
      if (connection.saveData) {
        return LOW_QUALITY;
      }
      
      // Adjust quality based on connection type
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return LOW_QUALITY;
        case '3g':
          return MEDIUM_QUALITY;
        case '4g':
          return HIGH_QUALITY;
        default:
          return MEDIUM_QUALITY;
      }
    }
  }
  
  // Default to medium quality if Network Information API is not available
  return MEDIUM_QUALITY;
};

/**
 * Determines if an image should be lazy loaded based on its position
 * @param position Position of the image in a list (0-based index)
 * @param isVisible Whether the image container is in viewport
 */
export const shouldLazyLoad = (position: number = 0, isVisible: boolean = false): boolean => {
  // Always eager-load the first few images or visible images
  return position > 2 && !isVisible;
};

