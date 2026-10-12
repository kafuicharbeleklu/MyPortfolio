import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { t, type Language } from '../translations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

interface MobileNavProps {
  lang: Language;
  isMobileMenuOpen: boolean;
  activeSection: string;
  toggleMobileMenu: () => void;
  scrollToSection: (id: string) => void;
}

export default function MobileNav({
  lang,
  isMobileMenuOpen,
  activeSection,
  toggleMobileMenu,
  scrollToSection,
}: MobileNavProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(toggleMobileMenu);
  closeRef.current = toggleMobileMenu;
  const reduced = usePrefersReducedMotion();
  const v = t[lang];
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const elements = panel.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isMobileMenuOpen]);
  const items = [
    ['about', v.nav.about],
    ['projets', v.nav.projects],
    ['skills', v.nav.skills],
    ['parcours', v.nav.experience],
    ['formation', v.nav.education],
    ['refs', v.nav.references],
    ['contact', v.nav.contact],
  ];
  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          ref={panel}
          id="mobile-menu"
          className="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'FR' ? 'Navigation mobile' : 'Mobile navigation'}
          initial={reduced ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -16 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <button
            ref={closeButton}
            type="button"
            className="close-btn"
            onClick={toggleMobileMenu}
            aria-label={lang === 'FR' ? 'Fermer le menu' : 'Close menu'}
          >
            <X size={26} />
          </button>
          <ul className="mobile-nav-links">
            {items.map(([id, label], index) => (
              <li key={id}>
                <a
                  href={'#' + id}
                  className={activeSection === id ? 'active' : ''}
                  aria-current={activeSection === id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(id);
                  }}
                >
                  <span className="studio-menu-index">0{index + 1}</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
