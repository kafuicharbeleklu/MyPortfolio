import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

// Same key as the inline script of index.html, which applies the saved theme before first paint.
const THEME_KEY = 'portfolio_theme';
// Colour of the browser chrome (address bar on phones): the page ground of each theme.
const GROUND: Record<Theme, string> = { light: '#e9e0d2', dark: '#1c1d1f' };
// How long `sm-theme-fade` stays on <html>; a little longer than the transition in site.css.
const FADE_MS = 500;

const listeners = new Set<() => void>();
let fadeTimer = 0;

/** The `data-theme` attribute of <html> is the single source of truth. */
export const getTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'
    ? 'light'
    : 'dark';

const syncBrowserChrome = (theme: Theme) => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', GROUND[theme]);
};

/**
 * Switches the theme everywhere at once. With `animate`, every colour of the page eases to its
 * new value instead of snapping (see `.sm-theme-fade` in site.css).
 */
export const setTheme = (theme: Theme, animate: boolean) => {
  const root = document.documentElement;

  if (animate) {
    root.classList.add('sm-theme-fade');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => root.classList.remove('sm-theme-fade'), FADE_MS);
  }

  root.dataset.theme = theme;
  syncBrowserChrome(theme);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore: the choice simply will not persist
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Current theme, shared by every switch on the page. */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme, (): Theme => 'dark');

// A visitor returning in dark mode gets the matching browser chrome from the first frame.
if (typeof document !== 'undefined') {
  syncBrowserChrome(getTheme());
}
