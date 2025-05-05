
import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, createSrcSet } from '@/utils/imageOptimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazyLoad?: boolean;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  lazyLoad = true,
  priority = false,
  objectFit = 'cover',
  className = '',
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Optimize the image URL
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  const srcSet = createSrcSet(src);
  
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
        style={{ width: width || '100%', height: height || 'auto' }}
        role="img"
        aria-label={alt}
      />
    );
  }
  
  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : lazyLoad ? 'lazy' : 'eager'}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        transition: 'opacity 0.3s',
        objectFit 
      }}
      {...props}
    />
  );
}

export default OptimizedImage;
