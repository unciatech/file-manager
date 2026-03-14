import { useCallback, useEffect, useMemo, useState } from "react";

// Custom event name dispatched after every history.pushState call
// so React state updates are triggered without a full page reload.
const LOCATION_CHANGE_EVENT = "locationchange";

if (typeof window !== "undefined" && !(window as any).__navigationPatched) {
  (window as any).__navigationPatched = true;
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    setTimeout(() => window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT)), 0);
    return result;
  };

  window.history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    setTimeout(() => window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT)), 0);
    return result;
  };
}

interface BrowserRouterOptions {
  /**
   * The base path used to extract dynamic path params.
   * e.g. "/media" → pathname "/media/123" gives params.path = "123"
   */
  basePath?: string;
  /**
   * Optional navigation callback. When provided, all URL navigation is
   * delegated to this function instead of calling history.pushState directly.
   * Use this to integrate with your app's existing router so it stays in
   * full control of the URL:
   *
   *   - React Router:    onNavigate={(url, opts) => navigate(url, { replace: opts?.replace })}
   *   - Next.js:         onNavigate={(url, opts) => opts?.replace ? router.replace(url) : router.push(url)}
   *   - TanStack Router: onNavigate={(url, opts) => router.navigate({ href: url, replace: opts?.replace })}
   *
   * If omitted, falls back to history.pushState/replaceState (suitable for bare React apps).
   */
  onNavigate?: (url: string, options?: { replace?: boolean; scroll?: boolean }) => void;
}

/**
 * A zero-dependency, framework-agnostic router hook built on native
 * browser APIs. Provides the same surface area previously covered by
 * next/navigation without causing full page reloads.
 */
export function useBrowserRouter({ basePath, onNavigate }: BrowserRouterOptions = {}) {
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  // Re-sync state whenever the URL changes (back/forward or our custom push)
  useEffect(() => {
    const onUpdate = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };

    // popstate fires on browser back/forward
    window.addEventListener("popstate", onUpdate);
    // locationchange fires when we call push() below (our own fallback)
    window.addEventListener(LOCATION_CHANGE_EVENT, onUpdate);

    return () => {
      window.removeEventListener("popstate", onUpdate);
      window.removeEventListener(LOCATION_CHANGE_EVENT, onUpdate);
    };
  }, []);

  /**
   * Navigate to a new URL without a full page reload.
   *
   * - If onNavigate is supplied → delegates entirely to the host app's router.
   *   The host router (React Router, Next.js, etc.) handles the URL update and
   *   fires the events our listener already watches (popstate / locationchange).
   * - Otherwise → calls history.pushState directly and fires a synthetic
   *   locationchange event so our React state updates.
   */
  const push = useCallback(
    (url: string, options?: { scroll?: boolean }) => {
      if (onNavigate) {
        // Let the host app's router own the navigation
        onNavigate(url, options);
      } else {
        // Fallback: bare React app with no external router
        history.pushState(null, "", url);
        if (options?.scroll !== false) {
          window.scrollTo(0, 0);
        }
      }
    },
    [onNavigate]
  );

  /**
   * Replace the current history entry without adding a new one.
   * Use this for URL param updates that shouldn't create a new back-button step
   * (e.g. resetting pagination when navigating to a folder).
   */
  const replace = useCallback(
    (url: string) => {
      if (onNavigate) {
        onNavigate(url, { replace: true });
      } else {
        history.replaceState(null, "", url);
      }
    },
    [onNavigate]
  );

  /**
   * Go back in browser history.
   * Works regardless of which router the host app uses.
   */
  const back = useCallback(() => {
    history.back();
  }, []);

  /**
   * Parsed URLSearchParams — reactive, re-created when search string changes.
   */
  const searchParams = useMemo(
    () => new URLSearchParams(search),
    [search]
  );

  /**
   * Extracts dynamic path segments relative to basePath.
   * e.g. basePath="/media", pathname="/media/123" → { path: "123" }
   */
  const params = useMemo<Record<string, string | undefined>>(() => {
    if (!basePath) return {};

    const base = basePath.replace(/\/$/, "");
    const normalizedBase = base.startsWith('/') ? base : `/${base}`;
    if (!pathname.startsWith(normalizedBase)) return {};

    const rest = pathname.slice(normalizedBase.length).replace(/^\//, "");
    if (!rest) return {};

    const segments = rest.split("/").filter(Boolean);
    return { path: segments[0] };
  }, [pathname, basePath]);

  return { push, replace, back, pathname, searchParams, params };
}
