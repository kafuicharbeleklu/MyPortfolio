import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { assetPaths, withBaseAsset } from '../../config/assets';
import type { Language } from '../../translations';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

interface HeroProps {
  lang: Language;
  onDiscoverProfile: () => void;
  onViewProjects: () => void;
  onViewBiography: () => void;
  onNavigateSection: (section: string) => void;
}

export default function Hero({ lang, onViewBiography, onNavigateSection }: HeroProps) {
  const reduced = usePrefersReducedMotion();
  const fr = lang === 'FR';
  const entrance = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="studio-hero" id="hero">
      <div className="studio-container studio-hero-layout">
        <div className="studio-hero-copy">
          <motion.p className="studio-eyebrow" {...entrance(0.05)}>
            {fr
              ? 'Portfolio · Infrastructure & cybersécurité'
              : 'Portfolio · Infrastructure & cybersecurity'}
          </motion.p>
          <motion.h1 {...entrance(0.12)}>
            Kafui Charbel
            <br />
            Eklu<span>.</span>
          </motion.h1>
          <motion.p className="studio-role-line" {...entrance(0.2)}>
            {fr
              ? 'Administrateur Digital Workplace & Infrastructure'
              : 'Digital Workplace & Infrastructure Administrator'}
          </motion.p>
          <motion.p className="studio-hero-description" {...entrance(0.28)}>
            {fr
              ? 'À Lomé, je relie infrastructure, cybersécurité et automatisation pour rendre les outils de travail plus fiables et plus simples à utiliser.'
              : 'Based in Lomé, I connect infrastructure, cybersecurity and automation to make the tools people work with more reliable and easier to use.'}
          </motion.p>
          <motion.div className="studio-hero-actions" {...entrance(0.36)}>
            <button
              className="studio-button studio-button-primary"
              onClick={() => onNavigateSection('projets')}
            >
              {fr ? 'Voir mes réalisations' : 'Explore my work'} <ArrowUpRight size={18} />
            </button>
            <button
              className="studio-button studio-button-quiet"
              onClick={() => onNavigateSection('contact')}
            >
              {fr ? 'Prendre contact' : 'Get in touch'} <ArrowUpRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
      <div className="studio-container studio-hero-bottom">
        <button className="studio-hero-link" onClick={() => onNavigateSection('projets')}>
          <strong>{fr ? 'Réalisations' : 'Projects'}</strong>
          <span>
            {fr ? 'Des cas concrets, du besoin au résultat.' : 'Real work, from need to outcome.'}
          </span>
          <b>
            {fr ? 'Découvrir' : 'Explore'} <ArrowUpRight size={15} />
          </b>
        </button>
        <button className="studio-hero-link" onClick={onViewBiography}>
          <strong>{fr ? 'Parcours' : 'Background'}</strong>
          <span>
            {fr
              ? 'Les expériences qui ont façonné mon approche.'
              : 'The experience behind my approach.'}
          </span>
          <b>
            {fr ? 'Lire mon histoire' : 'Read my story'} <ArrowUpRight size={15} />
          </b>
        </button>
        <a className="studio-hero-link" href={withBaseAsset(assetPaths.resume)} download>
          <strong>{fr ? 'Curriculum vitae' : 'Résumé'}</strong>
          <span>{fr ? 'Compétences, missions et formation.' : 'Skills, work and education.'}</span>
          <b>
            {fr ? 'Télécharger' : 'Download'} <ArrowUpRight size={15} />
          </b>
        </a>
      </div>
    </section>
  );
}
