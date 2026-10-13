import { useSyncExternalStore } from 'react';

const subscribe = (query: string) => (onChange: () => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }
  const list = window.matchMedia(query);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
};

/** `true` while the media query matches; re-renders when it changes (rotation, resize). */
export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    subscribe(query),
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(query).matches,
    () => false,
  );

/** The phone layout of the site: scene bar at the bottom, "En bref" as a sheet. */
export const PHONE_QUERY = '(max-width: 860px)';
/** The narrowest layout: compact header, poster title on four lines. */
export const NARROW_QUERY = '(max-width: 520px)';
