import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized image component with:
 * - Lazy loading
 * - Intersection Observer
 * - Placeholder support
 * - Error fallback
 * - Progressive loading
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  placeholder,
  aspectRatio,
  objectFit = 'cover',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image is visible
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 dark:border-gray-600 border-r-transparent" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${hasError ? 'opacity-50' : ''}
        `}
        style={{ objectFit }}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}

/**
 * Image cache utility
 */
class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();

  preload(urls: string[]) {
    urls.forEach((url) => {
      if (!this.cache.has(url)) {
        const img = new Image();
        img.src = url;
        this.cache.set(url, img);
      }
    });
  }

  clear() {
    this.cache.clear();
  }

  get(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }
}

export const imageCache = new ImageCache();

/**
 * Hook to preload images
 */
export function useImagePreload(urls: string[]) {
  useEffect(() => {
    if (urls.length > 0) {
      imageCache.preload(urls);
    }
  }, [urls]);
}
