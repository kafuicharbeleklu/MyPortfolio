import { useRef, type PointerEvent } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { projectCount, projects, ui } from './content';

// how far the badge leans towards the pointer, in degrees, at the edge of the disc
const TILT = 16;

/**
 * A tailor's button with the invitation running around it, like a stamp. The text turns on its
 * own (`sm-spin` in site.css); under the pointer the whole disc leans in perspective, following
 * the hand, and settles back when the pointer leaves.
 */
function ProjectsBadge({ lang }: { lang: Language }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const ring = `${ui.allProjectsCta[lang]} • ${projectCount(projects.length)[lang]} • `;

  const lean = (event: PointerEvent<HTMLAnchorElement>) => {
    const element = ref.current;
    if (!element || reduced || event.pointerType !== 'mouse') {
      return;
    }

    const box = element.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    element.style.setProperty('--sm-tilt-x', `${(-y * TILT * 2).toFixed(1)}deg`);
    element.style.setProperty('--sm-tilt-y', `${(x * TILT * 2).toFixed(1)}deg`);
  };

  const settle = () => {
    ref.current?.style.removeProperty('--sm-tilt-x');
    ref.current?.style.removeProperty('--sm-tilt-y');
  };

  return (
    <a
      ref={ref}
      className="sm-badge"
      href="#/realisations"
      aria-label={ui.allProjectsCta[lang]}
      onPointerMove={lean}
      onPointerLeave={settle}
    >
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <path id="sm-badge-ring" d="M80 80m-57 0a57 57 0 1 1 114 0a57 57 0 1 1-114 0" />
        </defs>
        <circle className="sm-badge__disc" cx="80" cy="80" r="79" />
        <text className="sm-badge__text" textLength="358" lengthAdjust="spacing">
          <textPath href="#sm-badge-ring">{ring.toUpperCase()}</textPath>
        </text>
        <g className="sm-badge__button">
          <circle cx="80" cy="80" r="17" />
          <circle cx="74" cy="74" r="2.2" />
          <circle cx="86" cy="74" r="2.2" />
          <circle cx="74" cy="86" r="2.2" />
          <circle cx="86" cy="86" r="2.2" />
          <path d="M74 74L86 86M86 74L74 86" />
        </g>
      </svg>
    </a>
  );
}

export default ProjectsBadge;
