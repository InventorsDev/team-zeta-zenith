/**
 * Performance monitoring utilities
 */

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  if (typeof window === 'undefined' || !window.performance) return;

  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;

  return {
    start: () => {
      performance.mark(startMark);
    },
    end: () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      console.log(`[Performance] ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);

      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    },
  };
}

/**
 * Monitor Web Vitals
 */
export function reportWebVitals(metric: any) {
  console.log('[Web Vitals]', metric);

  // Send to analytics service
  if (import.meta.env.PROD) {
    // Example: Send to analytics
    // analytics.track('Web Vitals', metric);
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images when they enter viewport
 */
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'script' | 'style' | 'image' | 'font') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Page load metrics
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
    domInteractive: navigation?.domInteractive - navigation?.fetchStart,

    // Paint metrics
    firstPaint: paint.find((entry) => entry.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime,

    // Resource timing
    totalResourceSize: performance
      .getEntriesByType('resource')
      .reduce((total, resource: any) => total + (resource.transferSize || 0), 0),

    // Memory (if available)
    memory: (performance as any).memory
      ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        }
      : null,
  };
}

/**
 * Log performance metrics to console (dev only)
 */
export function logPerformanceMetrics() {
  if (import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      if (metrics) {
        console.table({
          'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
          'Load Complete': `${metrics.loadComplete?.toFixed(2)}ms`,
          'DOM Interactive': `${metrics.domInteractive?.toFixed(2)}ms`,
          'First Paint': `${metrics.firstPaint?.toFixed(2)}ms`,
          'First Contentful Paint': `${metrics.firstContentfulPaint?.toFixed(2)}ms`,
          'Total Resource Size': `${(metrics.totalResourceSize / 1024).toFixed(2)}KB`,
        });

        if (metrics.memory) {
          console.log('[Memory]', {
            Used: `${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            Total: `${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            Limit: `${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      }
    }, 0);
  });
}
