import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { assetPaths, withBaseAsset } from '../config/assets';
import { getSkillsData, getTimelineData, getFormationData } from '../data';
import useLightbox from './useLightbox';
import useLocalRouting, { createIsDetailPage, isNavigableSection } from './useLocalRouting';
import useMobileScrollDots from './useMobileScrollDots';
import usePrefersReducedMotion from './usePrefersReducedMotion';
import useProjectLoader from './useProjectLoader';
import HomePage from '../pages/HomePage';
import Footer from '../components/sections/Footer';
import { Language, t } from '../translations';
import type {
  PaginationToken,
  ProjectCardData,
  ProjectFilterKey,
  ProjectTag,
  ReferenceContact,
  SectionWithSubcopy,
  StructuredProjectConfig,
  StructuredProjectData,
  TranslationPageSections,
} from '../types/portfolio';

const CaseStudyPage = lazy(() => import('../pages/CaseStudyPage'));
const curatedStudyIds = new Set(['tracker', 'siem', 'automate', 'moov', 'orabank', 'biasa']);
const BiographyPage = lazy(() => import('../pages/BiographyPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const ProjectDetailLightbox = lazy(() =>
  import('../pages/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailLightbox,
  })),
);

const getProjectsPerPage = () => {
  if (typeof window === 'undefined') {
    return 6;
  }

  if (window.innerWidth >= 1440) {
    return 9;
  }

  if (window.innerWidth >= 1024) {
    return 6;
  }

  if (window.innerWidth >= 768) {
    return 4;
  }

  return 3;
};

const isMobilePeekCarousel = () => typeof window !== 'undefined' && window.innerWidth <= 768;

const measurePeekCarouselOffset = (shell: HTMLDivElement | null, activeIndex: number) => {
  if (!shell || !isMobilePeekCarousel()) {
    return 0;
  }

  const track = shell.querySelector<HTMLElement>('.mobile-peek-track');
  const items = Array.from(shell.querySelectorAll('.mobile-peek-item')) as HTMLElement[];

  if (!track || !items.length) {
    return 0;
  }

  const safeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));
  const activeItem = items[safeIndex];
  const activeCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
  const rawOffset = activeCenter - shell.clientWidth / 2;
  const maxOffset = Math.max(0, track.scrollWidth - shell.clientWidth);

  return Math.max(0, Math.min(rawOffset, maxOffset));
};

const buildPaginationTokens = (currentPage: number, totalPages: number): PaginationToken[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis-right', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis-left', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    'ellipsis-left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-right',
    totalPages,
  ];
};

const structuredProjectConfigs: Record<string, StructuredProjectConfig> = {
  automate: {
    dataPath: 'projects/automate/projects_data.json',
    client: {
      FR: 'Power Platform / Microsoft 365',
      EN: 'Power Platform / Microsoft 365',
    },
    role: {
      FR: 'Conception de workflow et logique de reporting',
      EN: 'Workflow design and reporting logic',
    },
    environment: {
      FR: 'Power Automate · Outlook · Excel Online',
      EN: 'Power Automate · Outlook · Excel Online',
    },
    fallbackStatus: {
      FR: 'Operationnel',
      EN: 'Operational',
    },
    relatedIds: ['azure-infra', 'siem'],
  },
  'azure-infra': {
    dataPath: 'projects/azure-infra/projects_data.json',
    client: {
      FR: 'Microsoft 365 / Azure AD',
      EN: 'Microsoft 365 / Azure AD',
    },
    role: {
      FR: 'Conception BI, modele semantique et integration Graph',
      EN: 'BI design, semantic model, and Graph integration',
    },
    environment: {
      FR: 'Power BI · Graph API · DAX',
      EN: 'Power BI · Graph API · DAX',
    },
    fallbackStatus: {
      FR: 'Termine',
      EN: 'Completed',
    },
    relatedIds: ['automate', 'wisignal'],
  },
  wisignal: {
    dataPath: 'projects/wisignal/projects_data.json',
    client: {
      FR: 'Neemba CAT Togo',
      EN: 'Neemba CAT Togo',
    },
    role: {
      FR: 'Conception produit et logique de simulation radio',
      EN: 'Product design and radio simulation logic',
    },
    environment: {
      FR: 'HTML · CSS · JavaScript · Canvas',
      EN: 'HTML · CSS · JavaScript · Canvas',
    },
    fallbackStatus: {
      FR: 'Termine',
      EN: 'Completed',
    },
    relatedIds: ['moov', 'azure-infra'],
  },
  printtrack: {
    dataPath: 'projects/printtrack/projects_data.json',
    client: {
      FR: 'Application interne de gestion des consommables',
      EN: 'Internal consumables management app',
    },
    role: {
      FR: 'Conception front-end et logique metier stock/couts',
      EN: 'Front-end design and stock/cost business logic',
    },
    environment: {
      FR: 'React · TypeScript · Vite',
      EN: 'React · TypeScript · Vite',
    },
    fallbackStatus: {
      FR: 'MVP',
      EN: 'MVP',
    },
    relatedIds: ['tracker', 'smartprocure'],
  },
  smartprocure: {
    dataPath: 'projects/smartprocure/projects_data.json',
    client: {
      FR: 'Aide a la decision achats assistee par IA',
      EN: 'AI-assisted procurement decision support',
    },
    role: {
      FR: 'Solo developer',
      EN: 'Solo developer',
    },
    environment: {
      FR: 'React · Gemini API · local-first',
      EN: 'React · Gemini API · local-first',
    },
    fallbackStatus: {
      FR: 'MVP',
      EN: 'MVP',
    },
    relatedIds: ['printtrack', 'tracker'],
  },
  tracker: {
    dataPath: 'projects/tracker/projects_data.json',
    client: {
      FR: 'Pilotage parc IT et operations internes',
      EN: 'IT fleet and internal operations tracking',
    },
    role: {
      FR: 'Solo fullstack developer',
      EN: 'Solo fullstack developer',
    },
    environment: {
      FR: 'React · Node.js · Azure AD',
      EN: 'React · Node.js · Azure AD',
    },
    fallbackStatus: {
      FR: 'En cours',
      EN: 'In progress',
    },
    relatedIds: ['printtrack', 'smartprocure'],
  },
  mfa: {
    dataPath: 'projects/mfa/projects_data.json',
    client: {
      FR: 'Projet personnel de durcissement Ubuntu',
      EN: 'Personal Ubuntu hardening project',
    },
    role: {
      FR: 'Documentation et mise en oeuvre',
      EN: 'Implementation and technical documentation',
    },
    environment: {
      FR: 'Ubuntu · PAM · OpenSSH',
      EN: 'Ubuntu · PAM · OpenSSH',
    },
    fallbackStatus: {
      FR: 'Termine',
      EN: 'Completed',
    },
    relatedIds: ['siem', 'ubuntu_ldap'],
    resourceLinks: [
      {
        href: 'projects/mfa/exports/rapport_mfa.pdf',
        label: {
          FR: 'Rapport PDF',
          EN: 'PDF report',
        },
      },
    ],
  },
  ubuntu_ldap: {
    dataPath: 'projects/ubuntu_ldap/projects_data.json',
    client: {
      FR: 'Projet personnel Active Directory sous Ubuntu',
      EN: 'Personal Ubuntu Active Directory project',
    },
    role: {
      FR: 'Conception, configuration et documentation',
      EN: 'Design, configuration, and documentation',
    },
    environment: {
      FR: 'Ubuntu · Samba AD · Kerberos',
      EN: 'Ubuntu · Samba AD · Kerberos',
    },
    fallbackStatus: {
      FR: 'Termine',
      EN: 'Completed',
    },
    relatedIds: ['orabank', 'mfa'],
    resourceLinks: [
      {
        href: 'projects/ubuntu_ldap/exports/rapport_ldap.pdf',
        label: {
          FR: 'Rapport PDF',
          EN: 'PDF report',
        },
      },
    ],
  },
  postgresql_ssl: {
    dataPath: 'projects/postgresql_ssl/projects_data.json',
    client: {
      FR: 'Projet personnel PostgreSQL sous Windows Server',
      EN: 'Personal PostgreSQL project on Windows Server',
    },
    role: {
      FR: 'Configuration SSL/TLS et securisation des acces',
      EN: 'SSL/TLS setup and access hardening',
    },
    environment: {
      FR: 'PostgreSQL · Windows Server · OpenSSL',
      EN: 'PostgreSQL · Windows Server · OpenSSL',
    },
    fallbackStatus: {
      FR: 'Termine',
      EN: 'Completed',
    },
    relatedIds: ['mfa', 'ubuntu_ldap'],
  },
};

type StructuredProjectId = keyof typeof structuredProjectConfigs;
const structuredProjectIds = Object.keys(structuredProjectConfigs) as StructuredProjectId[];
const isDetailPage = createIsDetailPage(structuredProjectIds);

const getSectionSubcopy = (section: SectionWithSubcopy) => section.subtitle ?? section.sub ?? '';

const renderProjectIcon = (icon: ProjectCardData['icon'], accent: string) => {
  switch (icon) {
    case 'shield':
      return (
        <svg width="45" height="45" viewBox="0 0 90 90" fill="none" style={{ opacity: '.3' }}>
          <path
            d="M45 10L75 24L75 48C75 64 60 76 45 80C30 76 15 64 15 48L15 24Z"
            stroke={accent}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="45" cy="46" r="13" stroke={accent} strokeWidth="1.5" fill="none" />
          <circle cx="45" cy="46" r="5" fill={accent} opacity=".6" />
        </svg>
      );
    case 'signal':
      return (
        <svg width="45" height="45" viewBox="0 0 60 60" fill="none" style={{ opacity: '.35' }}>
          <circle cx="30" cy="30" r="20" stroke={accent} strokeWidth="1.5" fill="none" />
          <circle cx="30" cy="30" r="12" stroke={accent} strokeWidth="1" fill="none" />
          <circle cx="30" cy="30" r="5" stroke={accent} strokeWidth="1" fill="none" />
          <circle cx="30" cy="30" r="2" fill={accent} />
        </svg>
      );
    case 'domain':
      return (
        <svg width="45" height="45" viewBox="0 0 60 60" fill="none" style={{ opacity: '.35' }}>
          <rect
            x="20"
            y="8"
            width="20"
            height="12"
            rx="2"
            stroke={accent}
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="8"
            y="34"
            width="16"
            height="10"
            rx="2"
            stroke={accent}
            strokeWidth="1"
            fill="none"
          />
          <rect
            x="36"
            y="34"
            width="16"
            height="10"
            rx="2"
            stroke={accent}
            strokeWidth="1"
            fill="none"
          />
          <line x1="30" y1="20" x2="30" y2="34" stroke={accent} />
          <line x1="16" y1="28" x2="44" y2="28" stroke={accent} />
          <line x1="16" y1="28" x2="16" y2="34" stroke={accent} />
          <line x1="44" y1="28" x2="44" y2="34" stroke={accent} />
        </svg>
      );
    case 'server':
      return (
        <svg width="45" height="45" viewBox="0 0 60 60" fill="none" style={{ opacity: '.35' }}>
          <rect
            x="10"
            y="16"
            width="40"
            height="8"
            rx="2"
            stroke={accent}
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="10"
            y="28"
            width="40"
            height="8"
            rx="2"
            stroke={accent}
            strokeWidth="1"
            fill="none"
          />
          <circle cx="44" cy="20" r="2" fill={accent} />
          <line x1="18" y1="40" x2="42" y2="40" stroke={accent} />
          <line x1="30" y1="36" x2="30" y2="44" stroke={accent} />
        </svg>
      );
    case 'cloud':
      return (
        <svg width="45" height="45" viewBox="0 0 60 60" fill="none" style={{ opacity: '.35' }}>
          <path
            d="M15 35C15 25 30 20 30 30C30 20 45 25 45 35C50 35 50 45 45 45L15 45C10 45 10 35 15 35Z"
            stroke={accent}
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );
    case 'grid':
      return (
        <svg width="45" height="45" viewBox="0 0 60 60" fill="none" style={{ opacity: '.35' }}>
          <circle cx="30" cy="30" r="15" stroke={accent} strokeWidth="1.5" fill="none" />
          <line x1="15" y1="30" x2="45" y2="30" stroke={accent} />
          <line x1="30" y1="15" x2="30" y2="45" stroke={accent} />
        </svg>
      );
  }
};

const projectCatalog: ProjectCardData[] = [
  {
    id: 'siem',
    sortDate: 202411,
    title: {
      FR: 'Déploiement SIEM / XDR Wazuh',
      EN: 'Wazuh SIEM / XDR Deployment',
    },
    companyLine: {
      FR: 'Neemba Togo · 2023-2024',
      EN: 'Neemba Togo · 2023-2024',
    },
    desc: {
      FR: "Projet de stage académique chez Neemba Togo : déploiement de Wazuh pour centraliser les événements de sécurité et configurer la détection.",
      EN: 'Academic internship project at Neemba Togo: Wazuh deployment for centralised security events and detection rules.',
    },
    category: {
      FR: 'Cybersécurité',
      EN: 'Cybersecurity',
    },
    categoryKey: 'cybersecurity',
    tags: [
      { label: 'Wazuh', className: 'tc' },
      { label: 'SIEM', className: 'tc' },
      { label: 'XDR', className: 'tc' },
    ],
    background: '#2C3E2E',
    accent: '#D4956A',
    icon: 'shield',
    detailPage: true,
  },
  {
    id: 'moov',
    sortDate: 202412,
    title: {
      FR: 'Portabilité MOOV → Togocom',
      EN: 'MOOV → Togocom Portability',
    },
    companyLine: {
      FR: 'Neemba Togo · 2024',
      EN: 'Neemba Togo · 2024',
    },
    desc: {
      FR: 'Migration complète du réseau mobile avec supervision VSAT et continuité de service.',
      EN: 'Complete mobile network migration with VSAT monitoring and service continuity.',
    },
    category: {
      FR: 'Télécom',
      EN: 'Telecom',
    },
    categoryKey: 'network',
    tags: [
      { label: 'VSAT', className: 'tt' },
      { label: 'Migration', className: 'tt' },
    ],
    background: '#2B3A4A',
    accent: '#7BBFD0',
    icon: 'signal',
    detailPage: true,
  },
  {
    id: 'orabank',
    sortDate: 202210,
    title: {
      FR: 'Contrôleur de domaine Orabank',
      EN: 'Orabank Domain Controller',
    },
    companyLine: {
      FR: 'Orabank Togo · Stage 2022',
      EN: 'Orabank Togo · Internship 2022',
    },
    desc: {
      FR: 'Déploiement Windows Server AD, GPO et politiques de sécurité multi-agences.',
      EN: 'Windows Server AD deployment, GPO, and multi-branch security policies.',
    },
    category: {
      FR: 'Réseau',
      EN: 'Network',
    },
    categoryKey: 'network',
    tags: [
      { label: 'Windows Server', className: 'tr' },
      { label: 'AD', className: 'tr' },
    ],
    background: '#3A2C1E',
    accent: '#C8A85A',
    icon: 'domain',
    detailPage: true,
  },
  {
    id: 'biasa',
    sortDate: 202109,
    title: {
      FR: 'Services réseau Linux · BIASA',
      EN: 'Linux Network Services · BIASA',
    },
    companyLine: {
      FR: 'Clinique BIASA · Stage 2021',
      EN: 'BIASA Clinic · Internship 2021',
    },
    desc: {
      FR: 'DNS, DHCP, Apache et NAT sur Ubuntu Server avec réseau construit from scratch.',
      EN: 'DNS, DHCP, Apache, and NAT on Ubuntu Server with the network built from scratch.',
    },
    category: {
      FR: 'Linux',
      EN: 'Linux',
    },
    categoryKey: 'infrastructure',
    tags: [
      { label: 'Ubuntu', className: 'tl2' },
      { label: 'DNS/DHCP', className: 'tl2' },
    ],
    background: '#2A3830',
    accent: '#7DC4A0',
    icon: 'server',
    detailPage: true,
  },
  {
    id: 'azure-infra',
    sortDate: 202307,
    title: {
      FR: 'Déploiement infra cloud Azure',
      EN: 'Azure Cloud Infrastructure Deployment',
    },
    companyLine: {
      FR: 'Neemba Togo · 2023',
      EN: 'Neemba Togo · 2023',
    },
    desc: {
      FR: "Mise en place d'une architecture hybride avec Azure AD et synchronisation locale.",
      EN: 'Deployment of a hybrid architecture with Azure AD and local synchronization.',
    },
    category: {
      FR: 'Cloud',
      EN: 'Cloud',
    },
    categoryKey: 'cloud',
    tags: [
      { label: 'Azure', className: 'tb' },
      { label: 'M365', className: 'tb' },
    ],
    background: '#2D2A38',
    accent: '#9B82C3',
    icon: 'cloud',
    detailPage: false,
  },
  {
    id: 'lan-wan',
    sortDate: 202209,
    title: {
      FR: 'Refonte réseau LAN/WAN',
      EN: 'LAN/WAN Network Redesign',
    },
    companyLine: {
      FR: 'Projet académique · 2022',
      EN: 'Academic project · 2022',
    },
    desc: {
      FR: "Conception et simulation d'une architecture réseau d'entreprise multi-sites sous GNS3.",
      EN: 'Design and simulation of a multi-site enterprise network architecture in GNS3.',
    },
    category: {
      FR: 'Infrastructure',
      EN: 'Infrastructure',
    },
    categoryKey: 'network',
    tags: [
      { label: 'Cisco', className: 'ts' },
      { label: 'GNS3', className: 'ts' },
    ],
    background: '#382A2A',
    accent: '#C38282',
    icon: 'grid',
    detailPage: false,
  },
];

const usePortfolioModel = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectFilterKey>('all');
  const [projectPage, setProjectPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(() => getProjectsPerPage());
  const [isProjectFilterMenuOpen, setIsProjectFilterMenuOpen] = useState(false);
  const [referenceCarouselIndex, setReferenceCarouselIndex] = useState(0);
  const [desktopReferencePage, setDesktopReferencePage] = useState(0);
  const [referenceCarouselOffset, setReferenceCarouselOffset] = useState(0);
  const [detailCarouselIndex, setDetailCarouselIndex] = useState<Record<string, number>>({});
  const [detailCarouselOffset, setDetailCarouselOffset] = useState<Record<string, number>>({});
  const referenceCarouselRef = useRef<HTMLDivElement | null>(null);
  const detailCarouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const projectFilterMenuRef = useRef<HTMLDivElement | null>(null);
  const projectReturnPageRef = useRef<'main' | 'all-projects'>('main');
  const allProjectsSectionRef = useRef<HTMLElement | null>(null);
  const carouselTouchStartX = useRef<Record<string, number | null>>({});
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'FR';
    }

    const savedLang = window.localStorage.getItem('portfolio_lang');
    if (savedLang === 'FR' || savedLang === 'EN') {
      return savedLang;
    }

    return window.navigator.language.toLowerCase().startsWith('fr') ? 'FR' : 'EN';
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const { projects: structuredProjectData, loadProjectDetail } = useProjectLoader(
    structuredProjectConfigs,
    withBaseAsset,
  );
  const {
    lightbox: projectImageLightbox,
    openLightbox: openProjectImageLightbox,
    closeLightbox: closeProjectImageLightbox,
    stepLightbox: stepProjectImageLightbox,
    goToLightbox: goToProjectImageLightbox,
  } = useLightbox();
  const v = t[lang];
  const typedSections = v as TranslationPageSections;
  const skillsData = getSkillsData(lang);
  const timelineData = getTimelineData(lang);
  const formationData = getFormationData(lang);
  const educationSection =
    typedSections.education ??
    (lang === 'FR'
      ? {
          num: '05',
          title: 'Ma formation',
          subtitle: 'Diplômes obtenus avec distinction dans les meilleures institutions de Lomé.',
        }
      : {
          num: '05',
          title: 'My Education',
          subtitle: 'Degrees earned with distinction from leading institutions in Lomé.',
        });
  const referencesSection =
    typedSections.references ??
    (lang === 'FR'
      ? {
          num: '07',
          title: 'Mes références',
          subtitle: 'Références professionnelles disponibles sur demande.',
        }
      : {
          num: '07',
          title: 'My References',
          subtitle: 'Professional references and recommendation contacts.',
        });

  const referencesData: ReferenceContact[] = [
    {
      initials: 'YN',
      name: 'Yan NYAKU',
      organization: 'CFAO Mobility Togo',
      role: 'DSI',
      phones: [{ display: '+228 93 23 24 65', href: 'tel:+22893232465' }],
    },
    {
      initials: 'JK',
      name: 'Jerome KPETO',
      organization: 'CORIS BANK INTERNATIONAL TOGO',
      role: 'RSI',
      phones: [{ display: '+228 96 11 03 56', href: 'tel:+22896110356' }],
    },
    {
      initials: 'AK',
      name: 'Ange KOBLAN',
      organization: 'FINANCE AFRIQUE / Hub Abidjan',
      role: 'Responsable Regional Support IT',
      phones: [{ display: '+225 07 07 79 90 81', href: 'tel:+2250707799081' }],
    },
    {
      initials: 'ED',
      name: 'El Djiba Kolon DIALLO',
      organization: 'DSI - Support & Operations',
      role: 'Chef de projet / Administrateur Systemes et Reseaux',
      phones: [{ display: '+224 621 08 86 97', href: 'tel:+224621088697' }],
    },
    {
      initials: 'AD',
      name: 'Alfred Noel DEGBE',
      organization: 'Groupe Orabank',
      role: 'Ingenieur support informatique',
      phones: [{ display: '+228 90 54 13 91', href: 'tel:+22890541391' }],
    },
    {
      initials: 'AK',
      name: 'Afi KOSSI',
      organization: 'Direction SSE Benin | Togo',
      role: 'Coordinatrice SSE Benin | Togo',
      phones: [{ display: '+228 92 10 48 16', href: 'tel:+22892104816' }],
    },
    {
      initials: 'BM',
      name: 'Baboyime MAEBENA',
      organization: 'Ressources Humaines',
      role: 'Responsable RH Benin',
      phones: [{ display: '+228 91 57 49 04', href: 'tel:+22891574904' }],
    },
    {
      initials: 'AK',
      name: 'Ankou KOUNTA',
      organization: 'Logistique',
      role: 'Responsable Logistique',
      phones: [{ display: '+228 99 67 01 84', href: 'tel:+22899670184' }],
    },
    {
      initials: 'DS',
      name: 'Desire Francois SAVADOGO',
      organization: 'DSI - Support & Operations',
      role: 'Expert Systemes et Reseaux',
      phones: [{ display: '+226 01 14 62 66', href: 'tel:+22601146266' }],
    },
    {
      initials: 'ON',
      name: 'Ousseni NAITE',
      organization: 'DSI - Cybersecurite / GRC',
      role: 'Responsable GRC',
      phones: [{ display: '+226 70 94 12 14', href: 'tel:+22670941214' }],
    },
  ];
  const alphaCollator = new Intl.Collator(lang === 'FR' ? 'fr' : 'en', {
    numeric: true,
    sensitivity: 'base',
  });
  const sortAlphabetically = <T,>(items: T[], getValue: (item: T) => string) =>
    [...items].sort((a, b) => alphaCollator.compare(getValue(a), getValue(b)));
  const sortByDateDesc = <T extends { sortDate: string }>(items: T[]) =>
    [...items].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
  const chunkItems = <T,>(items: T[], size: number) => {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks;
  };
  const getSortedTags = (tags: ProjectTag[]) => sortAlphabetically(tags, (tag) => tag.label);
  const sortedSkillsData = sortAlphabetically(skillsData, (skill) => skill.title);
  const sortedTimelineData = sortByDateDesc(timelineData);
  const sortedFormationData = sortByDateDesc(formationData);
  const sortedReferencesData = sortAlphabetically(referencesData, (reference) => reference.name);
  const desktopReferencePages = chunkItems(sortedReferencesData, 6);
  const skillsCarousel = useMobileScrollDots(sortedSkillsData.length);
  const educationCarousel = useMobileScrollDots(sortedFormationData.length);
  const catalogProjects: ProjectCardData[] = [
    ...projectCatalog.map((project) =>
      project.id === 'azure-infra'
        ? {
            ...project,
            sortDate: 202502,
            title: {
              FR: 'Dashboard M365 Power BI',
              EN: 'M365 Power BI Dashboard',
            },
            companyLine: {
              FR: 'Microsoft 365 · Power BI',
              EN: 'Microsoft 365 · Power BI',
            },
            desc: {
              FR: 'Dashboard Power BI pour suivre activite, licences et risques de capacite sur un tenant M365 / Azure AD.',
              EN: 'Power BI dashboard to monitor activity, licenses, and capacity risks across a Microsoft 365 / Azure AD tenant.',
            },
            category: {
              FR: 'Cloud & BI',
              EN: 'Cloud & BI',
            },
            tags: [
              { label: 'Power BI', className: 'tb' },
              { label: 'Graph API', className: 'tb' },
              { label: 'DAX', className: 'tb' },
            ],
            background: '#24324A',
            accent: '#83B8FF',
            detailPage: true,
          }
        : project,
    ),
    {
      id: 'automate',
      sortDate: 202503,
      title: {
        FR: 'Automatisation reporting Veeam',
        EN: 'Veeam reporting automation',
      },
      companyLine: {
        FR: 'Power Platform · Outlook / Excel Online',
        EN: 'Power Platform · Outlook / Excel Online',
      },
      desc: {
        FR: 'Workflow Power Automate qui transforme les emails Veeam en reporting Excel exploitable sans saisie manuelle.',
        EN: 'Power Automate workflow that turns Veeam emails into actionable Excel reporting without manual entry.',
      },
      category: {
        FR: 'Automatisation',
        EN: 'Automation',
      },
      categoryKey: 'bi',
      tags: [
        { label: 'Power Automate', className: 'tb' },
        { label: 'Veeam', className: 'tb' },
        { label: 'Excel Online', className: 'tb' },
      ],
      background: '#273744',
      accent: '#86C6E2',
      icon: 'grid',
      detailPage: true,
    },
    {
      id: 'wisignal',
      sortDate: 202504,
      title: {
        FR: 'Simulateur couverture Wi-Fi',
        EN: 'Wi-Fi coverage simulator',
      },
      companyLine: {
        FR: 'Neemba CAT Togo · Simulation reseau',
        EN: 'Neemba CAT Togo · Network simulation',
      },
      desc: {
        FR: 'Application web autonome pour placer des bornes, modeliser les murs et visualiser une heatmap RSSI sur plan.',
        EN: 'Standalone web app to place access points, model walls, and visualize an RSSI heatmap on floor plans.',
      },
      category: {
        FR: 'Infrastructure Wi-Fi',
        EN: 'Wi-Fi Infrastructure',
      },
      categoryKey: 'infrastructure',
      tags: [
        { label: 'Wi-Fi', className: 'tt' },
        { label: 'Canvas API', className: 'tt' },
        { label: 'RSSI', className: 'tt' },
      ],
      background: '#2C3444',
      accent: '#8CC2FF',
      icon: 'signal',
      detailPage: true,
    },
    {
      id: 'printtrack',
      sortDate: 202603190811,
      title: {
        FR: 'PrintTrack',
        EN: 'PrintTrack',
      },
      companyLine: {
        FR: 'Gestion de stock impression',
        EN: 'Print supply inventory',
      },
      desc: {
        FR: "Dashboard de gestion des consommables d'impression, des couts et des alertes par departement.",
        EN: 'Dashboard for print consumables, cost tracking, and department-level alerts.',
      },
      category: {
        FR: 'Operations IT',
        EN: 'IT Operations',
      },
      categoryKey: 'bi',
      tags: [
        { label: 'React 19', className: 'tb' },
        { label: 'Recharts', className: 'tb' },
        { label: 'Inventory', className: 'tb' },
      ],
      background: '#314146',
      accent: '#8ED1C2',
      icon: 'grid',
      detailPage: true,
    },
    {
      id: 'smartprocure',
      sortDate: 202603190759,
      title: {
        FR: 'SmartProcure AI',
        EN: 'SmartProcure AI',
      },
      companyLine: {
        FR: 'Analyse fournisseurs assistee par IA',
        EN: 'AI-assisted supplier analysis',
      },
      desc: {
        FR: "Plateforme d'analyse comparative de devis fournisseurs avec extraction Gemini et moteur de recommandation.",
        EN: 'Procurement comparison platform with Gemini extraction and recommendation engine.',
      },
      category: {
        FR: 'Cloud & IA',
        EN: 'Cloud & AI',
      },
      categoryKey: 'bi',
      tags: [
        { label: 'Gemini', className: 'tb' },
        { label: 'Procurement', className: 'tb' },
        { label: 'React', className: 'tb' },
      ],
      background: '#2F3046',
      accent: '#B5A0FF',
      icon: 'cloud',
      detailPage: true,
    },
    {
      id: 'tracker',
      sortDate: 202603190814,
      title: {
        FR: 'Neemba Tracker',
        EN: 'Neemba Tracker',
      },
      companyLine: {
        FR: 'Parc IT · audits · depenses',
        EN: 'IT fleet · audits · finance',
      },
      desc: {
        FR: 'SPA metier de suivi du parc IT, des demandes, des audits et des depenses avec RBAC et Azure AD.',
        EN: 'Business SPA for IT fleet, approvals, audits, and expense tracking with RBAC and Azure AD.',
      },
      category: {
        FR: 'Infrastructure & Ops',
        EN: 'Infrastructure & Ops',
      },
      categoryKey: 'bi',
      tags: [
        { label: 'Azure AD', className: 'tt' },
        { label: 'RBAC', className: 'tt' },
        { label: 'React 19', className: 'tt' },
      ],
      background: '#273742',
      accent: '#83C1E6',
      icon: 'domain',
      detailPage: true,
    },
    {
      id: 'mfa',
      sortDate: 202603190818,
      title: {
        FR: 'MFA Ubuntu avec Google Authenticator',
        EN: 'Ubuntu MFA with Google Authenticator',
      },
      companyLine: {
        FR: 'Ubuntu 22.04+ · securite systeme',
        EN: 'Ubuntu 22.04+ · system security',
      },
      desc: {
        FR: 'Guide technique de configuration MFA sur Ubuntu avec PAM, Google Authenticator et extension aux connexions SSH.',
        EN: 'Technical guide to configure MFA on Ubuntu with PAM, Google Authenticator, and SSH integration.',
      },
      category: {
        FR: 'Cybersecurite',
        EN: 'Cybersecurity',
      },
      categoryKey: 'cybersecurity',
      tags: [
        { label: 'MFA', className: 'tc' },
        { label: 'Ubuntu', className: 'tc' },
        { label: 'PAM', className: 'tc' },
      ],
      background: '#29353B',
      accent: '#84D7B5',
      icon: 'shield',
      detailPage: true,
    },
    {
      id: 'ubuntu_ldap',
      sortDate: 202603190822,
      title: {
        FR: 'Active Directory sur Ubuntu',
        EN: 'Active Directory on Ubuntu',
      },
      companyLine: {
        FR: 'Ubuntu · Samba AD · Kerberos',
        EN: 'Ubuntu · Samba AD · Kerberos',
      },
      desc: {
        FR: "Mise en place pas a pas d'un controleur de domaine Samba/LDAP sur Ubuntu avec Kerberos et DNS integres.",
        EN: 'Step-by-step deployment of a Samba/LDAP domain controller on Ubuntu with integrated Kerberos and DNS.',
      },
      category: {
        FR: 'Linux & Identite',
        EN: 'Linux & Identity',
      },
      categoryKey: 'infrastructure',
      tags: [
        { label: 'Samba AD', className: 'tl2' },
        { label: 'Kerberos', className: 'tl2' },
        { label: 'LDAP', className: 'tl2' },
      ],
      background: '#2E3431',
      accent: '#97D7A4',
      icon: 'server',
      detailPage: true,
    },
    {
      id: 'postgresql_ssl',
      sortDate: 202503150900,
      title: {
        FR: 'PostgreSQL SSL/TLS',
        EN: 'PostgreSQL SSL/TLS',
      },
      companyLine: {
        FR: 'PostgreSQL · Windows Server · OpenSSL',
        EN: 'PostgreSQL · Windows Server · OpenSSL',
      },
      desc: {
        FR: "Configuration d'un chiffrement SSL/TLS auto-signe pour securiser les connexions PostgreSQL sous Windows Server.",
        EN: 'Auto-signed SSL/TLS setup to secure PostgreSQL connections on Windows Server.',
      },
      category: {
        FR: 'Infrastructure & Securite',
        EN: 'Infrastructure & Security',
      },
      categoryKey: 'infrastructure',
      tags: [
        { label: 'PostgreSQL', className: 'tr' },
        { label: 'SSL/TLS', className: 'tr' },
        { label: 'OpenSSL', className: 'tr' },
      ],
      background: '#263142',
      accent: '#8CB7E8',
      icon: 'shield',
      detailPage: true,
    },
  ];
  const getStructuredScreenshotItems = (
    project: ProjectCardData,
    detail: StructuredProjectData | null | undefined,
  ) =>
    detail
      ? (detail.assets.screenshots ?? [])
          .filter((path) => Boolean(path))
          .filter((path) => !/^[A-Za-z]:[\\/]/.test(path))
          .map((path) => ({
            src: /^https?:\/\//.test(path) ? path : withBaseAsset(path),
            alt: `${project.title[lang]} screenshot`,
            meta: {
              badge:
                project.id === 'siem'
                  ? lang === 'FR'
                    ? 'Projet phare'
                    : 'Featured project'
                  : project.category[lang],
              title: project.title[lang],
              companyLine: project.companyLine[lang],
              description: detail.description || detail.tagline || project.desc[lang],
              tags: project.tags.map((tag) => tag.label),
              detailLabel: lang === 'FR' ? 'Voir le détail' : 'View details',
            },
          }))
      : [];

  const catalogProjectsWithCovers = catalogProjects.map((project) => ({
    ...project,
    coverImage:
      getStructuredScreenshotItems(project, structuredProjectData[project.id])[0]?.src ?? null,
  }));

  const projectById = catalogProjectsWithCovers.reduce<Record<string, ProjectCardData>>(
    (acc, project) => {
      acc[project.id] = project;
      return acc;
    },
    {},
  );
  const recentMainProjects = [...catalogProjectsWithCovers]
    .filter((project) => project.detailPage)
    .sort((a, b) => {
      const priority = (id: string) => (id === 'siem' ? 0 : id === 'automate' ? 1 : 2);
      return priority(a.id) - priority(b.id) || b.sortDate - a.sortDate;
    })
    .slice(0, 4);
  const featuredMainProject = projectById.tracker ?? recentMainProjects[0];
  const bioExpertiseItems = sortAlphabetically(
    [
      { label: 'Windows Server', className: 'tag tr' },
      { label: 'Active Directory', className: 'tag tr' },
      { label: 'Linux / Ubuntu', className: 'tag tl2' },
      { label: 'Réseaux / VSAT', className: 'tag tt' },
      { label: 'TCP/IP · Routage', className: 'tag tt' },
      { label: 'SIEM / XDR', className: 'tag tc' },
      { label: 'Python', className: 'tag tb' },
      { label: 'Bash · PowerShell', className: 'tag tb' },
      { label: 'Power BI / DAX', className: 'tag' },
      { label: 'Azure / M365', className: 'tag' },
      { label: 'SCCM / MECM', className: 'tag' },
    ],
    (item) => item.label,
  );
  const projectFilters = [
    { key: 'all' as const, label: lang === 'FR' ? 'Tous' : 'All' },
    { key: 'cloud' as const, label: 'Cloud' },
    {
      key: 'cybersecurity' as const,
      label: lang === 'FR' ? 'Cybersécurité' : 'Cybersecurity',
    },
    {
      key: 'infrastructure' as const,
      label: lang === 'FR' ? 'Infrastructure' : 'Infrastructure',
    },
    { key: 'network' as const, label: lang === 'FR' ? 'Réseaux' : 'Networks' },
    { key: 'bi' as const, label: lang === 'FR' ? 'Pilotage & BI' : 'Management & BI' },
  ];
  const sortedProjectFilters = projectFilters;
  const activeProjectFilterLabel =
    sortedProjectFilters.find((filter) => filter.key === projectFilter)?.label ??
    sortedProjectFilters[0].label;
  const normalizedProjectSearch = projectSearch.trim().toLowerCase();
  const filteredProjects = catalogProjectsWithCovers
    .filter((project) => {
      const matchesFilter = projectFilter === 'all' || project.categoryKey === projectFilter;
      const searchableContent = [
        project.title[lang],
        project.companyLine[lang],
        project.desc[lang],
        project.category[lang],
        ...project.tags.map((tag) => tag.label),
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        !normalizedProjectSearch || searchableContent.includes(normalizedProjectSearch);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => b.sortDate - a.sortDate || alphaCollator.compare(a.title[lang], b.title[lang]));
  const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * projectsPerPage,
    projectPage * projectsPerPage,
  );
  const paginatedProjectRange =
    filteredProjects.length === 0
      ? { start: 0, end: 0 }
      : {
          start: (projectPage - 1) * projectsPerPage + 1,
          end: Math.min(projectPage * projectsPerPage, filteredProjects.length),
        };
  const projectPaginationTokens = buildPaginationTokens(projectPage, totalProjectPages);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const getScrollBehavior = () => (prefersReducedMotion ? 'auto' : 'smooth');
  const getNavOffset = () => {
    const nav = document.querySelector('.nav');

    return nav instanceof HTMLElement ? nav.getBoundingClientRect().height + 16 : 96;
  };
  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const targetTop = window.scrollY + element.getBoundingClientRect().top - getNavOffset();

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: getScrollBehavior(),
    });
  };
  const { activePage, activeSection, navigateTo, navigateToSection, setObservedSection } =
    useLocalRouting<StructuredProjectId>({
      onSectionNavigation: scrollToElement,
    });
  const isStructuredProjectId = (value: string): value is StructuredProjectId =>
    structuredProjectIds.includes(value as StructuredProjectId);

  useEffect(() => {
    if (activePage !== 'main') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isNavigableSection(entry.target.id)) {
            setObservedSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' },
    );

    const sections = document.querySelectorAll('main section');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, [activePage, setObservedSection]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio_lang', lang);
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setProjectsPerPage(getProjectsPerPage());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch, projectFilter]);

  useEffect(() => {
    setProjectPage((currentPage) => Math.min(currentPage, totalProjectPages));
  }, [totalProjectPages]);

  useEffect(() => {
    if (!isProjectFilterMenuOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        projectFilterMenuRef.current &&
        target instanceof Node &&
        !projectFilterMenuRef.current.contains(target)
      ) {
        setIsProjectFilterMenuOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isProjectFilterMenuOpen]);

  useEffect(() => {
    const syncReferenceCarousel = () => {
      if (!isMobilePeekCarousel()) {
        setReferenceCarouselOffset(0);
        return;
      }

      setReferenceCarouselOffset(
        measurePeekCarouselOffset(referenceCarouselRef.current, referenceCarouselIndex),
      );
    };

    syncReferenceCarousel();
    window.addEventListener('resize', syncReferenceCarousel);

    return () => {
      window.removeEventListener('resize', syncReferenceCarousel);
    };
  }, [referenceCarouselIndex]);

  useEffect(() => {
    const syncDetailCarousels = () => {
      if (!isMobilePeekCarousel()) {
        setDetailCarouselOffset({});
        return;
      }

      setDetailCarouselOffset((current) => {
        const next = { ...current };

        Object.keys(structuredProjectConfigs).forEach((projectId) => {
          next[projectId] = measurePeekCarouselOffset(
            detailCarouselRefs.current[projectId] ?? null,
            detailCarouselIndex[projectId] ?? 0,
          );
        });

        return next;
      });
    };

    syncDetailCarousels();
    window.addEventListener('resize', syncDetailCarousels);

    return () => {
      window.removeEventListener('resize', syncDetailCarousels);
    };
  }, [detailCarouselIndex, structuredProjectData, activePage]);

  useEffect(() => {
    setDesktopReferencePage((current) =>
      Math.min(current, Math.max(desktopReferencePages.length - 1, 0)),
    );
  }, [desktopReferencePages.length]);

  const scrollToSection = (id: string) => {
    if (!isNavigableSection(id)) {
      return;
    }

    setIsMobileMenuOpen(false);
    navigateToSection(id);
  };

  const handleDiscoverProfile = () => scrollToSection('about');
  const handleViewProjects = () => scrollToSection('projets');
  const selectProjectFilter = (filterKey: ProjectFilterKey) => {
    setProjectFilter(filterKey);
    setIsProjectFilterMenuOpen(false);
  };

  const changeProjectPage = (nextPage: number) => {
    const clampedPage = Math.max(1, Math.min(nextPage, totalProjectPages));
    setProjectPage(clampedPage);

    if (!allProjectsSectionRef.current) {
      return;
    }

    const targetTop =
      window.scrollY + allProjectsSectionRef.current.getBoundingClientRect().top - getNavOffset();

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: getScrollBehavior(),
    });
  };

  const showDetail = (id: string) => {
    if (!isDetailPage(id)) {
      return;
    }

    if (activePage === 'main' || activePage === 'all-projects') {
      projectReturnPageRef.current = activePage;
    }
    if (isStructuredProjectId(id) && !curatedStudyIds.has(id)) {
      void loadProjectDetail(id);
    }

    setDetailCarouselIndex((current) => ({
      ...current,
      [id]: 0,
    }));
    navigateTo(id);
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
  };

  const backToMain = () => {
    navigateTo('main');
    setTimeout(() => {
      scrollToElement('projets');
    }, 100);
  };

  const backFromDetail = () => {
    if (projectReturnPageRef.current === 'all-projects') {
      navigateTo('all-projects');
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
      return;
    }
    backToMain();
  };

  const stepReferenceCarousel = (direction: 1 | -1) => {
    setReferenceCarouselIndex((current) =>
      Math.max(0, Math.min(current + direction, sortedReferencesData.length - 1)),
    );
  };

  const stepDetailCarousel = (projectId: string, totalItems: number, direction: 1 | -1) => {
    setDetailCarouselIndex((current) => {
      const currentIndex = current[projectId] ?? 0;
      return {
        ...current,
        [projectId]: Math.max(0, Math.min(currentIndex + direction, totalItems - 1)),
      };
    });
  };

  const handleCarouselTouchStart = (key: string) => (event: React.TouchEvent<HTMLDivElement>) => {
    carouselTouchStartX.current[key] = event.touches[0]?.clientX ?? null;
  };

  const handleReferenceCarouselTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = carouselTouchStartX.current.references;
    const endX = event.changedTouches[0]?.clientX ?? null;
    carouselTouchStartX.current.references = null;

    if (startX === null || endX === null) {
      return;
    }

    const delta = endX - startX;
    if (Math.abs(delta) < 36) {
      return;
    }

    stepReferenceCarousel(delta < 0 ? 1 : -1);
  };

  const handleDetailCarouselTouchEnd =
    (projectId: string, totalItems: number) => (event: React.TouchEvent<HTMLDivElement>) => {
      const startX = carouselTouchStartX.current[projectId];
      const endX = event.changedTouches[0]?.clientX ?? null;
      carouselTouchStartX.current[projectId] = null;

      if (startX === null || endX === null) {
        return;
      }

      const diff = startX - endX;
      if (Math.abs(diff) <= 40) {
        return;
      }

      if (diff > 0) {
        stepDetailCarousel(projectId, totalItems, 1);
        return;
      }

      stepDetailCarousel(projectId, totalItems, -1);
    };

  const goToReferenceCard = (index: number) => {
    setReferenceCarouselIndex(index);
  };

  const renderReferenceCard = (reference: ReferenceContact) => (
    <div className="ref-card mobile-peek-item" key={reference.name}>
      <div className="ref-card-head">
        <div className="ref-av">{reference.initials}</div>
        <div className="ref-card-meta">
          <p className="ref-name">{reference.name}</p>
          <p className="ref-org">{reference.organization}</p>
        </div>
      </div>
      <div className="ref-card-body">
        <p className="ref-role">{reference.role}</p>
        <div className="ref-contact ref-contact-links">
          {reference.phones.map((phone) => (
            <a key={phone.href} className="ref-contact-link" href={phone.href}>
              {phone.display}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  const goToDetailCarouselItem = (projectId: string, index: number) => {
    setDetailCarouselIndex((current) => ({
      ...current,
      [projectId]: index,
    }));
  };

  const renderStructuredProjectPage = (projectId: string) => {
    const project = projectById[projectId];
    const config = structuredProjectConfigs[projectId];

    if (!project || !config) {
      return null;
    }

    const detail = structuredProjectData[projectId];
    const isLoading = !(projectId in structuredProjectData);
    const techStackItems = detail
      ? sortAlphabetically(
          Array.from(
            new Set<string>(
              [
                ...(detail.tech_stack.frontend ?? []),
                ...(detail.tech_stack.backend ?? []),
                ...(detail.tech_stack.database ?? []),
                ...(detail.tech_stack.devops ?? []),
                ...(detail.tech_stack.tools ?? []),
              ].filter((item): item is string => Boolean(item)),
            ),
          ),
          (item) => item,
        )
      : [];
    const keywordItems = detail
      ? sortAlphabetically(Array.from(new Set<string>(detail.keywords ?? [])), (item) => item)
      : [];
    const relatedProjects = config.relatedIds
      .map((relatedId) => projectById[relatedId])
      .filter(Boolean);
    const linkItems = detail
      ? ([
          detail.links.github
            ? {
                href: detail.links.github,
                label: 'GitHub',
              }
            : null,
          detail.links.live
            ? {
                href: detail.links.live,
                label: lang === 'FR' ? 'Lien live' : 'Live link',
              }
            : null,
        ].filter(Boolean) as { href: string; label: string }[])
      : [];
    const resourceLinks =
      config.resourceLinks?.map((link) => ({
        href: withBaseAsset(link.href),
        label: link.label[lang],
      })) ?? [];
    const allLinkItems = [...linkItems, ...resourceLinks];
    const screenshotItems = getStructuredScreenshotItems(project, detail);
    const activeScreenshotIndex = detailCarouselIndex[projectId] ?? 0;
    const screenshotPages = chunkItems(screenshotItems, 2);
    const activeScreenshotPage = Math.min(
      Math.floor(activeScreenshotIndex / 2),
      Math.max(screenshotPages.length - 1, 0),
    );
    const metaItems = [
      {
        label: lang === 'FR' ? 'Categorie' : 'Category',
        value: detail?.category || project.category[lang],
      },
      {
        label: lang === 'FR' ? 'Role' : 'Role',
        value:
          detail?.role || config.role?.[lang] || (lang === 'FR' ? 'Non precise' : 'Not specified'),
      },
      {
        label: lang === 'FR' ? 'Environnement' : 'Environment',
        value:
          config.environment?.[lang] ||
          detail?.primary_language ||
          (lang === 'FR' ? 'Non precise' : 'Not specified'),
      },
      {
        label: lang === 'FR' ? 'Statut' : 'Status',
        value:
          detail?.status ||
          config.fallbackStatus?.[lang] ||
          (lang === 'FR' ? 'Documente' : 'Documented'),
        success: Boolean(detail?.status || config.fallbackStatus),
      },
    ];

    return (
      <div
        className={`page ${activePage === projectId ? 'active' : ''}`}
        id={`page-${projectId}`}
        key={projectId}
      >
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
          <button type="button" className="nav-back nav-control-btn" onClick={backFromDetail}>
            {lang === 'FR' ? '← Retour aux projets' : '← Back to projects'}
          </button>
          <div className="nav-tag">{project.category[lang]}</div>
        </nav>
        <div className="sec">
          <div className="det-hero">
            <div className="det-vis" style={{ background: project.background }}>
              {screenshotItems.length ? (
                <button
                  type="button"
                  className="det-vis-media-btn"
                  onClick={() => openProjectImageLightbox(screenshotItems, 0)}
                  aria-label={
                    lang === 'FR'
                      ? `Afficher l'image de couverture du projet ${project.title.FR}`
                      : `View the cover image of the ${project.title.EN} project`
                  }
                >
                  <img
                    className="det-vis-media"
                    src={screenshotItems[0].src}
                    alt={screenshotItems[0].alt}
                    loading="lazy"
                  />
                </button>
              ) : (
                renderProjectIcon(project.icon, project.accent)
              )}
            </div>
            <div>
              <p className="det-eye">{project.companyLine[lang]}</p>
              <h1 className="det-title">{project.title[lang]}</h1>
              <p className="det-co">{config.client[lang]}</p>
              <p className="det-desc">{detail?.tagline ?? project.desc[lang]}</p>
              <div className="det-meta">
                {metaItems.map((item) => (
                  <div className="dm" key={`${projectId}-${item.label}`}>
                    <small>{item.label}</small>
                    <p style={item.success ? { color: '#4CAF7D' } : undefined}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="det-body">
            <div>
              <div className="blk">
                <h3 className="blk-ttl">{lang === 'FR' ? "Vue d'ensemble" : 'Overview'}</h3>
                <p>{detail?.description ?? project.desc[lang]}</p>
              </div>
              <div className="blk">
                <h3 className="blk-ttl">
                  {lang === 'FR' ? 'Fonctionnalites cles' : 'Key features'}
                </h3>
                {detail?.features?.length ? (
                  <ul className="steps">
                    {detail.features.map((feature) => (
                      <li key={`${projectId}-${feature}`}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {isLoading
                      ? lang === 'FR'
                        ? 'Synchronisation des details en cours...'
                        : 'Syncing project details...'
                      : lang === 'FR'
                        ? 'Aucune fonctionnalite detaillee pour le moment.'
                        : 'No detailed features available yet.'}
                  </p>
                )}
              </div>
              {detail?.challenges ? (
                <div className="blk">
                  <h3 className="blk-ttl">
                    {lang === 'FR' ? 'Defis traites' : 'Challenges addressed'}
                  </h3>
                  <p>{detail.challenges}</p>
                </div>
              ) : null}
              {screenshotItems.length ? (
                <div className="blk">
                  <h3 className="blk-ttl">
                    {lang === 'FR' ? 'Captures projet' : 'Project screenshots'}
                  </h3>
                  <div className="detail-shot-desktop-carousel">
                    <div
                      className="detail-shot-desktop-track"
                      style={{ transform: `translateX(-${activeScreenshotPage * 100}%)` }}
                    >
                      {screenshotPages.map((page, pageIndex) => (
                        <div
                          className="detail-shot-desktop-page"
                          key={`${projectId}-shot-page-${pageIndex + 1}`}
                        >
                          <div className="detail-shot-grid detail-shot-grid-desktop">
                            {page.map((shot, index) => {
                              const absoluteIndex = pageIndex * 2 + index;

                              return (
                                <button
                                  key={`${projectId}-shot-desktop-${absoluteIndex + 1}`}
                                  type="button"
                                  className="detail-shot-card"
                                  onClick={() =>
                                    openProjectImageLightbox(screenshotItems, absoluteIndex)
                                  }
                                  aria-label={
                                    lang === 'FR'
                                      ? `Afficher la capture ${absoluteIndex + 1} du projet ${project.title.FR}`
                                      : `View screenshot ${absoluteIndex + 1} of the ${project.title.EN} project`
                                  }
                                >
                                  <img
                                    className="detail-shot-image"
                                    src={shot.src}
                                    alt={`${shot.alt} ${absoluteIndex + 1}`}
                                    loading="lazy"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="detail-shot-carousel-shell detail-shot-mobile-carousel"
                    ref={(node) => {
                      detailCarouselRefs.current[projectId] = node;
                    }}
                    onTouchStart={handleCarouselTouchStart(projectId)}
                    onTouchEnd={handleDetailCarouselTouchEnd(projectId, screenshotItems.length)}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div
                      className="detail-shot-grid mobile-peek-track"
                      style={{
                        transform: `translateX(-${detailCarouselOffset[projectId] ?? 0}px)`,
                      }}
                    >
                      {screenshotItems.map((shot, index) => (
                        <button
                          key={`${projectId}-shot-${index + 1}`}
                          type="button"
                          className="detail-shot-card mobile-peek-item"
                          onClick={() => openProjectImageLightbox(screenshotItems, index)}
                          aria-label={
                            lang === 'FR'
                              ? `Afficher la capture ${index + 1} du projet ${project.title.FR}`
                              : `View screenshot ${index + 1} of the ${project.title.EN} project`
                          }
                        >
                          <img
                            className="detail-shot-image"
                            src={shot.src}
                            alt={`${shot.alt} ${index + 1}`}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  {screenshotItems.length > 1 ? (
                    <div
                      className="carousel-dots detail-shot-dots"
                      aria-label={
                        lang === 'FR'
                          ? 'Position dans les captures projet'
                          : 'Project screenshots position'
                      }
                    >
                      {(isMobilePeekCarousel() ? screenshotItems : screenshotPages).map(
                        (shot, index) => (
                          <button
                            key={`${projectId}-shot-dot-${index + 1}`}
                            type="button"
                            className={`carousel-dot ${
                              isMobilePeekCarousel()
                                ? activeScreenshotIndex === index
                                : activeScreenshotPage === index
                                  ? 'active'
                                  : ''
                            }`}
                            onClick={() =>
                              goToDetailCarouselItem(
                                projectId,
                                isMobilePeekCarousel() ? index : index * 2,
                              )
                            }
                            aria-label={
                              lang === 'FR'
                                ? `Voir la capture ${index + 1}`
                                : `View screenshot ${index + 1}`
                            }
                            aria-current={
                              isMobilePeekCarousel()
                                ? activeScreenshotIndex === index
                                  ? 'true'
                                  : undefined
                                : activeScreenshotPage === index
                                  ? 'true'
                                  : undefined
                            }
                          />
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {detail?.learnings ? (
                <div className="blk">
                  <h3 className="blk-ttl">{lang === 'FR' ? 'Apprentissages' : 'Key learnings'}</h3>
                  <p>{detail.learnings}</p>
                </div>
              ) : null}
            </div>
            <div>
              <div className="sb-blk">
                <div className="sb-lbl">{lang === 'FR' ? 'Technologies' : 'Technologies'}</div>
                {techStackItems.length ? (
                  <div className="tags" style={{ gap: '0.375rem' }}>
                    {techStackItems.map((item) => (
                      <span className="tag" key={`${projectId}-tech-${item}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="detail-empty-copy">
                    {lang === 'FR'
                      ? 'Les technologies de ce projet seront détaillées prochainement.'
                      : 'A detailed technology overview will be available soon.'}
                  </p>
                )}
              </div>
              <div className="sb-blk">
                <div className="sb-lbl">{lang === 'FR' ? 'Mots-cles' : 'Keywords'}</div>
                {keywordItems.length ? (
                  <div className="tags" style={{ gap: '0.375rem' }}>
                    {keywordItems.map((item) => (
                      <span className="tag" key={`${projectId}-keyword-${item}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="detail-empty-copy">
                    {lang === 'FR' ? 'Aucun mot-cle supplementaire.' : 'No additional keywords.'}
                  </p>
                )}
              </div>
              <div className="sb-blk">
                <div className="sb-lbl">{lang === 'FR' ? 'Liens utiles' : 'Useful links'}</div>
                {allLinkItems.length ? (
                  <div className="detail-link-group">
                    {allLinkItems.map((link) => (
                      <a
                        key={`${projectId}-${link.label}`}
                        href={link.href}
                        className="kp-btn-line detail-link-btn"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="detail-empty-copy">
                    {lang === 'FR'
                      ? 'Une présentation plus détaillée est disponible sur demande.'
                      : 'A more detailed presentation is available on request.'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rel">
            <h3>{lang === 'FR' ? 'Projets similaires' : 'Related projects'}</h3>
            <div className="rel-grid" style={{ marginTop: '1rem' }}>
              {relatedProjects.map((relatedProject) => (
                <button
                  key={`${projectId}-related-${relatedProject.id}`}
                  type="button"
                  className="rel-card card-action"
                  onClick={() => showDetail(relatedProject.id)}
                  aria-label={
                    lang === 'FR'
                      ? `Voir le projet ${relatedProject.title.FR}`
                      : `View the ${relatedProject.title.EN} project`
                  }
                >
                  <h4>{relatedProject.title[lang]}</h4>
                  <p>{relatedProject.companyLine[lang]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Footer lang={lang} onNavigate={scrollToSection} />
      </div>
    );
  };

  const homePage = (
    <>
      {/* ====== MAIN PAGE ====== */}
      {activePage === 'main' && (
        <HomePage
          lang={lang}
          v={v}
          activeSection={activeSection}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          scrollToSection={scrollToSection}
          onDiscoverProfile={handleDiscoverProfile}
          onViewProjects={handleViewProjects}
          onViewBiography={() => showDetail('biography')}
          skillsSectionSubtitle={getSectionSubcopy(typedSections.skills)}
          educationSection={educationSection}
          referencesSection={referencesSection}
          sortedSkillsData={sortedSkillsData}
          sortedTimelineData={sortedTimelineData}
          sortedFormationData={sortedFormationData}
          sortedReferencesData={sortedReferencesData}
          desktopReferencePages={desktopReferencePages}
          desktopReferencePage={desktopReferencePage}
          setDesktopReferencePage={setDesktopReferencePage}
          referenceCarouselRef={referenceCarouselRef}
          referenceCarouselIndex={referenceCarouselIndex}
          referenceCarouselOffset={referenceCarouselOffset}
          handleCarouselTouchStart={handleCarouselTouchStart}
          handleReferenceCarouselTouchEnd={handleReferenceCarouselTouchEnd}
          goToReferenceCard={goToReferenceCard}
          featuredMainProject={featuredMainProject}
          recentMainProjects={recentMainProjects}
          onProjectClick={showDetail}
          onViewAllProjects={() => {
            setProjectPage(1);
            navigateTo('all-projects');
            window.scrollTo({ top: 0, behavior: getScrollBehavior() });
          }}
          skillsCarousel={skillsCarousel}
          educationCarousel={educationCarousel}
        />
      )}
    </>
  );

  const detailPages = (
    <Suspense fallback={null}>
      {curatedStudyIds.has(activePage) && projectById[activePage] && (
        <CaseStudyPage
          project={projectById[activePage]}
          lang={lang}
          onBack={backFromDetail}
          onNavigate={scrollToSection}
          onProject={showDetail}
          related={['tracker', 'siem', 'automate', 'moov', 'orabank', 'biasa']
            .filter((id) => id !== activePage)
            .slice(0, 2)
            .map((id) => projectById[id])}
        />
      )}
      {activePage in structuredProjectConfigs &&
        !curatedStudyIds.has(activePage) &&
        renderStructuredProjectPage(activePage)}
    </Suspense>
  );

  const biographyPage = (
    <>
      {/* BIOGRAPHIE */}
      <Suspense fallback={null}>
        {activePage === 'biography' && (
          <BiographyPage
            lang={lang}
            bioExpertiseItems={bioExpertiseItems}
            scrollToSection={scrollToSection}
          />
        )}
      </Suspense>
    </>
  );

  const projectsPage = (
    <>
      {/* ====== ALL PROJECTS PAGE ====== */}
      <Suspense fallback={null}>
        {activePage === 'all-projects' && (
          <ProjectsPage
            lang={lang}
            activeProjectFilterLabel={activeProjectFilterLabel}
            allProjectsSectionRef={allProjectsSectionRef}
            isProjectFilterMenuOpen={isProjectFilterMenuOpen}
            projectFilterMenuRef={projectFilterMenuRef}
            projectSearch={projectSearch}
            setProjectSearch={setProjectSearch}
            sortedProjectFilters={sortedProjectFilters}
            projectFilter={projectFilter}
            selectProjectFilter={selectProjectFilter}
            setIsProjectFilterMenuOpen={setIsProjectFilterMenuOpen}
            paginatedProjectRange={paginatedProjectRange}
            filteredProjects={filteredProjects}
            paginatedProjects={paginatedProjects}
            projectPaginationTokens={projectPaginationTokens}
            projectPage={projectPage}
            totalProjectPages={totalProjectPages}
            changeProjectPage={changeProjectPage}
            renderProjectIcon={renderProjectIcon}
            getSortedTags={getSortedTags}
            showDetail={showDetail}
            backToMain={backToMain}
            scrollToSection={scrollToSection}
          />
        )}
      </Suspense>
    </>
  );

  const content = (
    <div className="app" id="app">
      {homePage}
      {detailPages}
      {biographyPage}
      {projectsPage}
      <Suspense fallback={null}>
        <ProjectDetailLightbox
          lightbox={projectImageLightbox}
          onClose={closeProjectImageLightbox}
          onStep={stepProjectImageLightbox}
          onGoTo={goToProjectImageLightbox}
        />
      </Suspense>
    </div>
  );

  return {
    content,
    lang,
    setLang,
    isLightboxOpen: Boolean(projectImageLightbox),
  };
};

export default usePortfolioModel;
