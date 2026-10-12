import React from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '../components/Reveal';
import ExpertiseExplorer from '../components/ExpertiseExplorer';
import BackToTop from '../components/BackToTop';
import MobileNav from '../components/MobileNav';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Projects from '../components/sections/Projects';
import Contact from '../components/sections/Contact';
import Footer from '../components/sections/Footer';
import type { Language } from '../translations';
import type { ProjectCardData, ReferenceContact } from '../types/portfolio';

type SectionDescriptor = {
  num: string;
  title: string;
  subtitle: string;
};

type SkillItem = {
  bg: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
};

type TimelineItem = {
  date: string;
  duration: string;
  title: string;
  company: string;
  desc: string;
  isCurrent?: boolean;
};

type FormationItem = {
  year: string;
  title: string;
  school: string;
  gradeNode: React.ReactNode;
};

type MobileDotsController = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  registerItem: (index: number, node: HTMLElement | null) => void;
  activeIndex: number;
  scrollToIndex: (index: number) => void;
};

interface HomePageProps {
  lang: Language;
  v: {
    nav: {
      about: string;
      skills: string;
      experience: string;
      education: string;
      projects: string;
      references: string;
      contact: string;
    };
    skills: {
      num: string;
      title: string;
    };
    experience: {
      num: string;
      title: string;
      sub?: string;
      subtitle?: string;
    };
  };
  activeSection: string;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  scrollToSection: (id: string) => void;
  onDiscoverProfile: () => void;
  onViewProjects: () => void;
  onViewBiography: () => void;
  skillsSectionSubtitle: string;
  educationSection: SectionDescriptor;
  referencesSection: SectionDescriptor;
  sortedSkillsData: SkillItem[];
  sortedTimelineData: TimelineItem[];
  sortedFormationData: FormationItem[];
  sortedReferencesData: ReferenceContact[];
  desktopReferencePages: ReferenceContact[][];
  desktopReferencePage: number;
  setDesktopReferencePage: React.Dispatch<React.SetStateAction<number>>;
  referenceCarouselRef: React.RefObject<HTMLDivElement | null>;
  referenceCarouselIndex: number;
  referenceCarouselOffset: number;
  handleCarouselTouchStart: (key: string) => (event: React.TouchEvent<HTMLDivElement>) => void;
  handleReferenceCarouselTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  goToReferenceCard: (index: number) => void;
  featuredMainProject: ProjectCardData;
  recentMainProjects: ProjectCardData[];
  onProjectClick: (id: string) => void;
  onViewAllProjects: () => void;
  skillsCarousel: MobileDotsController;
  educationCarousel: MobileDotsController;
}

const HomePage: React.FC<HomePageProps> = ({
  lang,
  v,
  activeSection,
  isMobileMenuOpen,
  toggleMobileMenu,
  scrollToSection,
  onDiscoverProfile,
  onViewProjects,
  onViewBiography,
  skillsSectionSubtitle,
  sortedSkillsData,
  sortedTimelineData,
  sortedFormationData,
  sortedReferencesData,
  featuredMainProject,
  recentMainProjects,
  onProjectClick,
  onViewAllProjects,
}) => {
  const fr = lang === 'FR';
  const navigation = [
    ['about', v.nav.about],
    ['projets', v.nav.projects],
    ['skills', v.nav.skills],
    ['parcours', v.nav.experience],
    ['contact', v.nav.contact],
  ];
  return (
    <main className="page active studio-home" id="page-main">
      <nav className="nav studio-nav" aria-label={fr ? 'Navigation principale' : 'Main navigation'}>
        <button
          type="button"
          className="nav-logo nav-control-btn"
          onClick={() => scrollToSection('hero')}
        >
          <span className="studio-monogram">
            ce<span>.</span>
          </span>
          <span className="studio-nav-name">Charbel Eklu</span>
        </button>
        <ul className="nav-links">
          {navigation.map(([id, label]) => (
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
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="hamburger nav-control-btn"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={fr ? 'Ouvrir le menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="nav-tag">
          <span className="studio-status-dot" /> Lomé, Togo
        </div>
      </nav>
      <MobileNav
        lang={lang}
        isMobileMenuOpen={isMobileMenuOpen}
        activeSection={activeSection}
        toggleMobileMenu={toggleMobileMenu}
        scrollToSection={scrollToSection}
      />
      <Hero
        lang={lang}
        onDiscoverProfile={onDiscoverProfile}
        onViewProjects={onViewProjects}
        onViewBiography={onViewBiography}
        onNavigateSection={scrollToSection}
      />
      <About lang={lang} onReadMore={onViewBiography} />
      <Projects
        lang={lang}
        featuredProject={featuredMainProject}
        recentProjects={recentMainProjects}
        onProjectClick={onProjectClick}
        onViewAll={onViewAllProjects}
      />
      <section className="studio-section studio-expertise" id="skills">
        <div className="studio-container">
          <Reveal className="studio-section-heading">
            <p className="studio-eyebrow">03 / {fr ? 'Expertises' : 'Expertise'}</p>
            <h2>
              {fr ? 'Une vision d’ensemble.' : 'The whole picture.'}
              <br />
              <span>{fr ? 'Le sens du détail.' : 'An eye for detail.'}</span>
            </h2>
            <p>{skillsSectionSubtitle}</p>
          </Reveal>
          <ExpertiseExplorer skills={sortedSkillsData} lang={lang} onProject={onProjectClick} />
        </div>
      </section>
      <section className="studio-section studio-journey" id="parcours">
        <div className="studio-container studio-journey-layout">
          <Reveal className="studio-section-heading">
            <p className="studio-eyebrow">04 / {fr ? 'Parcours' : 'Experience'}</p>
            <h2>
              {fr ? 'Apprendre.' : 'Learn.'}
              <br />
              {fr ? 'Prendre le relais.' : 'Take ownership.'}
              <br />
              <span>{fr ? 'Faire avancer.' : 'Move things forward.'}</span>
            </h2>
            <p>
              {fr
                ? 'Du support de proximité au pilotage des infrastructures : une progression ancrée dans la pratique.'
                : 'From hands-on support to infrastructure ownership: progress grounded in real work.'}
            </p>
          </Reveal>
          <div className="studio-timeline">
            {sortedTimelineData.map((item, index) => (
              <Reveal
                className={'studio-timeline-item ' + (item.isCurrent ? 'is-current' : '')}
                key={item.date}
                delay={index * 0.04}
              >
                <div className="studio-timeline-marker" aria-hidden="true" />
                <div className="studio-timeline-meta">
                  <span>{item.date}</span>
                  {item.isCurrent && (
                    <span className="studio-current">{fr ? 'Aujourd’hui' : 'Now'}</span>
                  )}
                </div>
                <h3>{item.title}</h3>
                <p className="studio-company">{item.company}</p>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-section studio-education" id="formation">
        <div className="studio-container">
          <Reveal className="studio-section-heading studio-heading-inline">
            <div>
              <p className="studio-eyebrow">05 / {fr ? 'Formation' : 'Education'}</p>
              <h2>{fr ? 'Des bases solides.' : 'Strong foundations.'}</h2>
            </div>
            <p>
              {fr
                ? 'La curiosité comme moteur. La formation comme point d’appui.'
                : 'Driven by curiosity. Grounded in education.'}
            </p>
          </Reveal>
          <div className="studio-education-grid">
            {sortedFormationData.map((item, index) => (
              <Reveal className="studio-education-card" key={item.title} delay={index * 0.08}>
                <p className="studio-eyebrow">{item.year}</p>
                <h3>{item.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: item.school }} />
                {item.gradeNode}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-section studio-references" id="refs">
        <div className="studio-container">
          <Reveal className="studio-section-heading studio-heading-inline">
            <div>
              <p className="studio-eyebrow">06 / {fr ? 'Références' : 'References'}</p>
              <h2>{fr ? 'Le travail se construit ensemble.' : 'Good work is a shared effort.'}</h2>
            </div>
            <p>
              {fr
                ? 'Les professionnels qui connaissent mon travail sur le terrain.'
                : 'Professionals who know my work first-hand.'}
            </p>
          </Reveal>
          <div className="studio-reference-grid">
            {sortedReferencesData.map((reference) => (
              <details className="studio-reference" key={reference.name}>
                <summary>
                  <span className="studio-reference-avatar">{reference.initials}</span>
                  <span>
                    <strong>{reference.name}</strong>
                    <small>{reference.organization}</small>
                  </span>
                  <ChevronDown size={18} />
                </summary>
                <div className="studio-reference-content">
                  <p>{reference.role}</p>
                  {reference.phones.map((phone) => (
                    <a key={phone.href} href={phone.href}>
                      {phone.display}
                    </a>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Reveal>
        <Contact lang={lang} />
      </Reveal>
      <BackToTop lang={lang} />
      <Footer lang={lang} onNavigate={scrollToSection} />
    </main>
  );
};
export default HomePage;
