import { lazy, Suspense, type ComponentType } from 'react';
import { PageLoader } from './ui/LoadingSpinner';

/**
 * Utility to lazy load components with a loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <PageLoader message="Loading..." />
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: any) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Loading fallback for sections/components
 */
export function ComponentLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
