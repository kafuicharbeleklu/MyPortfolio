import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Language } from '../../translations';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import ProjectCard, { type ProjectPreview } from '../ProjectCard';

interface ProjectsProps {
  lang: Language;
  featuredProject: ProjectPreview;
  recentProjects: ProjectPreview[];
  onProjectClick: (id: string) => void;
  onViewAll: () => void;
}

const Projects: React.FC<ProjectsProps> = ({
  lang,
  featuredProject,
  recentProjects,
  onProjectClick,
  onViewAll,
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const selectedProjects = [
    featuredProject,
    ...recentProjects.filter((project) => project.id !== featuredProject.id).slice(0, 2),
  ];

  return (
    <section className="sec studio-project-section" id="projets">
      <motion.div
        className="studio-project-heading"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reducedMotion ? 0 : 0.6 }}
      >
        <div>
          <p className="studio-project-kicker">
            {lang === 'FR' ? '02 / Projets sélectionnés' : '02 / Selected projects'}
          </p>
          <h2 className="sec-ttl">
            {lang === 'FR' ? 'Le travail, en preuves.' : 'The work, in practice.'}
          </h2>
        </div>
        <p className="studio-project-intro">
          {lang === 'FR'
            ? 'Une application métier, une supervision de sécurité, un flux automatisé. Trois façons de relier besoin, architecture et usage.'
            : 'A business application, security monitoring, an automated workflow. Three ways of connecting needs, architecture and use.'}
        </p>
      </motion.div>

      <div className="studio-project-grid studio-project-grid-home">
        {selectedProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            lang={lang}
            index={index}
            featured={index === 0}
            onOpen={onProjectClick}
          />
        ))}
      </div>

      <div className="studio-project-all-row">
        <p>
          {lang === 'FR'
            ? 'D’autres projets, la même attention au détail.'
            : 'More projects, the same attention to detail.'}
        </p>
        <button type="button" className="studio-project-all" onClick={onViewAll}>
          {lang === 'FR' ? 'Explorer tous les projets' : 'Explore all projects'}
          <ArrowUpRight size={19} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default Projects;
