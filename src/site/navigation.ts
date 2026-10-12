export type Route =
  | { page: 'cover' }
  | { page: 'home' }
  | { page: 'projects' }
  | { page: 'project'; id: string };

export const PROJECTS_HASH = '#/realisations';
/** The home page proper. The bare URL (or `#top`) shows the poster, a page of its own. */
export const HOME_HASH = '#accueil';

export function routeFromHash(hash: string): Route {
  if (hash === '' || hash === '#' || hash === '#top') return { page: 'cover' };
  if (hash === PROJECTS_HASH) return { page: 'projects' };
  if (hash.startsWith(`${PROJECTS_HASH}/`)) {
    const value = hash.slice(PROJECTS_HASH.length + 1);
    try {
      return { page: 'project', id: decodeURIComponent(value) };
    } catch {
      // Invalid encoding should reach the not-found page, not crash the application.
      return { page: 'project', id: value };
    }
  }
  return { page: 'home' };
}

export function focusDestination(hash: string, scroll = true) {
  const main = document.querySelector<HTMLElement>('main:not([aria-busy="true"])');
  if (!main) return;
  const section =
    !hash.startsWith('#/') && hash !== '#top' ? document.getElementById(hash.slice(1)) : null;
  const target =
    section?.querySelector<HTMLElement>('h1, h2') ??
    section ??
    main.querySelector<HTMLElement>('h1') ??
    main;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  if (scroll) {
    if (section) section.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export type Point = { x: number; y: number };

/** The point an iris opens from: the pointer, or the middle of the control for a keyboard click. */
export const clickPoint = (
  event: { clientX: number; clientY: number; detail: number },
  element: Element,
): Point => {
  if (event.detail === 0) {
    const box = element.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return { x: event.clientX, y: event.clientY };
};
