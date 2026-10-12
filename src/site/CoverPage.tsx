import { useEffect, useState } from 'react';
import { assetPaths, withBaseAsset } from '../config/assets';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import PosterThread from './PosterThread';
import SwapText from './SwapText';
import { ui } from './content';
import { clickPoint, type Point } from './navigation';

type CoverPageProps = {
  lang: Language;
  /** Leaves the poster for the home page; the iris opens from the given point. */
  onExit: (point?: Point) => void;
};

// The clock shows the time where the work happens; the site states "Lomé, Togo · GMT+0".
const CLOCK_ZONE = 'Africa/Lome';

const clockFormat = (withSeconds: boolean) =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone: CLOCK_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  });

/** Current time in Lomé; ticks every second, or every minute when less motion is preferred. */
function useLomeClock(withSeconds: boolean) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = withSeconds ? 1000 : 60000;
    const id = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(id);
  }, [withSeconds]);

  return clockFormat(withSeconds).format(now);
}

/** The way into the site: stacked labels, the Lomé clock and an arched door that swings open. */
function EnterDoor({ lang, onExit }: CoverPageProps) {
  const reduced = usePrefersReducedMotion();
  const time = useLomeClock(!reduced);

  return (
    <button
      type="button"
      className="sm-exit"
      onClick={(event) => onExit(clickPoint(event, event.currentTarget))}
      aria-label={ui.enter[lang]}
    >
      <span className="sm-exit__lines" aria-hidden="true">
        {ui.enterLines[lang].map((line) => (
          <span key={line} className="sm-exit__line sm-cap">
            {line}
          </span>
        ))}
        <span className="sm-exit__line sm-exit__time sm-cap">
          {ui.clockPlace}
          {' · '}
          {time}
        </span>
      </span>
      <svg className="sm-exit__door" viewBox="0 0 64 88" aria-hidden="true">
        <path className="sm-exit__frame" d="M5 86V35a27 27 0 0 1 54 0v51" />
        <path className="sm-exit__sill" d="M0 86h64" />
        <g className="sm-exit__panel">
          <path d="M11 86V35a21 21 0 0 1 42 0v51Z" />
          <circle cx="45" cy="56" r="3" />
        </g>
      </svg>
    </button>
  );
}

/** The poster as a page of its own: the first screen of the site, left through the door. */
function CoverPage({ lang, onExit }: CoverPageProps) {
  const resumeHref = withBaseAsset(assetPaths.resumes[lang]);
  const [posterA, posterB, posterC] = ui.posterTitle[lang];

  return (
    <main>
      <section className="sm-poster">
        <PosterThread />
        <div className="sm-wrap sm-poster__inner">
          <div className="sm-poster__head">
            <p className="sm-cap sm-accent sm-fall" style={{ animationDelay: '0.1s' }}>
              {ui.role[lang]}
            </p>
            <div className="sm-fall is-quick" style={{ animationDelay: '0.25s' }}>
              <EnterDoor lang={lang} onExit={onExit} />
            </div>
          </div>
          {/* the letters below are decorative copies: the heading is named once, here */}
          <h1 className="sm-poster__title" aria-label={ui.posterTitle[lang].join(' ')}>
            <span className="sm-line">
              <span style={{ animationDelay: '0.2s' }}>
                <SwapText text={posterA} />
              </span>
            </span>
            <span className="sm-line">
              <span style={{ animationDelay: '0.35s' }}>
                <em aria-hidden="true">{posterB}</em> <SwapText text={posterC} />
              </span>
            </span>
          </h1>
          <div className="sm-poster__foot sm-fall is-quick" style={{ animationDelay: '0.3s' }}>
            <p className="sm-poster__note">{ui.posterNote[lang]}</p>
            <div className="sm-hero__actions">
              <a className="sm-patte" href={resumeHref} target="_blank" rel="noopener noreferrer">
                {ui.cv[lang]}
              </a>
              <a className="sm-stitch" href="#realisations">
                {ui.seeWork[lang]}
              </a>
              <a className="sm-stitch" href="#contact">
                {ui.contactMe[lang]}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CoverPage;
