
import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  getOptimizedImageUrl, 
  createSrcSet, 
  getConnectionBasedQuality,
  shouldLazyLoad
} from '@/utils/imageOptimizer';
import { useNetworkStatus } from '@/hooks/use-network-status';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazyLoad?: boolean;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  position?: number;
  placeholderColor?: string;
  onLoad?: () => void;
}

export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  quality,
  lazyLoad = true,
  priority = false,
  objectFit = 'cover',
  className = '',
  position = 0,
  placeholderColor = '#f3f4f6',
  onLoad,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { online, effectiveConnectionType } = useNetworkStatus();
  
  // Determine quality based on network if not explicitly set
  const imageQuality = quality || getConnectionBasedQuality();
  
  // Determine if image should be lazy loaded
  const shouldLazy = lazyLoad && shouldLazyLoad(position, isVisible) && !priority;
  
  // Optimize the image URL - use cache key to improve cache hits
  const cacheKey = `${width || 'auto'}-${imageQuality}-${src.split('?')[0]}`;
  const optimizedSrc = React.useMemo(() => 
    getOptimizedImageUrl(src, width, imageQuality), 
    [cacheKey]
  );
  
  const srcSet = React.useMemo(() => 
    createSrcSet(src), 
    [src]
  );
  
  useEffect(() => {
    // Set up intersection observer for detecting when image is in viewport
    if (imageRef.current && !priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' } // Start loading when image is 200px from viewport
      );
      
      observer.observe(imageRef.current);
      
      return () => {
        observer.disconnect();
      };
    } else {
      // Priority images are always considered visible
      setIsVisible(true);
    }
  }, [priority]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };
  
  // If image fails to load, return placeholder
  if (error) {
    return (
      <div 
        className={`bg-gray-200 ${className}`} 
        style={{ 
          width: width || '100%', 
          height: height || 'auto',
          backgroundColor: placeholderColor
        }}
        role="img"
        aria-label={alt}
      />
    );
  }
  
  // Show low quality placeholder until image loads
  const placeholderStyle = !isLoaded ? {
    backgroundColor: placeholderColor,
    filter: 'blur(8px)',
  } : {};
  
  return (
    <div className="relative" style={{ width: width || '100%', height: height || 'auto' }}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{ backgroundColor: placeholderColor }}
        />
      )}
      <img
        ref={imageRef}
        src={optimizedSrc}
        srcSet={srcSet}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : shouldLazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          objectFit,
          ...placeholderStyle
        }}
        {...props}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
