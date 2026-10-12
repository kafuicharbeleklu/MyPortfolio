import React from 'react';
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Cloud,
  Database,
  Network,
  Server,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Language } from '../translations';
import type { ProjectCardData } from '../types/portfolio';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

export type ProjectPreview = Pick<
  ProjectCardData,
  'id' | 'title' | 'companyLine' | 'desc' | 'category' | 'tags' | 'icon' | 'coverImage'
>;

interface ProjectCardProps {
  project: ProjectPreview;
  lang: Language;
  index?: number;
  featured?: boolean;
  onOpen?: (id: string) => void;
}

const projectIcons = {
  shield: ShieldCheck,
  signal: Wifi,
  domain: Network,
  server: Server,
  cloud: Cloud,
  grid: ChartNoAxesCombined,
};

const projectFlows: Record<string, Record<Language, string[]>> = {
  tracker: {
    FR: ['Inventaire', 'Validation', 'Traçabilité'],
    EN: ['Inventory', 'Approvals', 'Traceability'],
  },
  siem: {
    FR: ['Événements', 'Wazuh SIEM', 'Alertes'],
    EN: ['Events', 'Wazuh SIEM', 'Alerts'],
  },
  automate: {
    FR: ['Emails Veeam', 'Extraction', 'Reporting'],
    EN: ['Veeam emails', 'Extraction', 'Reporting'],
  },
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  lang,
  index = 0,
  featured = false,
  onOpen,
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const Icon = projectIcons[project.icon];
  const flow = projectFlows[project.id]?.[lang];

  return (
    <motion.article
      className={`studio-project-card${featured ? ' studio-project-card-featured' : ''}`}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : index * 0.07 }}
    >
      <div className={`studio-project-visual studio-project-visual-${project.icon}`}>
        {project.coverImage ? (
          <img
            className="studio-project-cover"
            src={project.coverImage}
            alt={lang === 'FR' ? `Aperçu de ${project.title.FR}` : `Preview of ${project.title.EN}`}
            loading="lazy"
            decoding="async"
          />
        ) : flow ? (
          <div className="studio-project-process">
            <div className="studio-project-process-head">
              <span>{lang === 'FR' ? 'Logique du projet' : 'Project flow'}</span>
              <span>0{index + 1} / 03</span>
            </div>
            <ol aria-label={lang === 'FR' ? 'Étapes du projet' : 'Project steps'}>
              {flow.map((step, stepIndex) => (
                <motion.li
                  key={step}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, delay: stepIndex * 0.12 }}
                >
                  <span>0{stepIndex + 1}</span>
                  <strong>{step}</strong>
                </motion.li>
              ))}
            </ol>
            <div className="studio-project-process-foot">
              <span>{project.category[lang]}</span>
              <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="studio-project-diagram" aria-hidden="true">
            <span className="studio-project-node studio-project-node-one">
              <Server size={24} strokeWidth={1.3} />
            </span>
            <span className="studio-project-symbol">
              <Icon size={58} strokeWidth={1.15} />
            </span>
            <span className="studio-project-node studio-project-node-two">
              <Database size={24} strokeWidth={1.3} />
            </span>
            <span className="studio-project-visual-caption">{project.category[lang]}</span>
          </div>
        )}
        {featured && !flow && (
          <span className="studio-project-featured-label">
            {lang === 'FR' ? 'Projet à la une' : 'Featured project'}
          </span>
        )}
      </div>
      <div className="studio-project-body">
        <div className="studio-project-meta">
          <span className="studio-project-category">{project.category[lang]}</span>
          <span className="studio-project-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <h3 className="studio-project-title">{project.title[lang]}</h3>
        <p className="studio-project-company">{project.companyLine[lang]}</p>
        <p className="studio-project-description">{project.desc[lang]}</p>
        <ul
          className="studio-project-tags"
          aria-label={lang === 'FR' ? 'Technologies utilisées' : 'Technologies used'}
        >
          {project.tags.map((tag) => (
            <li key={`${project.id}-${tag.label}`}>{tag.label}</li>
          ))}
        </ul>
        {onOpen ? (
          <button
            type="button"
            className="studio-project-link"
            onClick={() => onOpen(project.id)}
            aria-label={
              lang === 'FR'
                ? `Découvrir le projet ${project.title.FR}`
                : `Explore the ${project.title.EN} project`
            }
          >
            <span>{lang === 'FR' ? 'Découvrir le projet' : 'Explore the project'}</span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
        ) : (
          <span className="studio-project-note">
            {lang === 'FR' ? 'Présentation synthétique' : 'Project overview'}
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default ProjectCard;
