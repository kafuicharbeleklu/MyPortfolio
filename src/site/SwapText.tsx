import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

type SwapTextProps = {
  text: string;
};

const SLIDE = { duration: 520, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' };
const OUT = [{ transform: 'translateX(0)' }, { transform: 'translateX(112%)' }];
const IN = [{ transform: 'translateX(-112%)' }, { transform: 'translateX(0)' }];
// without pseudo-element animation the same letter leaves to the right and returns from the left
const ROUND_TRIP = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(112%)', offset: 0.5 },
  { transform: 'translateX(-112%)', offset: 0.5 },
  { transform: 'translateX(0)' },
];

const pause = () => 3000 + Math.random() * 1200;

/**
 * A word whose letters occasionally slip sideways and are replaced by an identical copy:
 * every few seconds one or two random letters slide out to the right while their twin
 * slides in from the left. The word never changes, it just "ticks".
 *
 * Each letter exists once in the page: the twin is the `::after` pseudo-element of its box
 * (see `.sm-swap__letter::after`), so the text reads and copies normally. The word is marked
 * decorative; the heading that contains it carries the accessible name.
 */
function SwapText({ text }: SwapTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || typeof root.animate !== 'function') {
      return undefined;
    }

    const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-letter]'));
    let timer = 0;
    let visible = false;

    const swap = (letter: HTMLElement) => {
      const glyph = letter.firstElementChild as HTMLElement | null;
      if (!glyph) {
        return;
      }

      try {
        letter.animate(IN, { ...SLIDE, pseudoElement: '::after' });
        glyph.animate(OUT, SLIDE);
      } catch {
        glyph.animate(ROUND_TRIP, { duration: SLIDE.duration * 2, easing: SLIDE.easing });
      }
    };

    const tick = () => {
      if (visible && !document.hidden && letters.length > 0) {
        const first = letters[Math.floor(Math.random() * letters.length)];
        swap(first);
        if (Math.random() < 0.5 && letters.length > 1) {
          const second = letters[Math.floor(Math.random() * letters.length)];
          if (second !== first) {
            window.setTimeout(() => swap(second), 150 + Math.random() * 150);
          }
        }
      }
      timer = window.setTimeout(tick, pause());
    };

    // letters only move while the word is on screen
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(root);
    timer = window.setTimeout(tick, pause());

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [reduced, text]);

  return (
    <span ref={rootRef} className="sm-swap" aria-hidden="true">
      {Array.from(text).map((character, index) =>
        character === ' ' ? (
          <span key={index}> </span>
        ) : (
          <span key={index} className="sm-swap__letter" data-letter data-char={character}>
            <span>{character}</span>
          </span>
        ),
      )}
    </span>
  );
}

export default SwapText;
