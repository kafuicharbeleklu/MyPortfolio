import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { Language } from '../translations';
import SiteMenu from './SiteMenu';
import MusicPlayer from './MusicPlayer';
import { sectionIds, ui, type SectionId } from './content';
import { focusDestination } from './navigation';
import { NARROW_QUERY, useMediaQuery } from './useMediaQuery';

type SiteHeaderProps = {
  lang: Language;
  onLangChange: (lang: Language) => void;
  page: 'cover' | 'home' | 'projects' | 'project';
  activeSection: SectionId | '';
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
};

const languages: Language[] = ['FR', 'EN'];
// vertical point, inside the header, used to tell which section sits behind it
const PROBE_Y = 40;

function SiteHeader({
  lang,
  onLangChange,
  page,
  activeSection,
  menuOpen,
  onMenuChange,
}: SiteHeaderProps) {
  const { scrollYProgress } = useScroll();
  const [onDark, setOnDark] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const narrow = useMediaQuery(NARROW_QUERY);
  // on a phone the inner pages have a back link too: the name gives way to its initials
  const compact = narrow && (page === 'projects' || page === 'project');

  const closeMenu = useCallback(
    (destination?: string) => {
      onMenuChange(false);
      // Closing the native dialog restores its opener. Section selection instead focuses its target.
      window.requestAnimationFrame(() => {
        if (destination && !destination.startsWith('#/')) focusDestination(destination);
        else if (!destination) menuButtonRef.current?.focus({ preventScroll: true });
      });
    },
    [onMenuChange],
  );

  // The header takes the charcoal colour while a charcoal section passes behind it.
  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      const isOverDark = Array.from(document.querySelectorAll('.sm-section.is-dark')).some(
        (section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= PROBE_Y && rect.bottom >= PROBE_Y;
        },
      );
      setOnDark(isOverDark);
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(check);
      }
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [page]);

  return (
    <>
      <div
        className={[
          'sm-header',
          (onDark || menuOpen) && 'is-dark',
          (page === 'home' || page === 'cover') && 'is-seamless',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className="sm-wrap sm-header__inner sm-fall is-quick">
          <a
            className="sm-brand sm-serif"
            href="#top"
            aria-label={compact ? 'Kafui Charbel Eklu' : undefined}
          >
            {compact ? 'K. C. Eklu' : 'Kafui Charbel Eklu'}
          </a>
          {/* the five scenes, one click away on wide screens; the menu covers the rest */}
          {(page === 'home' || page === 'cover') && !menuOpen && (
            <nav className="sm-nav" aria-label={ui.sections[lang]}>
              {sectionIds.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={activeSection === id ? 'is-active' : undefined}
                  aria-current={activeSection === id ? 'true' : undefined}
                >
                  {ui.nav[id][lang]}
                </a>
              ))}
            </nav>
          )}
          {page === 'projects' && !menuOpen && (
            <a
              className={narrow ? 'sm-stitch sm-header__back is-icon' : 'sm-stitch sm-header__back'}
              href="#realisations"
              aria-label={narrow ? ui.back[lang] : undefined}
            >
              {narrow ? <ArrowLeft size={20} aria-hidden="true" /> : ui.back[lang]}
            </a>
          )}
          {page === 'project' && !menuOpen && (
            <a
              className={narrow ? 'sm-stitch sm-header__back is-icon' : 'sm-stitch sm-header__back'}
              href="#/realisations"
              aria-label={narrow ? ui.backToProjects[lang] : undefined}
            >
              {narrow ? <ArrowLeft size={20} aria-hidden="true" /> : ui.backToProjects[lang]}
            </a>
          )}
          <div className="sm-header__tools">
            <MusicPlayer lang={lang} />
            <div className="sm-lang sm-cap" role="group" aria-label={ui.languageGroup[lang]}>
              {languages.map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => onLangChange(code)}
                >
                  {code}
                </button>
              ))}
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              className="sm-menu-btn sm-cap"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => onMenuChange(true)}
              aria-label={menuOpen ? ui.close[lang] : ui.menu[lang]}
            >
              <span className="sm-menu-btn__icon" aria-hidden="true" />
              <span className="sm-menu-btn__label">
                {menuOpen ? ui.close[lang] : ui.menu[lang]}
              </span>
            </button>
          </div>
        </header>
        <motion.div
          className="sm-header__progress"
          style={{ scaleX: scrollYProgress }}
          aria-hidden="true"
        />
      </div>
      {menuOpen && (
        <SiteMenu
          lang={lang}
          onLangChange={onLangChange}
          activeSection={activeSection}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

export default SiteHeader;
