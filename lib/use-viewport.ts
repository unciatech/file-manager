import { useState, useEffect } from 'react';

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

interface UseViewportOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

/**
 * Custom hook to detect and track viewport mode (mobile, tablet, or desktop)
 * @param options - Optional breakpoint overrides
 * @returns Current viewport mode and window width
 */
export function useViewport(options?: UseViewportOptions) {
  const mobileBreakpoint = options?.mobileBreakpoint ?? BREAKPOINTS.mobile;
  const tabletBreakpoint = options?.tabletBreakpoint ?? BREAKPOINTS.tablet;

  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateViewport = () => {
      const windowWidth = window.innerWidth;
      setWidth(windowWidth);

      if (windowWidth < mobileBreakpoint) {
        setViewportMode('mobile');
      } else if (windowWidth < tabletBreakpoint) {
        setViewportMode('tablet');
      } else {
        setViewportMode('desktop');
      }
    };

    // Initialize on mount
    updateViewport();

    // Listen for resize events
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [mobileBreakpoint, tabletBreakpoint]);

  return {
    viewportMode,
    width,
    isMobile: viewportMode === 'mobile',
    isTablet: viewportMode === 'tablet',
    isDesktop: viewportMode === 'desktop',
    isMobileOrTablet: viewportMode === 'mobile' || viewportMode === 'tablet',
  };
}
