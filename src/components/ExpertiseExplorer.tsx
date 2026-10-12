import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import type { Language } from '../translations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

type Skill = { title: string; desc: string; icon: ReactNode };
const examples = {
  cloud: {
    project: 'azure-infra',
    FR: ['Microsoft 365', 'Graph API · Power BI', 'Pilotage des usages'],
    EN: ['Microsoft 365', 'Graph API · Power BI', 'Usage insights'],
  },
  security: {
    project: 'siem',
    FR: ['Événements du parc', 'Wazuh SIEM / XDR', 'Visibilité sur les menaces'],
    EN: ['Endpoint events', 'Wazuh SIEM / XDR', 'Threat visibility'],
  },
  management: {
    project: 'tracker',
    FR: ['Équipements & demandes', 'Neemba Tracker', 'Opérations traçables'],
    EN: ['Assets & requests', 'Neemba Tracker', 'Traceable operations'],
  },
  network: {
    project: 'wisignal',
    FR: ['Plan & points d’accès', 'Simulation Wi-Fi', 'Couverture visualisée'],
    EN: ['Floor plan & access points', 'Wi-Fi simulation', 'Coverage visualisation'],
  },
  automation: {
    project: 'automate',
    FR: ['Emails Veeam', 'Power Automate', 'Reporting Excel'],
    EN: ['Veeam emails', 'Power Automate', 'Excel reporting'],
  },
  systems: {
    project: 'orabank',
    FR: ['Utilisateurs & postes', 'Active Directory', 'Accès centralisés'],
    EN: ['Users & workstations', 'Active Directory', 'Centralised access'],
  },
};
const exampleFor = (title: string) => {
  const value = title.toLowerCase();
  if (value.includes('cloud')) return examples.cloud;
  if (value.includes('cyber')) return examples.security;
  if (value.includes('pilotage') || value.includes('management')) return examples.management;
  if (value.includes('réseau') || value.includes('network')) return examples.network;
  if (value.includes('scripting')) return examples.automation;
  return examples.systems;
};

export default function ExpertiseExplorer({
  skills,
  lang,
  onProject,
}: {
  skills: Skill[];
  lang: Language;
  onProject: (id: string) => void;
}) {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const activeIndex = Math.max(
    0,
    skills.findIndex((skill) => skill.title === activeTitle),
  );
  const skill = skills[activeIndex];
  if (!skill) return null;
  const example = exampleFor(skill.title);
  return (
    <div className="studio-explorer">
      <div
        role="tablist"
        aria-label={lang === 'FR' ? 'Domaines de compétences' : 'Skill areas'}
        className="studio-explorer-tabs"
      >
        {skills.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            id={'expertise-tab-' + index}
            aria-controls="expertise-panel"
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            onClick={() => setActiveTitle(item.title)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                next = (index + 1) % skills.length;
              else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                next = (index - 1 + skills.length) % skills.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = skills.length - 1;
              else return;
              event.preventDefault();
              setActiveTitle(skills[next].title);
              buttons.current[next]?.focus();
            }}
          >
            {item.icon}
            <span>{item.title}</span>
            {index === activeIndex && <Check size={14} />}
          </button>
        ))}
      </div>
      <div
        id="expertise-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={'expertise-tab-' + activeIndex}
        className="studio-explorer-panel"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={skill.title}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            <div className="studio-explorer-copy">
              <div>
                <p className="studio-eyebrow">
                  {lang === 'FR' ? 'De la compétence à l’usage' : 'From expertise to practice'}
                </p>
                <h3>{skill.title}</h3>
              </div>
              <p>{skill.desc}</p>
            </div>
            <div
              className="studio-flow"
              aria-label={lang === 'FR' ? 'Exemple de mise en pratique' : 'Example in practice'}
            >
              {example[lang].map((label, index) => (
                <div className="studio-flow-step" key={label}>
                  <span className="studio-flow-index">0{index + 1}</span>
                  <strong>{label}</strong>
                  {index < 2 && (
                    <ArrowRight className="studio-flow-arrow" size={20} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
            <button className="studio-text-link" onClick={() => onProject(example.project)}>
              {lang === 'FR' ? 'Voir cette compétence en action' : 'See this skill in action'}
              <ArrowUpRight size={17} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
