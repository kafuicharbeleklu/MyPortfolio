import React from 'react';
import type { Language } from './translations';

export const getSkillsData = (lang: Language) => [
  {
    title: lang === 'FR' ? 'Cybersécurité' : 'Cybersecurity',
    desc:
      lang === 'FR'
        ? 'Wazuh SIEM/XDR, détection d’intrusion, audit sécurité et politiques de protection proactive.'
        : 'Wazuh SIEM/XDR, intrusion detection, security auditing, and proactive protection policies.',
    bg: '#EDE0D4',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L20 6V12C20 17 16 20 12 22C8 20 4 17 4 12V6L12 2Z"
          stroke="#A0603A"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="12" cy="12" r="3" stroke="#A0603A" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  {
    title: lang === 'FR' ? 'Systèmes' : 'Systems',
    desc:
      lang === 'FR'
        ? 'Windows Server, Active Directory, GPO, SCCM/MECM, Ubuntu Server et maintenance du parc IT.'
        : 'Windows Server, Active Directory, GPO, SCCM/MECM, Ubuntu Server, and IT fleet maintenance.',
    bg: '#D8E8F0',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="2"
          y="4"
          width="20"
          height="6"
          rx="1"
          stroke="#3A7A8E"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="2"
          y="14"
          width="20"
          height="6"
          rx="1"
          stroke="#3A7A8E"
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="19" cy="7" r="1.2" fill="#3A7A8E" />
      </svg>
    ),
  },
  {
    title: lang === 'FR' ? 'Réseaux' : 'Networks',
    desc:
      lang === 'FR'
        ? 'TCP/IP, routage, switching, VSAT/ARCEP, protocoles réseau, GNS3/EVE-NG et supervision.'
        : 'TCP/IP, routing, switching, VSAT/ARCEP, network protocols, GNS3/EVE-NG, and monitoring.',
    bg: '#D8EEE4',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#2E7055" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="5" stroke="#2E7055" strokeWidth="1" fill="none" />
        <circle cx="12" cy="12" r="2" fill="#2E7055" opacity=".6" />
      </svg>
    ),
  },
  {
    title: lang === 'FR' ? 'Pilotage & BI' : 'Management & BI',
    desc:
      lang === 'FR'
        ? 'Power BI, DAX, CMDB, Matrix42, Veeam, pilotage budget IT et reporting de performance.'
        : 'Power BI, DAX, CMDB, Matrix42, Veeam, IT budget steering, and performance reporting.',
    bg: '#E4E0F0',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="16" width="4" height="5" rx="1" fill="#5A4A90" opacity=".8" />
        <rect x="10" y="11" width="4" height="10" rx="1" fill="#5A4A90" opacity=".6" />
        <rect x="17" y="6" width="4" height="15" rx="1" fill="#5A4A90" opacity=".4" />
      </svg>
    ),
  },
  {
    title: lang === 'FR' ? 'Scripting & IA' : 'Scripting & AI',
    desc:
      lang === 'FR'
        ? 'Bash, PowerShell, Python, Power Automate, automatisation et usages concrets de l’IA générative.'
        : 'Bash, PowerShell, Python, Power Automate, automation, and practical use of generative AI.',
    bg: '#EEE0D8',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="4,17 9,12 13,15 20,7" stroke="#A0603A" strokeWidth="1.5" fill="none" />
        <circle cx="4" cy="17" r="1.5" fill="#A0603A" />
        <circle cx="20" cy="7" r="1.5" fill="#A0603A" />
      </svg>
    ),
  },
  {
    title: lang === 'FR' ? 'Cloud & virtualisation' : 'Cloud & virtualization',
    desc:
      lang === 'FR'
        ? 'Microsoft Azure, Microsoft 365, solutions hybrides et infrastructure virtualisée.'
        : 'Microsoft Azure, Microsoft 365, hybrid solutions, and virtualized infrastructure.',
    bg: '#D8E4EE',
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 8 Q12 4 20 8 Q12 12 4 8Z" stroke="#185FA5" strokeWidth="1.2" fill="none" />
        <path d="M4 12 Q12 8 20 12" stroke="#185FA5" strokeWidth="1" fill="none" />
        <path d="M4 16 Q12 12 20 16" stroke="#185FA5" strokeWidth=".8" fill="none" />
      </svg>
    ),
  },
];

const timelineMonthLabels = {
  FR: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avr.',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const;

const formatTimelineRange = (start: string, end: string | null, lang: Language) => {
  const [startYear, startMonth] = start.split('-').map(Number);
  const startLabel = `${timelineMonthLabels[lang][startMonth - 1]} ${startYear}`;

  if (!end) {
    return `${startLabel} - ${lang === 'FR' ? 'Présent' : 'Present'}`;
  }

  const [endYear, endMonth] = end.split('-').map(Number);
  const endLabel = `${timelineMonthLabels[lang][endMonth - 1]} ${endYear}`;

  return `${startLabel} - ${endLabel}`;
};

const formatTimelineDuration = (start: string, end: string | null, lang: Language) => {
  const [startYear, startMonth] = start.split('-').map(Number);
  const today = new Date();
  const endYear = end ? Number(end.split('-')[0]) : today.getFullYear();
  const endMonth = end ? Number(end.split('-')[1]) : today.getMonth() + 1;
  const totalMonths = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (lang === 'FR') {
    if (years && months) return `${years} an${years > 1 ? 's' : ''} ${months} mois`;
    if (years) return `${years} an${years > 1 ? 's' : ''}`;
    return `${months} mois`;
  }

  if (years && months)
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  if (years) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${months} mo${months > 1 ? 's' : ''}`;
};

export const getTimelineData = (lang: Language) => [
  {
    sortDate: '2023-08-01',
    date: formatTimelineRange('2023-08', null, lang),
    duration: formatTimelineDuration('2023-08', null, lang),
    title:
      lang === 'FR'
        ? 'Administrateur Digital Workplace & Infrastructure'
        : 'Digital Workplace & Infrastructure Administrator',
    company: 'Neemba Togo',
    desc:
      lang === 'FR'
        ? 'Préparation du budget IT, pilotage de la portabilité réseau mobile, supervision VSAT, support N2/N3 et optimisation des usages grâce à l’automatisation et à l’IA.'
        : 'IT budget planning, mobile network portability coordination, VSAT monitoring, L2/L3 support, and usage optimization through automation and AI.',
    isCurrent: true,
  },
  {
    sortDate: '2023-05-01',
    date: formatTimelineRange('2023-05', '2023-08', lang),
    duration: formatTimelineDuration('2023-05', '2023-08', lang),
    title: lang === 'FR' ? 'Technicien informatique (stage)' : 'IT Technician (Internship)',
    company: 'Neemba Togo',
    desc:
      lang === 'FR'
        ? 'Déploiement complet de Wazuh SIEM/XDR, maintenance du parc informatique et surveillance continue des performances réseau.'
        : 'Full Wazuh SIEM/XDR deployment, IT fleet maintenance, and continuous network performance monitoring.',
    isCurrent: false,
  },
  {
    sortDate: '2022-06-01',
    date: formatTimelineRange('2022-06', '2022-10', lang),
    duration: formatTimelineDuration('2022-06', '2022-10', lang),
    title:
      lang === 'FR'
        ? 'Technicien support & système (stage)'
        : 'Systems & Support Technician (Internship)',
    company: 'Orabank Togo',
    desc:
      lang === 'FR'
        ? 'Installation d’un contrôleur de domaine Windows Server, configuration de solutions métiers et support N2/N3 sur l’ensemble des agences.'
        : 'Windows Server domain controller deployment, business solution configuration, and L2/L3 support across all branches.',
    isCurrent: false,
  },
  {
    sortDate: '2021-09-01',
    date: formatTimelineRange('2021-09', '2021-09', lang),
    duration: formatTimelineDuration('2021-09', '2021-09', lang),
    title: lang === 'FR' ? 'Technicien informatique (stage)' : 'IT Technician (Internship)',
    company: 'Clinique BIASA',
    desc:
      lang === 'FR'
        ? 'Assistance utilisateurs et mise en place de services réseau sous Ubuntu Server : DNS, DHCP, Apache et NAT.'
        : 'User support and deployment of Ubuntu Server network services including DNS, DHCP, Apache, and NAT.',
    isCurrent: false,
  },
];

export const getFormationData = (lang: Language) => [
  {
    sortDate: '2025-12-01',
    year: '2024 - 2025',
    title: lang === 'FR' ? 'Master II Professionnel' : 'Professional Master II',
    school:
      lang === 'FR'
        ? 'Collège de Paris Supérieur · Lomé<br />Réseaux & Systèmes d’Information'
        : 'Collège de Paris Supérieur · Lomé<br />Information Systems & Networks',
    gradeNode: (
      <div className="edu-grade">
        <big>15,07</big>
        <span>/ 20 · {lang === 'FR' ? 'Mention bien' : 'With honors'}</span>
      </div>
    ),
  },
  {
    sortDate: '2023-12-01',
    year: '2022 - 2023',
    title: lang === 'FR' ? 'Licence Professionnelle' : 'Professional Bachelor',
    school:
      lang === 'FR'
        ? 'IAI-TOGO · Institut Africain d’Informatique<br />Administration Système & Réseau'
        : 'IAI-TOGO · African Institute of Computer Science<br />Systems & Network Administration',
    gradeNode: (
      <p className="edu-check">✓ {lang === 'FR' ? 'Diplôme obtenu' : 'Degree obtained'}</p>
    ),
  },
];
