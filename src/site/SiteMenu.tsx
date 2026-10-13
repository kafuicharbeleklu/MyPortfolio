import { useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { sectionIds, ui, type SectionId } from './content';
import ThemeToggle from './ThemeToggle';

type SiteMenuProps = {
  lang: Language;
  onLangChange: (lang: Language) => void;
  activeSection: SectionId | '';
  onClose: (destination?: string) => void;
};

const ease = [0.19, 1, 0.22, 1] as const;

/** Full-screen navigation that drops over the page like a length of cloth. */
const languages: Language[] = ['FR', 'EN'];

function SiteMenu({ lang, onLangChange, activeSection, onClose }: SiteMenuProps) {
  const reduced = usePrefersReducedMotion();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const items = [
    ...sectionIds.map((id) => ({ id, href: `#${id}`, label: ui.nav[id][lang] })),
    { id: 'all', href: '#/realisations', label: ui.backToProjects[lang] },
  ];

  useLayoutEffect(() => {
    const dialog = menuRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    // Native modal semantics include focus containment, background inertness and focus return.
    dialog.showModal();
    firstLinkRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <motion.dialog
      ref={menuRef}
      className="sm-menu sm-twill"
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={ui.menu[lang]}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: reduced ? 0 : 0.38, ease }}
    >
      <div className="sm-wrap sm-menu__toolbar">
        <span className="sm-serif sm-brand">Kafui Charbel Eklu</span>
        <button
          type="button"
          className="sm-menu-btn sm-cap"
          onClick={() => onClose()}
          aria-label={ui.close[lang]}
        >
          <span className="sm-menu-btn__label">{ui.close[lang]}</span>
          <span className="sm-menu-btn__x" aria-hidden="true">
            ×
          </span>
        </button>
      </div>
      <div className="sm-wrap sm-menu__inner">
        <nav aria-label={ui.sections[lang]}>
          <ol className="sm-menu__list">
            {items.map((item, index) => (
              <li key={item.id}>
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={(event) => {
                    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                      onClose(item.href);
                    }
                  }}
                  aria-current={activeSection === item.id ? 'true' : undefined}
                >
                  <span className="sm-cap">{String(index + 1).padStart(2, '0')}</span>
                  <span className="sm-line">
                    <span
                      className="sm-menu__word"
                      style={{ animationDelay: `${0.05 + index * 0.035}s` }}
                    >
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="sm-menu__side sm-fall is-quick" style={{ animationDelay: '0.2s' }}>
          <p className="sm-cap">{ui.basedValue[lang]}</p>
          {/* on small screens the header has no room for these two: they live here */}
          <div className="sm-menu__lang sm-cap" role="group" aria-label={ui.languageGroup[lang]}>
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => onLangChange(code)}
              >
                {code === 'FR' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
          <div className="sm-menu__theme">
            <ThemeToggle lang={lang} />
            <span className="sm-cap">{ui.darkTheme[lang]}</span>
          </div>
          <p className="sm-menu__music-credit">
            <a
              href="https://commons.wikimedia.org/wiki/File:PMM-Delibes-Flower-Duet-MASTER_V1.ogg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {lang === 'FR' ? 'Duo des fleurs' : 'Flower Duet'} · Philip Milman
            </a>
            {' · '}
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 3.0
            </a>
          </p>
        </div>
      </div>
    </motion.dialog>
  );
}

export default SiteMenu;
