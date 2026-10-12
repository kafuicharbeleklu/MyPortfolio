import React, { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { MotionConfig } from 'motion/react';
import type { Language } from '../translations';
import BriefDrawer from './BriefDrawer';
import CoverPage from './CoverPage';
import HomePage from './HomePage';
import SiteHeader from './SiteHeader';
import ThemeToggle from './ThemeToggle';
import { projects, sectionIds, ui, type SectionId } from './content';
import {
  HOME_HASH,
  clickPoint,
  focusDestination,
  routeFromHash,
  type Point,
  type Route,
} from './navigation';
import './site.css';

const ProjectsPage = React.lazy(() => import('./ProjectsPage'));
const ProjectPage = React.lazy(() => import('./ProjectPage'));
const Chatbot = React.lazy(() => import('./Chatbot'));

export type { Route } from './navigation';

const LANG_KEY = 'portfolio_lang';
const OPENED_KEY = 'sm_opened';
// `data-transition` on <html> picks the page transition in site.css: the diagonal cut by default,
// the iris opening from the click when leaving the poster
const IRIS = 'iris';

/** Writes the iris origin on <html> for the CSS keyframes, with the radius that reaches every corner. */
const setIrisOrigin = (point: Point) => {
  const reach = Math.max(
    Math.hypot(point.x, point.y),
    Math.hypot(window.innerWidth - point.x, point.y),
    Math.hypot(point.x, window.innerHeight - point.y),
    Math.hypot(window.innerWidth - point.x, window.innerHeight - point.y),
  );
  const style = document.documentElement.style;
  style.setProperty('--sm-iris-x', `${Math.round(point.x)}px`);
  style.setProperty('--sm-iris-y', `${Math.round(point.y)}px`);
  style.setProperty('--sm-iris-r', `${Math.ceil(reach)}px`);
};

const getInitialLang = (): Language => {
  if (typeof window === 'undefined') {
    return 'FR';
  }

  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'FR' || saved === 'EN') {
      return saved;
    }
  } catch {
    // storage can be unavailable (private mode); fall back to the browser language
  }

  return window.navigator.language.toLowerCase().startsWith('fr') ? 'FR' : 'EN';
};

const getRoute = (): Route => {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  return routeFromHash(hash);
};

// Keep explicit section links. Their targets are scrolled to after React mounts the page.
const startAtTop = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
};

startAtTop();

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Page changes go through a view transition (the diagonal cut, or the cube turn when leaving the
// poster: see site.css); language changes remain immediate. The `data-transition` flag is
// cleared once the transition is over, whatever happens.
const withTransition = (update: () => void) => {
  const root = document.documentElement;
  const clear = () => {
    delete root.dataset.transition;
    root.style.removeProperty('--sm-iris-x');
    root.style.removeProperty('--sm-iris-y');
    root.style.removeProperty('--sm-iris-r');
  };

  if (typeof document.startViewTransition === 'function' && !prefersReducedMotion()) {
    const transition = document.startViewTransition(() => flushSync(update));
    transition.finished.then(clear, clear);
  } else {
    update();
    clear();
  }
};

const isSameView = (a: Route, b: Route) =>
  a.page === b.page && (a.page !== 'project' || b.page !== 'project' || a.id === b.id);

// The opening curtain plays once per browser session.
const shouldOpen = () => {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(OPENED_KEY) === null;
  } catch {
    return false;
  }
};

// Inside Suspense: this commits only when the requested page has actually mounted.
function PageArrival({
  hash,
  restore,
  children,
}: {
  hash: string;
  restore: boolean;
  children: React.ReactNode;
}) {
  useLayoutEffect(() => {
    if (!restore) focusDestination(hash);
  }, [hash, restore]);
  return <>{children}</>;
}

function SiteRoot() {
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [route, setRoute] = useState<Route>(getRoute);
  const [activeSection, setActiveSection] = useState<SectionId | ''>('');
  const [curtain, setCurtain] = useState(shouldOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);
  const [backFromProject, setBackFromProject] = useState(false);
  const routeRef = useRef(route);
  // true between the click that leaves the poster and the arrival on the destination
  const exitingRef = useRef(false);
  const projectId = route.page === 'project' ? route.id : '';

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  // if the lifted curtain never reports the end of its animation, drop it from the tree anyway
  useEffect(() => {
    if (!curtain) {
      return undefined;
    }
    const id = window.setTimeout(() => setCurtain(false), 1800);
    return () => window.clearTimeout(id);
  }, [curtain]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(OPENED_KEY, '1');
    } catch {
      // ignore: the curtain will simply play again next time
    }
    // warm the other pages so a transition never lands on an empty screen
    void import('./ProjectsPage').catch(() => undefined);
    void import('./ProjectPage').catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'FR' ? 'fr' : 'en';
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore: the choice simply will not persist
    }
  }, [lang]);

  useEffect(() => {
    const owner = 'Kafui Charbel Eklu';
    const project = projects.find((item) => item.id === projectId);

    if (route.page === 'project' && project) {
      document.title = `${project.title[lang]} · ${owner}`;
    } else if (route.page === 'projects') {
      document.title = `${ui.projectsKicker[lang]} · ${owner}`;
    } else {
      document.title = `${owner} · ${ui.siteTitle[lang]}`;
    }
  }, [lang, route.page, projectId]);

  useEffect(() => {
    const handleHashChange = () => {
      const next = getRoute();
      const previous = routeRef.current;
      const update = () => {
        setMenuOpen(false);
        setBackFromProject(next.page === 'projects' && previous.page === 'project');
        setHash(window.location.hash);
        setRoute(next);
        routeRef.current = next;
        exitingRef.current = false;
      };

      if (isSameView(previous, next)) {
        update();
        delete document.documentElement.dataset.transition;
      } else {
        withTransition(update);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (route.page !== 'home' || typeof IntersectionObserver === 'undefined') {
      setActiveSection('');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [route.page]);

  // Leaving the poster: an iris opens from the click (the door, or any link into the site) and
  // reveals the destination. Anything but a hash as destination means the home page.
  const leaveCover = useCallback((destination?: string, point?: Point) => {
    if (routeRef.current.page !== 'cover' || exitingRef.current) {
      return;
    }

    const target =
      typeof destination === 'string' && destination.startsWith('#') ? destination : HOME_HASH;
    exitingRef.current = true;
    if (!prefersReducedMotion()) {
      setIrisOrigin(point ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      document.documentElement.dataset.transition = IRIS;
    }
    window.location.hash = target;
  }, []);

  // On the cover, every link into the site (header, menu, poster, drawer) leaves through the
  // iris too, opening from the click, then lands on its destination. '#top' and '#' stay on the poster.
  const interceptCoverLinks = (event: React.MouseEvent<HTMLDivElement>) => {
    if (routeRef.current.page !== 'cover' || event.defaultPrevented || event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = link?.getAttribute('href') ?? '';
    if (!link || hash === '#' || hash === '#top') {
      return;
    }
    event.preventDefault();
    leaveCover(hash, clickPoint(event, link));
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="sm"
        id="top"
        data-menu-open={menuOpen || undefined}
        onClickCapture={interceptCoverLinks}
      >
        <SiteHeader
          lang={lang}
          onLangChange={setLang}
          page={route.page}
          activeSection={activeSection}
          menuOpen={menuOpen}
          onMenuChange={setMenuOpen}
        />
        <Suspense
          fallback={
            <main className="sm-wrap sm-loading" aria-busy="true">
              <p role="status">{lang === 'FR' ? 'Chargement…' : 'Loading…'}</p>
            </main>
          }
        >
          <PageArrival hash={hash} restore={backFromProject}>
            {route.page === 'cover' && (
              <CoverPage lang={lang} onExit={(point) => leaveCover(HOME_HASH, point)} />
            )}
            {route.page === 'home' && <HomePage lang={lang} />}
            {route.page === 'projects' && <ProjectsPage lang={lang} restore={backFromProject} />}
            {route.page === 'project' && <ProjectPage key={projectId} lang={lang} id={projectId} />}
          </PageArrival>
        </Suspense>
        <ThemeToggle lang={lang} floating />
        <BriefDrawer lang={lang} />
        <Suspense fallback={null}>
          <Chatbot lang={lang} suspended={menuOpen} />
        </Suspense>
        {curtain && (
          <div
            className="sm-curtain sm-twill"
            aria-hidden="true"
            onAnimationEnd={() => setCurtain(false)}
          />
        )}
      </div>
    </MotionConfig>
  );
}

export default SiteRoot;
