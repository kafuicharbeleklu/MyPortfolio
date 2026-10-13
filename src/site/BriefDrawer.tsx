import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { assetPaths, withBaseAsset } from '../config/assets';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { COMPANION_CENTRE, Companion } from './companion';
import { measurements, ui } from './content';
import { PHONE_QUERY, useMediaQuery } from './useMediaQuery';

const ease = [0.19, 1, 0.22, 1] as const;
/** how far he hides in the edge at rest, and when he comes out */
const PEEK_REST = '54px';
const PEEK_OUT = '14px';
/** the pointer is "near" within this distance of his body centre, in px */
const NEAR = 230;
const IDLE_AFTER = 2500;
const SLEEP_AFTER = 15000;
/** the ring of text around him: a circle of radius 56 about his body centre */
const RING_RADIUS = 56;
const RING_PATH = `M${COMPANION_CENTRE.x} ${COMPANION_CENTRE.y}m-${RING_RADIUS} 0a${RING_RADIUS} ${RING_RADIUS} 0 1 1 ${RING_RADIUS * 2} 0a${RING_RADIUS} ${RING_RADIUS} 0 1 1-${RING_RADIUS * 2} 0`;
const RING_LENGTH = Math.round(2 * Math.PI * RING_RADIUS);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * The frame loop of the companion: where he looks, when he comes out of the edge, when he falls
 * asleep. The pointer is tracked on the window so that he follows it anywhere on the page.
 */
function useCompanion(reduced: boolean, open: boolean) {
  const engineRef = useRef<Companion | null>(null);
  if (!engineRef.current) {
    engineRef.current = new Companion({ reduced });
  }
  const engine = engineRef.current;
  const tabRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    engine.reduced = reduced;
  }, [engine, reduced]);

  // he can be drawn on the tab and, while the drawer is open, on its edge: same engine, two canvases
  const attach = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        return undefined;
      }
      engine.attach(canvas);
      return () => engine.detach(canvas);
    },
    [engine],
  );

  useEffect(() => {
    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastMove = performance.now();
    let wander: { x: number; y: number } | null = null;
    let nextWander = 0;
    const helloUntil = performance.now() + 3200;
    // a touch screen gets half the frames: nothing there moves faster than that
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let lastDraw = 0;

    const poke = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      lastMove = performance.now();
      engine.wake();
    };
    const nudge = () => {
      lastMove = performance.now();
      engine.wake();
    };
    window.addEventListener('pointermove', poke, { passive: true });
    window.addEventListener('pointerdown', poke, { passive: true });
    window.addEventListener('scroll', nudge, { passive: true });
    const hello = window.setTimeout(() => engine.wave(), 900);

    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const tab = tabRef.current;
      if (!tab || document.hidden || (coarse && now - lastDraw < 32)) {
        return;
      }
      lastDraw = now;
      const rect = tab.getBoundingClientRect();
      const centre = { x: rect.left + COMPANION_CENTRE.x, y: rect.top + COMPANION_CENTRE.y };
      const idle = now - lastMove > IDLE_AFTER;
      const isOpen = openRef.current;

      if (isOpen) {
        // sitting against the panel, he reads the card with the visitor
        engine.tg.yaw = 0.55;
        engine.tg.pitch = -0.05;
      } else if (engine.sleeping) {
        engine.tg.yaw = 0;
        engine.tg.pitch = 0.3;
      } else {
        let look = target;
        if (idle) {
          if (now > nextWander) {
            wander = {
              x: centre.x + (Math.random() - 0.5) * 520,
              y: centre.y + (Math.random() - 0.5) * 320,
            };
            nextWander = now + 1200 + Math.random() * 2600;
          }
          look = wander ?? target;
        }
        engine.tg.yaw = clamp((look.x - centre.x) / 240, -1, 1);
        engine.tg.pitch = clamp((look.y - centre.y) / 200, -1, 1);
      }

      const near = !idle && !isOpen && Math.hypot(target.x - centre.x, target.y - centre.y) < NEAR;
      if (!engine.sleeping && !isOpen) {
        engine.setBase(near ? 'wide' : 'pill');
        engine.tg.roll = near ? -0.08 : 0;
      }
      const out = near || now < helloUntil || tab.matches(':focus-visible');
      tab.style.setProperty('--sm-peek', out ? PEEK_OUT : PEEK_REST);
      if (!isOpen && !engine.reduced && now - lastMove > SLEEP_AFTER) {
        engine.sleep();
      }
      engine.step(now);
      engine.draw(now);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hello);
      window.removeEventListener('pointermove', poke);
      window.removeEventListener('pointerdown', poke);
      window.removeEventListener('scroll', nudge);
    };
  }, [engine]);

  return { engine, tabRef, attach };
}

/**
 * "En bref" as a drawer: a paper companion sewn to the right edge of the window opens the
 * measurements card from the side, on every page. A native modal dialog gives focus containment,
 * Escape and the return of focus to the tab.
 */
function BriefDrawer({ lang }: { lang: Language }) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pokes = useRef<number[]>([]);
  const resumeHref = withBaseAsset(assetPaths.resumes[lang]);
  const { engine, tabRef, attach } = useCompanion(reduced, open);
  // on phones the drawer is a sheet that rises from the bottom
  const sheet = useMediaQuery(PHONE_QUERY);
  // "EN BREF • " repeated to fill the ring, about 8 px per letter at this size
  const unit = `${ui.cardKicker[lang].toUpperCase()} • `;
  const ring = unit.repeat(Math.max(1, Math.round(RING_LENGTH / (unit.length * 8))));

  const openDrawer = () => {
    engine.hop();
    setOpen(true);
  };
  const closeDrawer = () => {
    engine.wink();
    setOpen(false);
  };
  /**
   * Taps on him inside the open drawer, where a click no longer has to open anything: one is a
   * wink, a second within half a second makes him jump, a third gives him spiral eyes.
   */
  const poke = () => {
    const now = performance.now();
    pokes.current = [...pokes.current.filter((time) => now - time < 600), now];
    const count = pokes.current.length;
    if (count >= 3) {
      pokes.current = [];
      engine.dizzy();
    } else if (count === 2) {
      engine.hop();
    } else {
      engine.wink();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) {
      return undefined;
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={tabRef}
        className="sm-buddy"
        onClick={openDrawer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${ui.cardKicker[lang]} : ${ui.cardTitle[lang]}`}
      >
        <svg className="sm-buddy__ring" viewBox="0 0 150 180" aria-hidden="true">
          <defs>
            <path id="sm-buddy-ring" d={RING_PATH} />
          </defs>
          <text className="sm-buddy__text" textLength={RING_LENGTH} lengthAdjust="spacing">
            <textPath href="#sm-buddy-ring">{ring}</textPath>
          </text>
        </svg>
        <canvas ref={attach} className="sm-buddy__canvas" aria-hidden="true" />
      </button>
      {open && (
        <motion.dialog
          ref={dialogRef}
          className="sm-brief sm-twill"
          aria-label={ui.cardTitle[lang]}
          onCancel={(event) => {
            event.preventDefault();
            closeDrawer();
          }}
          onClick={(event) => {
            // a click on the backdrop reaches the dialog element itself
            if (event.target === event.currentTarget) closeDrawer();
          }}
          initial={reduced ? false : sheet ? { y: '100%' } : { x: '100%' }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease }}
        >
          <div className="sm-brief__buddy" aria-hidden="true" onClick={poke}>
            <canvas ref={attach} className="sm-buddy__canvas" />
          </div>
          <div className="sm-brief__inner">
            <div className="sm-brief__head">
              <div>
                <p className="sm-cap sm-card__kicker">{ui.cardKicker[lang]}</p>
                <p className="sm-serif sm-card__title">{ui.cardTitle[lang]}</p>
              </div>
              <button
                type="button"
                className="sm-menu-btn sm-cap"
                onClick={closeDrawer}
                aria-label={ui.close[lang]}
              >
                <span className="sm-menu-btn__label">{ui.close[lang]}</span>
                <span className="sm-menu-btn__x" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <dl>
              {measurements.map((row) => (
                <div key={row.label.FR} className="sm-card__row">
                  <dt className="sm-cap">{row.label[lang]}</dt>
                  <dd>{row.value[lang]}</dd>
                </div>
              ))}
            </dl>
            <div className="sm-brief__actions">
              <a
                className="sm-stitch is-on-dark"
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ui.cv[lang]}
              </a>
              <a className="sm-stitch is-on-dark" href="#contact" onClick={closeDrawer}>
                {ui.contactMe[lang]}
              </a>
            </div>
          </div>
        </motion.dialog>
      )}
    </>
  );
}

export default BriefDrawer;
