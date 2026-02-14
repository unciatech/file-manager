import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    if (node) {
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        observer.current = new IntersectionObserver(
          ([newEntry]) => {
            setEntry(newEntry);
          },
          { threshold, root, rootMargin }
        );

        observer.current.observe(node);
      }
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin]);

  return { ref: setNode, entry };
}
