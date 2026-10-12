import type { Language } from '../translations';
import { featuredCases, projectDataPaths, projects } from './content';

/** A dated step of a mission: "2023-07", "Installation du manager Wazuh". */
export type Milestone = { date: string; label: string };
/** A result worth a number or a short phrase: "Couverture du parc", "100 %". */
export type Metric = { label: string; value: string; note?: string };

export type StudyText = {
  role?: string;
  status?: string;
  context: string;
  steps: string[];
  decision?: string;
  result: string;
  timeline?: Milestone[];
  metrics?: Metric[];
};

export type Study = {
  environment?: string;
  /** ISO dates ("2023-05"); an open mission has `end: null` */
  start?: string;
  end?: string | null;
  technologies?: string[];
  /** ids of the projects shown as related at the end of the page */
  related?: string[];
} & Record<Language, StudyText>;

type PartialStudy = Omit<Partial<Study>, Language> & {
  FR?: Partial<StudyText>;
  EN?: Partial<StudyText>;
};

// Written studies: the three missions enriched (dates, role, status, timeline, results, as
// published in the previous version of the site) and the internal tools.
const writtenStudies: Record<string, PartialStudy> = {
  siem: {
    start: '2023-05',
    end: '2024-08',
    environment: 'Linux · Wazuh · OpenSearch · sur site',
    technologies: ['Wazuh', 'SIEM / XDR', 'Linux', 'OpenSearch', 'Kibana', 'Bash'],
    related: ['orabank', 'mfa'],
    FR: {
      role: 'Responsable technique',
      status: 'En production',
      timeline: [
        { date: '2023-05', label: 'Audit du parc et cahier des charges' },
        { date: '2023-07', label: 'Installation du manager Wazuh sur un serveur Linux dédié' },
        { date: '2023-09', label: 'Déploiement des agents sur les postes et serveurs' },
        { date: '2023-12', label: 'Règles de détection personnalisées en service' },
        { date: '2024-08', label: 'Couverture complète du parc, passage en production' },
      ],
      metrics: [
        {
          label: 'Couverture du parc',
          value: '100 %',
          note: 'postes et serveurs surveillés en temps réel',
        },
        {
          label: 'Posture de sécurité',
          value: 'De réactive à proactive',
          note: 'les alertes arrivent avant l’impact',
        },
      ],
    },
    EN: {
      role: 'Technical lead',
      status: 'In production',
      timeline: [
        { date: '2023-05', label: 'Audit of the fleet and requirements' },
        { date: '2023-07', label: 'Wazuh manager installed on a dedicated Linux server' },
        { date: '2023-09', label: 'Agents deployed on endpoints and servers' },
        { date: '2023-12', label: 'Custom detection rules in service' },
        { date: '2024-08', label: 'Full fleet coverage, in production' },
      ],
      metrics: [
        {
          label: 'Fleet coverage',
          value: '100 %',
          note: 'endpoints and servers monitored in real time',
        },
        {
          label: 'Security posture',
          value: 'From reactive to proactive',
          note: 'alerts come before the impact',
        },
      ],
    },
  },
  moov: {
    start: '2024-01',
    end: '2024-06',
    environment: 'Télécom · VSAT · ARCEP',
    technologies: ['VSAT', 'ARCEP', 'Télécom', 'Gestion de projet'],
    related: ['siem', 'biasa'],
    FR: {
      role: 'Chef de projet IT',
      status: 'Livré',
      timeline: [
        { date: '2024-01', label: 'Audit et cartographie des lignes' },
        { date: '2024-03', label: 'Coordination du calendrier avec les deux opérateurs' },
        { date: '2024-06', label: 'Migration finalisée et documentée' },
      ],
      metrics: [
        {
          label: 'Continuité de service',
          value: 'Zéro interruption',
          note: 'bascule transparente pour les utilisateurs',
        },
      ],
    },
    EN: {
      role: 'IT project lead',
      status: 'Delivered',
      timeline: [
        { date: '2024-01', label: 'Audit and mapping of the lines' },
        { date: '2024-03', label: 'Schedule coordinated with both operators' },
        { date: '2024-06', label: 'Migration completed and documented' },
      ],
      metrics: [
        {
          label: 'Service continuity',
          value: 'Zero downtime',
          note: 'a switchover users did not notice',
        },
      ],
    },
  },
  orabank: {
    start: '2022-06',
    end: '2022-10',
    environment: 'Windows Server 2019 · Active Directory · GPO',
    technologies: [
      'Windows Server 2019',
      'Active Directory',
      'GPO',
      'DNS',
      'DHCP',
      'WSUS',
      'WDS',
      'VPN',
    ],
    related: ['siem', 'ubuntu_ldap'],
    FR: {
      role: 'Technicien système (stage)',
      status: 'Livré',
      timeline: [
        { date: '2022-06', label: 'Analyse et installation d’Active Directory' },
        { date: '2022-08', label: 'Stratégies de groupe et jonction des postes des agences' },
        { date: '2022-10', label: 'Recette finale et remise' },
      ],
      metrics: [
        {
          label: 'Gestion centralisée',
          value: 'Multi-agences',
          note: 'authentification et politiques unifiées',
        },
      ],
    },
    EN: {
      role: 'Systems technician (internship)',
      status: 'Delivered',
      timeline: [
        { date: '2022-06', label: 'Analysis and Active Directory installation' },
        { date: '2022-08', label: 'Group policies and branch workstations joined' },
        { date: '2022-10', label: 'Final acceptance and handover' },
      ],
      metrics: [
        {
          label: 'Central management',
          value: 'Multi-branch',
          note: 'unified authentication and policies',
        },
      ],
    },
  },
  tracker: {
    start: '2026-02',
    end: null,
    environment: 'React · TypeScript · Azure AD · Node.js',
    related: ['printtrack', 'smartprocure'],
    FR: {
      role: 'Conception & développement fullstack',
      status: 'En cours',
      context:
        'Je développe Neemba Tracker pour réunir le suivi du parc, les demandes et les validations dans un seul outil.',
      steps: [
        'Je structure les équipements, les utilisateurs et les emplacements.',
        'Je construis les parcours d’affectation et d’approbation.',
        'J’intègre Azure AD, les exports et les audits.',
        'Je relie les contrôles terrain aux fiches du parc.',
      ],
      decision:
        'Je définis les droits d’accès dans les règles métier : afficher un bouton ne suffit pas à autoriser une action.',
      result: 'Je fais évoluer un outil qui rassemble inventaire, demandes, audits et reporting.',
    },
    EN: {
      role: 'Fullstack design & development',
      status: 'In progress',
      context:
        'I’m developing Neemba Tracker to bring assets, requests and approvals together in one tool.',
      steps: [
        'I structure assets, users and locations.',
        'I build assignment and approval workflows.',
        'I integrate Azure AD, exports and audits.',
        'I connect field checks to asset records.',
      ],
      decision:
        'I define access permissions in business rules: displaying a button is not enough to authorise an action.',
      result:
        'I’m building an evolving tool that combines inventory, requests, audits and reporting.',
    },
  },
  automate: {
    start: '2025-03',
    end: '2025-03',
    environment: 'Power Automate · Veeam · Outlook · Excel Online',
    related: ['azure-infra', 'siem'],
    FR: {
      role: 'Conception du workflow',
      status: 'En service',
      context:
        'Je voulais suivre les sauvegardes Veeam sans recopier les notifications email dans Excel.',
      steps: [
        'J’ai déclenché le flux à la réception des emails Veeam.',
        'J’ai extrait le nom du job et les indicateurs de résultat.',
        'J’ai ajouté un contrôle des doublons.',
        'J’ai centralisé les données dans Excel Online.',
      ],
      decision:
        'Je contrôle la date et le nom du job avant l’écriture pour éviter de compter deux fois la même notification.',
      result: 'J’ai automatisé le suivi des sauvegardes et réduit la saisie manuelle.',
    },
    EN: {
      role: 'Workflow design',
      status: 'In service',
      context: 'I wanted to track Veeam backups without copying email notifications into Excel.',
      steps: [
        'I triggered the flow when Veeam emails arrive.',
        'I extracted the job name and result indicators.',
        'I added a duplicate check.',
        'I centralised the data in Excel Online.',
      ],
      decision:
        'I check the date and job name before writing to avoid counting the same notification twice.',
      result: 'I automated backup reporting and reduced manual entry.',
    },
  },
  biasa: {
    start: '2021-09',
    end: '2021-09',
    environment: 'Ubuntu Server · DNS · DHCP · Apache',
    technologies: ['Ubuntu Server', 'DNS', 'DHCP', 'Apache', 'NAT'],
    related: ['orabank', 'ubuntu_ldap'],
    FR: {
      role: 'Technicien réseau (stage)',
      status: 'Livré',
      context:
        'Pendant mon stage, je devais installer les services réseau nécessaires au fonctionnement de la clinique.',
      steps: [
        'J’ai préparé Ubuntu Server.',
        'J’ai configuré DNS et DHCP.',
        'J’ai installé Apache et le partage de connexion NAT.',
        'J’ai vérifié les services et accompagné les utilisateurs.',
      ],
      result:
        'J’ai mis en place les services Linux pour connecter les équipements et rendre les ressources internes accessibles.',
    },
    EN: {
      role: 'Network technician (internship)',
      status: 'Delivered',
      context:
        'During my internship, I needed to install the network services the clinic required.',
      steps: [
        'I prepared Ubuntu Server.',
        'I configured DNS and DHCP.',
        'I installed Apache and NAT connection sharing.',
        'I checked the services and supported users.',
      ],
      result: 'I set up Linux services to connect devices and make internal resources accessible.',
    },
  },
};

// The featured cases of the home page carry the need, the steps and the result of a mission;
// the written study adds everything else. Both are merged, the written text winning when set.
const fromFeatured: Record<string, PartialStudy> = Object.fromEntries(
  featuredCases.map((item) => [
    item.id,
    {
      FR: { context: item.context.FR, steps: item.steps.FR, result: item.result.FR },
      EN: { context: item.context.EN, steps: item.steps.EN, result: item.result.EN },
    },
  ]),
);

const merge = (base: PartialStudy | undefined, extra: PartialStudy | undefined): Study =>
  ({
    ...base,
    ...extra,
    FR: { ...base?.FR, ...extra?.FR },
    EN: { ...base?.EN, ...extra?.EN },
  }) as Study;

export const studies: Record<string, Study> = Object.fromEntries(
  Array.from(new Set([...Object.keys(fromFeatured), ...Object.keys(writtenStudies)])).map((id) => [
    id,
    merge(fromFeatured[id], writtenStudies[id]),
  ]),
);

/** A project gets its own page only when there is something to read beyond the list summary. */
export const hasDetailPage = (id: string) => id in studies || id in projectDataPaths;

export const detailProjects = projects.filter((project) => hasDetailPage(project.id));
