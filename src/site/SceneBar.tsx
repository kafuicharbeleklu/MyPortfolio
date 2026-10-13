import type { Language } from '../translations';
import { sectionIds, ui, type SectionId } from './content';

type SceneBarProps = {
  lang: Language;
  activeSection: SectionId | '';
};

/**
 * On phones the five scenes stay one tap away, in a bar at the bottom of the screen: the
 * active scene shows its name, the others their number. The last slot is the companion's seat.
 * Shown by site.css below 861px only; the cover and the open menu hide it.
 */
function SceneBar({ lang, activeSection }: SceneBarProps) {
  return (
    <nav className="sm-scenebar" aria-label={ui.sections[lang]}>
      <ol className="sm-scenebar__list">
        {sectionIds.map((id, index) => {
          const active = activeSection === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active ? 'is-active' : undefined}
                aria-current={active ? 'true' : undefined}
                aria-label={ui.nav[id][lang]}
              >
                <span className="sm-cap sm-scenebar__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="sm-scenebar__word" aria-hidden="true">
                  {ui.nav[id][lang]}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <span className="sm-cap sm-scenebar__seat" aria-hidden="true">
        {ui.cardKicker[lang]}
      </span>
    </nav>
  );
}

export default SceneBar;
