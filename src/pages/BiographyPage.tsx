import { ArrowUpRight, Download } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Language } from '../translations';
import { assetPaths, withBaseAsset } from '../config/assets';
import { getTimelineData, getFormationData } from '../data';
import Reveal from '../components/Reveal';
import Footer from '../components/sections/Footer';

interface BiographyPageProps {
  lang: Language;
  bioExpertiseItems: { label: string; className: string; href?: string; icon?: ReactNode }[];
  scrollToSection: (id: string) => void;
}

export default function BiographyPage({
  lang,
  bioExpertiseItems,
  scrollToSection,
}: BiographyPageProps) {
  const fr = lang === 'FR';
  return (
    <div className="page active studio-bio-page" id="page-biography">
      <nav className="nav">
        <button
          type="button"
          className="nav-logo nav-control-btn"
          onClick={() => scrollToSection('hero')}
        >
          <span className="studio-monogram">
            ce<span>.</span>
          </span>
        </button>
        <button
          type="button"
          className="nav-back nav-control-btn"
          onClick={() => scrollToSection('about')}
        >
          {fr ? '← Retour au portfolio' : '← Back to portfolio'}
        </button>
      </nav>
      <div className="studio-container studio-bio-hero">
        <Reveal>
          <p className="studio-eyebrow">
            {fr ? 'Un peu plus que mon CV' : 'A little more than my résumé'}
          </p>
          <h1>
            {fr ? 'La curiosité mène.' : 'Curiosity leads.'}
            <br />
            <span>{fr ? 'Le terrain apprend.' : 'Experience teaches.'}</span>
          </h1>
          <p className="studio-bio-lead">
            {fr
              ? 'Je suis Kafui Charbel Eklu. Administrateur Digital Workplace & Infrastructure à Lomé, je construis des environnements numériques au service des personnes qui les utilisent.'
              : 'I’m Kafui Charbel Eklu. A Digital Workplace & Infrastructure Administrator in Lomé, building digital environments around the people who use them.'}
          </p>
          <div className="studio-bio-actions">
            <a
              className="studio-button studio-button-primary"
              href={withBaseAsset(assetPaths.resume)}
              download
            >
              <Download size={16} /> {fr ? 'Télécharger mon CV' : 'Download my résumé'}
            </a>
            <button
              className="studio-button studio-button-quiet"
              onClick={() => scrollToSection('contact')}
            >
              {fr ? 'Échangeons' : 'Let’s talk'} <ArrowUpRight size={16} />
            </button>
          </div>
        </Reveal>
        <Reveal className="studio-bio-profile-card">
          <p className="studio-eyebrow">{fr ? 'Profil en bref' : 'Profile at a glance'}</p>
          <h2>
            {fr ? 'Systèmes, sécurité et outils utiles.' : 'Systems, security and useful tools.'}
          </h2>
          <p>
            {fr
              ? 'Administration des systèmes, cybersécurité et automatisation au service des opérations.'
              : 'Systems administration, cybersecurity and automation in support of real operations.'}
          </p>
          <dl>
            <div>
              <dt>{fr ? 'Actuellement' : 'Currently'}</dt>
              <dd>Neemba Togo</dd>
            </div>
            <div>
              <dt>{fr ? 'Basé à' : 'Based in'}</dt>
              <dd>Lomé, Togo</dd>
            </div>
            <div>
              <dt>{fr ? 'Domaines' : 'Focus'}</dt>
              <dd>
                {fr
                  ? 'Infrastructure · Sécurité · Automatisation'
                  : 'Infrastructure · Security · Automation'}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
      <section className="studio-bio-section studio-bio-story">
        <div className="studio-container studio-bio-story-grid">
          <Reveal>
            <p className="studio-eyebrow">
              01 / {fr ? 'Le fil conducteur' : 'The connecting thread'}
            </p>
            <h2>{fr ? 'Comprendre avant de construire.' : 'Understand before building.'}</h2>
          </Reveal>
          <Reveal>
            <p>
              {fr
                ? 'Mon parcours a commencé par le support et les services réseau, à la Clinique BIASA puis chez Orabank. Dans ces environnements, j’ai appris que la qualité technique se mesure aussi à la continuité du travail des équipes.'
                : 'My path began with support and network services, at Clinique BIASA and then Orabank. These environments taught me that technical quality also means keeping people’s work moving.'}
            </p>
            <p>
              {fr
                ? 'Chez Neemba Togo, mes responsabilités réunissent aujourd’hui administration des systèmes, infrastructure, support avancé, sécurité et pilotage IT. J’aime particulièrement transformer une difficulté opérationnelle en outil concret : suivi du matériel, automatisation du reporting ou supervision de la sécurité.'
                : 'At Neemba Togo, my responsibilities now combine systems administration, infrastructure, advanced support, security and IT coordination. I especially enjoy turning an operational problem into a practical tool: asset tracking, reporting automation or security monitoring.'}
            </p>
            <p>
              {fr
                ? 'L’open source, la cybersécurité et l’intelligence artificielle nourrissent ma curiosité. J’explore ces sujets par la pratique et par l’échange avec les communautés techniques.'
                : 'Open source, cybersecurity and artificial intelligence fuel my curiosity. I explore these subjects through practice and exchange with technical communities.'}
            </p>
          </Reveal>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-container studio-journey-layout">
          <Reveal className="studio-section-heading">
            <p className="studio-eyebrow">02 / {fr ? 'Expérience' : 'Experience'}</p>
            <h2>
              {fr ? 'Un parcours,' : 'One journey,'}
              <br />
              <span>{fr ? 'plusieurs perspectives.' : 'many perspectives.'}</span>
            </h2>
          </Reveal>
          <div className="studio-timeline">
            {getTimelineData(lang).map((item) => (
              <Reveal
                className={'studio-timeline-item ' + (item.isCurrent ? 'is-current' : '')}
                key={item.date}
              >
                <div className="studio-timeline-marker" aria-hidden="true" />
                <p className="studio-timeline-meta">{item.date}</p>
                <h3>{item.title}</h3>
                <p className="studio-company">{item.company}</p>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-section studio-education">
        <div className="studio-container">
          <Reveal className="studio-section-heading">
            <p className="studio-eyebrow">03 / {fr ? 'Formation' : 'Education'}</p>
            <h2>{fr ? 'Apprendre reste essentiel.' : 'Learning stays essential.'}</h2>
          </Reveal>
          <div className="studio-education-grid">
            {getFormationData(lang).map((item) => (
              <Reveal className="studio-education-card" key={item.title}>
                <p className="studio-eyebrow">{item.year}</p>
                <h3>{item.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: item.school }} />
                {item.gradeNode}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-container">
          <Reveal className="studio-section-heading">
            <p className="studio-eyebrow">04 / {fr ? 'Boîte à outils' : 'Toolkit'}</p>
            <h2>{fr ? 'Des compétences qui se complètent.' : 'Skills that work together.'}</h2>
          </Reveal>
          <div className="studio-bio-expertise">
            {bioExpertiseItems.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tag"
                >
                  {item.icon}
                  {item.label}
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <span key={item.label} className="tag">
                  {item.label}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="studio-bio-contact">
        <h2>{fr ? 'La suite se construit ensemble.' : 'Let’s build what comes next.'}</h2>
        <button
          className="studio-button studio-button-primary"
          onClick={() => scrollToSection('contact')}
        >
          {fr ? 'Parlons de votre projet' : 'Tell me about your project'}
          <ArrowUpRight size={17} />
        </button>
      </section>
      <Footer lang={lang} onNavigate={scrollToSection} />
    </div>
  );
}
