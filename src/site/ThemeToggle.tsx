import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { ui } from './content';
import { setTheme, useTheme } from './theme';

type ThemeToggleProps = {
  lang: Language;
  /** Fixed in the bottom-left corner of the window instead of sitting in the page flow. */
  floating?: boolean;
  /** A bare sun or moon icon, for the header tools on phones (site.css shows it below 861px). */
  compact?: boolean;
};

// Distance from the end of the page under which the floating switch steps aside for the footer.
const FOOTER_CLEARANCE = 96;

/** Light / dark switch. Every instance reads and writes the same theme. */
function ThemeToggle({ lang, floating = false, compact = false }: ThemeToggleProps) {
  const theme = useTheme();
  const [tucked, setTucked] = useState(false);
  const reduced = usePrefersReducedMotion();

  // At the very end of a page the floating switch would sit on the footer line.
  useEffect(() => {
    if (!floating) {
      return undefined;
    }

    let frame = 0;

    const check = () => {
      frame = 0;
      const page = document.documentElement;
      const scrollable = page.scrollHeight > window.innerHeight + FOOTER_CLEARANCE * 2;
      const atEnd = window.innerHeight + window.scrollY >= page.scrollHeight - FOOTER_CLEARANCE;
      setTucked(scrollable && atEnd);
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(check);
      }
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // page changes alter the document height without any scroll event
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(document.body);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [floating]);

  if (compact) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={ui.darkTheme[lang]}
        className="sm-theme-icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark', !reduced)}
      >
        {theme === 'dark' ? (
          <Sun size={20} aria-hidden="true" />
        ) : (
          <Moon size={20} aria-hidden="true" />
        )}
      </button>
    );
  }

  const className = ['sm-theme', floating && 'is-floating', tucked && 'is-tucked']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={ui.darkTheme[lang]}
      className={className}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark', !reduced)}
    >
      <span className="sm-theme__knob" aria-hidden="true" />
      <Sun className="sm-theme__icon is-sun" size={14} aria-hidden="true" />
      <Moon className="sm-theme__icon is-moon" size={14} aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
