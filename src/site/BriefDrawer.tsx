import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { assetPaths, withBaseAsset } from '../config/assets';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { measurements, ui } from './content';

const ease = [0.19, 1, 0.22, 1] as const;

/**
 * "En bref" as a drawer: a tab sewn to the right edge of the window opens the measurements card
 * from the side, on every page. A native modal dialog gives focus containment, Escape and the
 * return of focus to the tab.
 */
function BriefDrawer({ lang }: { lang: Language }) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resumeHref = withBaseAsset(assetPaths.resumes[lang]);

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
        className="sm-brief-tab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${ui.cardKicker[lang]} : ${ui.cardTitle[lang]}`}
      >
        <svg className="sm-brief-tab__button" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" />
          <circle cx="8.5" cy="8.5" r="1.4" />
          <circle cx="15.5" cy="8.5" r="1.4" />
          <circle cx="8.5" cy="15.5" r="1.4" />
          <circle cx="15.5" cy="15.5" r="1.4" />
          <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
        </svg>
        <span className="sm-cap sm-brief-tab__label" aria-hidden="true">
          {ui.cardKicker[lang]}
        </span>
        <svg className="sm-brief-tab__hint" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M8 2 4 6l4 4" />
        </svg>
      </button>
      {open && (
        <motion.dialog
          ref={dialogRef}
          className="sm-brief sm-twill"
          aria-label={ui.cardTitle[lang]}
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClick={(event) => {
            // a click on the backdrop reaches the dialog element itself
            if (event.target === event.currentTarget) setOpen(false);
          }}
          initial={reduced ? false : { x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease }}
        >
          <div className="sm-brief__inner">
            <div className="sm-brief__head">
              <div>
                <p className="sm-cap sm-card__kicker">{ui.cardKicker[lang]}</p>
                <p className="sm-serif sm-card__title">{ui.cardTitle[lang]}</p>
              </div>
              <button type="button" className="sm-menu-btn sm-cap" onClick={() => setOpen(false)}>
                {ui.close[lang]} <span aria-hidden="true">×</span>
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
              <a className="sm-stitch is-on-dark" href="#contact" onClick={() => setOpen(false)}>
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
