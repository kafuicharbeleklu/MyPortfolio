import React, { Suspense } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import LanguageToggle from './LanguageToggle';
import usePortfolioModel from '../hooks/usePortfolioModel';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const ChatbotButton = React.lazy(() => import('./ChatbotButton'));

function PortfolioRoot() {
  const { content, lang, setLang, isLightboxOpen } = usePortfolioModel();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 30 });
  const reduced = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="portfolio-studio">
        <motion.div
          className="studio-reading-progress"
          style={{ scaleX: reduced ? scrollYProgress : progress }}
          aria-hidden="true"
        />
        {content}
        <div style={isLightboxOpen ? { display: 'none' } : undefined}>
          <LanguageToggle lang={lang} onToggle={setLang} />
        </div>
        <Suspense fallback={null}>
          <div style={isLightboxOpen ? { display: 'none' } : undefined}>
            <ChatbotButton lang={lang} />
          </div>
        </Suspense>
      </div>
    </MotionConfig>
  );
}

export default PortfolioRoot;
