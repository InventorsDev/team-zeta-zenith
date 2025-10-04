import { useState, useEffect, useRef, type ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtual scrolling list component for performance with large datasets
 * Only renders visible items + overscan buffer
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to calculate dynamic item heights (for variable height items)
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  estimatedItemHeight: number = 50
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Measure actual item heights after render
    const newHeights = new Map<number, number>();
    itemRefs.current.forEach((element, index) => {
      if (element) {
        newHeights.set(index, element.getBoundingClientRect().height);
      }
    });
    setItemHeights(newHeights);
  }, [items]);

  const getItemHeight = (index: number) => {
    return itemHeights.get(index) || estimatedItemHeight;
  };

  const getTotalHeight = () => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  };

  const getVisibleRange = () => {
    let currentHeight = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentHeight + height > scrollTop) {
        startIndex = Math.max(0, i - 1);
        break;
      }
      currentHeight += height;
    }

    // Find end index
    currentHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height = getItemHeight(i);
      currentHeight += height;
      if (currentHeight > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + 1);
        break;
      }
    }

    return { startIndex, endIndex };
  };

  return {
    scrollTop,
    setScrollTop,
    getItemHeight,
    getTotalHeight,
    getVisibleRange,
    itemRefs,
  };
}
