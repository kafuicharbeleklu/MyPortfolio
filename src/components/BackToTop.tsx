import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import type { Language } from '../translations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

export default function BackToTop({ lang }: { lang: Language }) {
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 750);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="studio-back-to-top"
          aria-label={lang === 'FR' ? 'Revenir en haut de la page' : 'Back to top'}
          title={lang === 'FR' ? 'Retour en haut' : 'Back to top'}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 10 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
        >
          <ArrowUp size={19} strokeWidth={1.8} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
