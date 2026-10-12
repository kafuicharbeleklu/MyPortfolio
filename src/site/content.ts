import type { Language } from '../translations';

export type LS = Record<Language, string>;

// ---- Periods: dates are stored as ISO ("2023-05", or "2023" for a year); the labels and the
// durations are computed, so the reader always sees how long something lasted.

const monthNames: Record<Language, string[]> = {
  FR: [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ],
  EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const parts = (iso: string) => iso.split('-').map(Number) as [number, number | undefined];

/** "2023-05" reads "mai 2023"; "2023" reads "2023". */
const dateLabel = (iso: string, lang: Language) => {
  const [year, month] = parts(iso);
  return month ? `${monthNames[lang][month - 1]} ${year}` : String(year);
};

/** "mai 2023 à aujourd’hui", "juin à oct. 2022", "2020 à 2023", "sept. 2021". */
export const formatPeriod = (start: string, end: string | null, lang: Language) => {
  const from = dateLabel(start, lang);
  if (end === null) {
    return lang === 'FR' ? `${from} à aujourd’hui` : `${from} to present`;
  }
  if (end === start) {
    return from;
  }
  const [startYear, startMonth] = parts(start);
  const [endYear, endMonth] = parts(end);
  // same year, both with a month: the year is written once
  if (startMonth && endMonth && startYear === endYear) {
    const months = monthNames[lang];
    return lang === 'FR'
      ? `${months[startMonth - 1]} à ${months[endMonth - 1]} ${startYear}`
      : `${months[startMonth - 1]} to ${months[endMonth - 1]} ${startYear}`;
  }
  const to = dateLabel(end, lang);
  return lang === 'FR' ? `${from} à ${to}` : `${from} to ${to}`;
};

/**
 * How long a period lasted: whole months, both ends included ("3 ans 6 mois"), or whole years
 * when the dates carry no month ("2 ans"). An open period ends today. Empty when it is not
 * meaningful (a single year).
 */
export const formatDuration = (
  start: string,
  end: string | null,
  lang: Language,
  today: Date = new Date(),
) => {
  const [startYear, startMonth] = parts(start);
  const endIso = end ?? `${today.getFullYear()}-${today.getMonth() + 1}`;
  const [endYear, endMonth] = parts(endIso);
  const plural = (count: number, fr: [string, string], en: [string, string]) =>
    lang === 'FR'
      ? `${count} ${count > 1 ? fr[1] : fr[0]}`
      : `${count} ${count > 1 ? en[1] : en[0]}`;

  if (!startMonth || !endMonth) {
    const years = endYear - startYear;
    return years > 0 ? plural(years, ['an', 'ans'], ['year', 'years']) : '';
  }

  const months = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = years ? plural(years, ['an', 'ans'], ['year', 'years']) : '';
  const monthPart = rest ? plural(rest, ['mois', 'mois'], ['month', 'months']) : '';
  return [yearPart, monthPart].filter(Boolean).join(' ');
};

/** Whole years since a date: the experience counter of the profile. */
export const yearsSince = (start: string, today: Date = new Date()) => {
  const [year, month] = parts(start);
  const months = (today.getFullYear() - year) * 12 + (today.getMonth() + 1 - (month ?? 1));
  return Math.max(0, Math.floor(months / 12));
};

/** Period and duration on one line: "mai 2023 à aujourd’hui · 3 ans 6 mois". */
export const formatSpan = (start: string, end: string | null, lang: Language) =>
  [formatPeriod(start, end, lang), formatDuration(start, end, lang)].filter(Boolean).join(' · ');

// The five scenes of the home page, in order; education lives inside "parcours", the references
// inside "contact".
export const sectionIds = ['profil', 'expertise', 'realisations', 'parcours', 'contact'] as const;
export type SectionId = (typeof sectionIds)[number];

export const contact = {
  email: 'charbelkafuieklu@gmail.com',
  phoneDisplay: '+228 70 66 42 25',
  phoneHref: 'tel:+22870664225',
  linkedIn: 'https://www.linkedin.com/in/kafui-charbel-eklu',
  linkedInLabel: 'kafui-charbel-eklu',
  github: 'https://github.com/kafuicharbeleklu',
  githubLabel: 'kafuicharbeleklu',
};

export const ui = {
  nav: {
    profil: { FR: 'Profil', EN: 'Profile' },
    expertise: { FR: 'Expertise', EN: 'Expertise' },
    realisations: { FR: 'Réalisations', EN: 'Selected work' },
    parcours: { FR: 'Parcours', EN: 'Experience' },
    contact: { FR: 'Contact', EN: 'Contact' },
  } satisfies Record<SectionId, LS>,
  education: { FR: 'Formation & langues', EN: 'Education & languages' },
  languageGroup: { FR: 'Langue', EN: 'Language' },
  menu: { FR: 'Menu', EN: 'Menu' },
  theme: { FR: 'Thème', EN: 'Theme' },
  darkTheme: { FR: 'Thème sombre', EN: 'Dark theme' },
  close: { FR: 'Fermer', EN: 'Close' },
  sections: { FR: 'Sections', EN: 'Sections' },
  siteTitle: {
    FR: 'Réseaux, systèmes & cybersécurité',
    EN: 'Networks, systems & cybersecurity',
  },
  role: {
    FR: 'Technicien informatique\u00a0· réseaux, systèmes & cybersécurité',
    EN: 'IT Technician\u00a0· networks, systems & cybersecurity',
  },
  posterTitle: {
    FR: ['Infrastructure', 'fiable', 'et sécurisée'],
    EN: ['Infrastructure', 'reliable', 'and secure'],
  } satisfies Record<Language, [string, string, string]>,
  posterNote: {
    FR: 'Je suis EKLU Kafui Charbel, technicien informatique chez Neemba Togo. J’administre les systèmes et les réseaux, et je veille à leur sécurité.',
    EN: 'I’m Kafui Charbel EKLU, an IT technician at Neemba Togo. I administer systems and networks, and look after their security.',
  },
  // the door out of the poster: stacked labels above the Lomé clock
  enterLines: {
    FR: ['Entrer', 'dans le site'],
    EN: ['Enter', 'the site'],
  } satisfies Record<Language, string[]>,
  clockPlace: 'Lomé',
  enter: { FR: 'Entrer dans le site', EN: 'Enter the site' },
  cv: { FR: 'Télécharger mon CV', EN: 'Download my CV' },
  seeWork: { FR: 'Voir mes réalisations', EN: 'See my work' },
  showSummary: { FR: 'Afficher le résumé', EN: 'Show summary' },
  hideSummary: { FR: 'Masquer le résumé', EN: 'Hide summary' },
  contactMe: { FR: 'Me contacter', EN: 'Get in touch' },
  cardKicker: { FR: 'En bref', EN: 'At a glance' },
  cardTitle: { FR: 'Mon profil en bref', EN: 'My profile at a glance' },
  statement: {
    FR: ['Je suis ', 'EKLU Kafui Charbel', ', technicien informatique à Lomé.'],
    EN: ['I’m ', 'Kafui Charbel EKLU', ', an IT technician based in Lomé.'],
  } satisfies Record<Language, [string, string, string]>,
  profile: {
    FR: [
      'Depuis mai 2023, je travaille chez Neemba Togo, concessionnaire Caterpillar. Je gère l’infrastructure informatique et j’accompagne les utilisateurs. J’y ai notamment déployé Wazuh pour centraliser la surveillance de sécurité.',
      'Je m’occupe aussi du budget IT, des fournisseurs et du parc informatique. Avec Power BI et mes outils internes, je facilite le suivi et les tâches du quotidien. Je fais le lien avec la DSI groupe et j’encadre une stagiaire.',
      'Titulaire d’un Master en Réseaux et Systèmes d’Information, je souhaite évoluer vers la gouvernance et la cybersécurité. Mon mémoire portait sur l’intégration de l’IA à un SIEM : un sujet que je prolonge dans mes projets personnels.',
    ],
    EN: [
      'Since May 2023, I’ve worked at Neemba Togo, a Caterpillar dealer. I manage the IT infrastructure and support users. I also deployed Wazuh to centralise security monitoring.',
      'I oversee the IT budget, vendors and assets. Through Power BI and internal tools, I make reporting and everyday tasks easier. I liaise with group IT and supervise an intern.',
      'I hold a Master’s in Networks and Information Systems and want to develop my career in IT governance and cybersecurity. My thesis explored integrating AI into a SIEM, a topic I continue to explore through personal projects.',
    ],
  } satisfies Record<Language, string[]>,
  portraitAlt: {
    FR: 'Kafui Charbel Eklu, portrait en studio',
    EN: 'Kafui Charbel Eklu, studio portrait',
  },
  portraitCaption: {
    FR: 'Kafui Charbel Eklu · Lomé',
    EN: 'Kafui Charbel Eklu · Lomé',
  },
  profilLine: {
    FR: 'Faisons connaissance.',
    EN: 'A little about me.',
  },
  figures: {
    experience: { FR: 'd’expérience', EN: 'of experience' },
    domains: { FR: 'domaines', EN: 'areas' },
    references: { FR: 'références', EN: 'references' },
  },
  approachTitle: { FR: 'Ce qui me guide', EN: 'What guides me' },
  expertiseTitle: { FR: 'Ce que je sais faire.', EN: 'What I can do.' },
  workTitle: {
    FR: ['Ce que j’ai ', 'réalisé.'],
    EN: ['What I’ve ', 'built.'],
  } satisfies Record<Language, [string, string]>,
  caseNeed: { FR: 'Le besoin', EN: 'The need' },
  caseDone: { FR: 'Ce que j’ai fait', EN: 'What I did' },
  caseResult: { FR: 'Le résultat', EN: 'The result' },
  allProjectsCta: { FR: 'Voir tous mes projets', EN: 'See all my projects' },
  pathTitle: { FR: 'Mon parcours, étape par étape.', EN: 'My experience, step by step.' },
  contactTitle: {
    FR: ['Un projet, une question ?', 'Échangeons.'],
    EN: ['A project or a question?', 'Let’s talk.'],
  } satisfies Record<Language, [string, string]>,
  references: { FR: 'Références', EN: 'References' },
  referencesTitle: {
    FR: 'Mes références professionnelles',
    EN: 'My professional references',
  },
  referencesNote: {
    FR: 'Je peux vous transmettre leurs coordonnées sur demande.',
    EN: 'I can share their contact details on request.',
  },
  phone: { FR: 'Téléphone', EN: 'Phone' },
  based: { FR: 'Basé à', EN: 'Based in' },
  basedValue: { FR: 'Lomé, Togo\u00a0· GMT+0', EN: 'Lomé, Togo\u00a0· GMT+0' },
  top: { FR: 'Haut de page ↑', EN: 'Back to top ↑' },
  footerNav: { FR: 'Plan du site', EN: 'Site map' },
  depthStudy: { FR: 'Étude de cas', EN: 'Case study' },
  depthSheet: { FR: 'Fiche technique', EN: 'Technical sheet' },
  back: { FR: 'Retour à l’accueil', EN: 'Back to home' },
  backToProjects: { FR: 'Toutes les réalisations', EN: 'All projects' },
  viewProject: { FR: 'Voir la page du projet', EN: 'Open the project page' },
  projectsKicker: { FR: 'Réalisations', EN: 'Projects' },
  projectsTitle: {
    FR: ['Tous mes projets,', 'du réseau à l’application.'],
    EN: ['All my projects,', 'from network to application.'],
  } satisfies Record<Language, [string, string]>,
  projectsSub: {
    FR: 'Je partage ici mes missions, mes applications et mes guides techniques. Chaque projet raconte un besoin, mon approche et le résultat.',
    EN: 'Here I share my work assignments, applications and technical guides. Each project covers a need, my approach and the result.',
  },
  projectsEnd: {
    FR: ['Un de ces projets', 'vous parle ?'],
    EN: ['One of these projects', 'speaks to you?'],
  } satisfies Record<Language, [string, string]>,
  write: { FR: 'M’écrire', EN: 'Email me' },
};

export const featuredNote = (count: number): LS => ({
  FR: `Trois projets parmi ${count}.`,
  EN: `Three projects out of ${count}.`,
});

export const projectCount = (count: number): LS => ({
  FR: count > 1 ? `${count} projets` : `${count} projet`,
  EN: count > 1 ? `${count} projects` : `${count} project`,
});

export const measurements: { label: LS; value: LS }[] = [
  {
    label: { FR: 'Formation', EN: 'Field' },
    value: { FR: 'Réseaux et Systèmes d’Information', EN: 'Networks and Information Systems' },
  },
  {
    label: { FR: 'En poste', EN: 'Current' },
    value: {
      FR: 'Neemba Togo (concessionnaire Caterpillar), depuis mai 2023',
      EN: 'Neemba Togo (Caterpillar dealer), since May 2023',
    },
  },
  {
    label: { FR: 'Diplôme', EN: 'Degree' },
    value: {
      FR: 'Master, mention Bien · équivalence évaluée par WES (Canada)',
      EN: 'Master’s, with honours · WES-assessed equivalency (Canada)',
    },
  },
  {
    label: { FR: 'Cap', EN: 'Heading' },
    value: {
      FR: 'Gouvernance et sécurité des systèmes d’information',
      EN: 'IT governance and security',
    },
  },
  {
    label: { FR: 'Langues', EN: 'Languages' },
    value: {
      FR: 'Français C2 à l’oral · Anglais B2',
      EN: 'French C2 speaking · English B2',
    },
  },
  {
    label: { FR: 'Base', EN: 'Base' },
    value: {
      FR: 'Lomé, Togo · mobilité internationale',
      EN: 'Lomé, Togo · open to relocation',
    },
  },
  {
    label: { FR: 'En dehors du travail', EN: 'Off duty' },
    value: {
      FR: 'Musique (gospel, classique), dessin, basketball',
      EN: 'Music (gospel, classical), drawing, basketball',
    },
  },
];

// Three working principles, written in the first person.
export const approach: { title: LS; desc: LS }[] = [
  {
    title: {
      FR: 'Prévenir plutôt que réparer',
      EN: 'Prevent rather than repair',
    },
    desc: {
      FR: 'J’intègre la sécurité dès la conception et je surveille les systèmes pour repérer les incidents au plus tôt.',
      EN: 'I consider security from the start and monitor systems to detect incidents early.',
    },
  },
  {
    title: {
      FR: 'Garder la maîtrise',
      EN: 'Stay in control',
    },
    desc: {
      FR: 'Je cherche la cause d’une panne, j’interviens avec méthode et je tire les leçons de chaque incident.',
      EN: 'I look for the cause of an outage, work methodically and learn from each incident.',
    },
  },
  {
    title: {
      FR: 'Apprendre sans relâche',
      EN: 'Keep learning',
    },
    desc: {
      FR: 'Je me forme, je reste en veille et je mets mes connaissances en pratique dans mes projets personnels.',
      EN: 'I keep learning, follow developments in my field and apply my knowledge through personal projects.',
    },
  },
];

export const skills: { title: LS; desc: LS; tags: string[] }[] = [
  {
    title: { FR: 'Cybersécurité', EN: 'Cybersecurity' },
    desc: {
      FR: 'Je surveille les événements de sécurité avec Wazuh et je gère les accès, les pare-feu et les sauvegardes. Je suis formé à ISO 27001 et à l’analyse des risques.',
      EN: 'I monitor security events with Wazuh and manage access, firewalls and backups. My training covers ISO 27001 and risk analysis.',
    },
    tags: ['Wazuh', 'SIEM / XDR', 'Veeam', 'ISO 27001'],
  },
  {
    title: { FR: 'Systèmes & virtualisation', EN: 'Systems & virtualisation' },
    desc: {
      FR: 'J’administre Windows Server, Active Directory et Linux. Je travaille avec VMware et Hyper-V pour maintenir les services disponibles.',
      EN: 'I administer Windows Server, Active Directory and Linux. I work with VMware and Hyper-V to keep services available.',
    },
    tags: ['Windows Server', 'Active Directory', 'VMware ESXi', 'Hyper-V', 'Linux'],
  },
  {
    title: { FR: 'Réseaux', EN: 'Networks' },
    desc: {
      FR: 'Je gère les réseaux locaux, les liaisons Internet et VSAT, ainsi que les accès VPN. Je teste mes architectures avec GNS3 et EVE-NG.',
      EN: 'I manage local networks, internet and VSAT links, and VPN access. I test network designs with GNS3 and EVE-NG.',
    },
    tags: ['LAN', 'VPN', 'VSAT', 'GNS3', 'EVE-NG'],
  },
  {
    title: { FR: 'Cloud', EN: 'Cloud' },
    desc: {
      FR: 'J’administre les identités, les licences et les services Microsoft 365 et Azure. Je possède aussi des notions d’AWS.',
      EN: 'I administer identities, licences and services in Microsoft 365 and Azure. I also have foundational knowledge of AWS.',
    },
    tags: ['Azure', 'Microsoft 365', 'Azure AD', 'AWS'],
  },
  {
    title: { FR: 'Automatisation & IA', EN: 'Automation & AI' },
    desc: {
      FR: 'J’automatise les tâches avec PowerShell, Bash, Python et Power Automate. J’utilise aussi l’IA pour développer mes outils et explorer l’analyse des journaux de sécurité.',
      EN: 'I automate tasks with PowerShell, Bash, Python and Power Automate. I also use AI to develop tools and explore security log analysis.',
    },
    tags: ['PowerShell', 'Bash', 'Python', 'Power Automate', 'Claude Code'],
  },
  {
    title: { FR: 'Pilotage & gouvernance', EN: 'Management & governance' },
    desc: {
      FR: 'Je m’occupe du budget IT, des fournisseurs et du parc informatique. Je construis des tableaux de bord Power BI, avec une formation en gouvernance des SI et gestion de projet.',
      EN: 'I oversee the IT budget, vendors and assets. I build Power BI dashboards, with training in IT governance and project management.',
    },
    tags: ['Power BI', 'Matrix42', 'COBIT', 'CAPM'],
  },
];

export type CaseStudy = {
  id: string;
  title: LS;
  org: string;
  context: LS;
  steps: Record<Language, string[]>;
  result: LS;
};

export const featuredCases: CaseStudy[] = [
  {
    id: 'siem',
    title: { FR: 'SIEM / XDR Wazuh', EN: 'Wazuh SIEM / XDR' },
    org: 'Neemba Togo',
    context: {
      FR: 'Chez Neemba Togo, je devais réunir les événements de sécurité du parc pour faciliter leur analyse et la réponse aux incidents.',
      EN: 'At Neemba Togo, I needed to bring security events together to make analysis and incident response easier.',
    },
    steps: {
      FR: [
        'J’ai recensé les équipements et les journaux à surveiller.',
        'J’ai installé Wazuh et déployé les agents Windows et Linux.',
        'J’ai adapté les règles de détection et les réponses automatiques.',
        'J’ai organisé les alertes et accompagné l’équipe dans leur analyse.',
      ],
      EN: [
        'I inventoried the devices and logs to monitor.',
        'I installed Wazuh and deployed Windows and Linux agents.',
        'I tuned detection rules and automated responses.',
        'I organised alerts and helped the team analyse them.',
      ],
    },
    result: {
      FR: 'J’ai donné à l’équipe IT une vue centralisée des événements de sécurité. Mon mémoire de Master a prolongé ce travail avec l’IA appliquée aux journaux.',
      EN: 'I gave the IT team a central view of security events. My Master’s thesis extended this work with AI applied to logs.',
    },
  },
  {
    id: 'moov',
    title: { FR: 'Portabilité Moov → Togocom', EN: 'Moov → Togocom porting' },
    org: 'Neemba Togo',
    context: {
      FR: 'Je devais coordonner le changement d’opérateur de la flotte mobile en préservant les communications de l’entreprise.',
      EN: 'I needed to coordinate the mobile fleet’s operator change while maintaining business communications.',
    },
    steps: {
      FR: [
        'J’ai recensé les lignes et leurs usages.',
        'J’ai fixé le calendrier avec les deux opérateurs.',
        'J’ai surveillé les liaisons pendant la transition.',
        'J’ai contrôlé le service et documenté la bascule.',
      ],
      EN: [
        'I inventoried the lines and their uses.',
        'I agreed the schedule with both operators.',
        'I monitored the links during the transition.',
        'I checked service quality and documented the switchover.',
      ],
    },
    result: {
      FR: 'J’ai mené une bascule coordonnée, vérifiée et documentée avec les équipes et les opérateurs.',
      EN: 'I completed a coordinated, checked and documented switchover with the teams and operators.',
    },
  },
  {
    id: 'orabank',
    title: { FR: 'Contrôleur de domaine', EN: 'Domain controller' },
    org: 'Orabank Togo',
    context: {
      FR: 'Pendant mon stage, je devais centraliser les comptes, les postes et les mises à jour, avec un accès distant sécurisé.',
      EN: 'During my internship, I needed to centralise accounts, workstations and updates, with secure remote access.',
    },
    steps: {
      FR: [
        'J’ai installé Windows Server et Active Directory.',
        'J’ai configuré les GPO et le partage de fichiers DFS.',
        'J’ai déployé WSUS, DHCP, WDS et l’accès VPN.',
        'J’ai aussi déployé les services de transfert d’argent et assuré le support N2/N3.',
      ],
      EN: [
        'I installed Windows Server and Active Directory.',
        'I configured GPOs and DFS file sharing.',
        'I deployed WSUS, DHCP, WDS and VPN access.',
        'I also deployed money transfer services and provided L2/L3 support.',
      ],
    },
    result: {
      FR: 'J’ai mené le projet de l’installation à l’accès distant, en apprenant à respecter les exigences d’un environnement bancaire.',
      EN: 'I carried the project from installation to remote access while learning to meet banking requirements.',
    },
  },
];

export const jobs: { start: string; end: string | null; title: LS; org: LS; desc: LS }[] = [
  {
    start: '2023-05',
    end: null,
    title: { FR: 'Technicien informatique', EN: 'IT Technician' },
    org: {
      FR: 'Neemba Togo (ex-Togo Équipements) · concessionnaire Caterpillar',
      EN: 'Neemba Togo (formerly Togo Équipements) · Caterpillar dealer',
    },
    desc: {
      FR: 'Je gère les systèmes, le réseau et la sécurité de la filiale, où j’ai déployé Wazuh. Je suis également le budget IT, les fournisseurs et le reporting Power BI. Je coordonne les sujets infrastructure avec la DSI groupe, assure le support N2/N3 et encadre une stagiaire.',
      EN: 'I manage the subsidiary’s systems, network and security, including my Wazuh deployment. I also oversee the IT budget, vendors and Power BI reporting. I coordinate infrastructure matters with group IT, provide L2/L3 support and supervise an intern.',
    },
  },
  {
    start: '2022-06',
    end: '2022-10',
    title: {
      FR: 'Technicien support & système (stage)',
      EN: 'Support & Systems Technician (internship)',
    },
    org: { FR: 'Orabank Togo', EN: 'Orabank Togo' },
    desc: {
      FR: 'J’ai mis en place un contrôleur de domaine Windows Server et un accès VPN sécurisé. J’ai aussi participé au déploiement de Western Union, MoneyGram et RIA, et assuré le support N2/N3.',
      EN: 'I set up a Windows Server domain controller and secure VPN access. I also helped deploy Western Union, MoneyGram and RIA, and provided L2/L3 support.',
    },
  },
  {
    start: '2021-09',
    end: '2021-09',
    title: { FR: 'Technicien informatique (stage)', EN: 'IT Technician (internship)' },
    org: { FR: 'Clinique BIASA', EN: 'BIASA Clinic' },
    desc: {
      FR: 'J’ai installé les services DNS, DHCP, Apache et NAT sous Ubuntu Server et accompagné les utilisateurs.',
      EN: 'I set up DNS, DHCP, Apache and NAT services on Ubuntu Server and supported users.',
    },
  },
];

export const education: {
  start?: string;
  end?: string | null;
  /** rows without dates, such as the languages */
  period?: LS;
  title: LS;
  school: LS;
  grade: LS;
}[] = [
  {
    start: '2023',
    end: '2025',
    title: { FR: 'Master professionnel', EN: 'Professional Master’s degree' },
    school: {
      FR: 'Réseaux & Systèmes d’Information · Collège de Paris Supérieur, Lomé. Gouvernance des SI (COBIT), contrôle interne et risques IT, ISO 27001, audit de sécurité (EBIOS, MEHARI), Business Intelligence, gestion de projet (CAPM).',
      EN: 'Networks & Information Systems · Collège de Paris Supérieur, Lomé. IT governance (COBIT), internal control and IT risk, ISO 27001, security auditing (EBIOS, MEHARI), business intelligence, project management (CAPM).',
    },
    grade: {
      FR: 'Mention Bien, 15,07/20 · mémoire : intégration d’un modèle d’IA dans un SIEM',
      EN: 'With honours, 15.07/20 · thesis: integrating an AI model into a SIEM',
    },
  },
  {
    start: '2025',
    end: '2025',
    title: {
      FR: 'Titre de Manager Opérationnel d’Activités',
      EN: 'Operational Activities Manager title',
    },
    school: { FR: 'Ascencia Business School, France', EN: 'Ascencia Business School, France' },
    grade: {
      FR: 'Équivalence Master évaluée par WES (Canada, 2026)',
      EN: 'Assessed as a Master’s degree by WES (Canada, 2026)',
    },
  },
  {
    start: '2020',
    end: '2023',
    title: {
      FR: 'Ingénieur des Travaux Informatiques',
      EN: 'Computer Engineering Technician diploma',
    },
    school: {
      FR: 'Administration des Systèmes et Réseaux · IAI-Togo',
      EN: 'Systems & Network Administration · IAI-Togo',
    },
    grade: {
      FR: 'Bac+3 reconnu CAMES · mention Assez Bien',
      EN: 'Bac+3, CAMES-accredited · with merit',
    },
  },
  {
    period: { FR: 'Langues', EN: 'Languages' },
    title: { FR: 'Français · Anglais', EN: 'French · English' },
    school: {
      FR: 'TEF Canada 2026 : C2 à l’oral, C1 en compréhension, B2 à l’écrit',
      EN: 'TEF Canada 2026: C2 speaking, C1 listening and reading, B2 writing',
    },
    grade: { FR: 'Anglais B2, usage professionnel', EN: 'English B2, professional use' },
  },
];

export type ProjectFamily = 'infra' | 'apps' | 'data' | 'guides';

export const projectFamilies: { key: 'all' | ProjectFamily; label: LS }[] = [
  { key: 'all', label: { FR: 'Tous', EN: 'All' } },
  { key: 'infra', label: { FR: 'Infrastructure & sécurité', EN: 'Infrastructure & security' } },
  { key: 'apps', label: { FR: 'Applications', EN: 'Applications' } },
  { key: 'data', label: { FR: 'Données & automatisation', EN: 'Data & automation' } },
  { key: 'guides', label: { FR: 'Guides techniques', EN: 'Technical guides' } },
];

const guideOrg: LS = {
  FR: 'Guide technique\u00a0· projet personnel',
  EN: 'Technical guide\u00a0· personal project',
};
const guideCat: LS = { FR: 'Guide technique', EN: 'Technical guide' };
const businessApp: LS = { FR: 'Application métier', EN: 'Business application' };
const same = (value: string): LS => ({ FR: value, EN: value });

export const projects: {
  id: string;
  family: ProjectFamily;
  /** year of delivery, or of the latest work for a project still in progress */
  year: number;
  title: LS;
  org: LS;
  category: LS;
  desc: LS;
  tags: string[];
}[] = [
  {
    id: 'siem',
    family: 'infra',
    year: 2024,
    title: { FR: 'Déploiement SIEM / XDR Wazuh', EN: 'Wazuh SIEM / XDR deployment' },
    org: same('Neemba Togo'),
    category: { FR: 'Cybersécurité', EN: 'Cybersecurity' },
    desc: {
      FR: 'J’ai déployé Wazuh pour centraliser la surveillance du parc et automatiser certaines réponses aux incidents.',
      EN: 'I deployed Wazuh to centralise fleet monitoring and automate selected incident responses.',
    },
    tags: ['Wazuh', 'Linux', 'SIEM / XDR'],
  },
  {
    id: 'moov',
    family: 'infra',
    year: 2024,
    title: {
      FR: 'Portabilité de la flotte mobile, Moov vers Togocom',
      EN: 'Mobile fleet porting, Moov to Togocom',
    },
    org: same('Neemba Togo'),
    category: { FR: 'Télécom', EN: 'Telecom' },
    desc: {
      FR: 'J’ai coordonné le passage de la flotte mobile de Moov à Togocom, du recensement des lignes au contrôle après la bascule.',
      EN: 'I coordinated the mobile fleet’s move from Moov to Togocom, from line inventory to checks after the switchover.',
    },
    tags: ['Télécom', 'Migration', 'VSAT'],
  },
  {
    id: 'orabank',
    family: 'infra',
    year: 2022,
    title: { FR: 'Contrôleur de domaine Windows Server', EN: 'Windows Server domain controller' },
    org: { FR: 'Orabank Togo\u00a0· stage 2022', EN: 'Orabank Togo\u00a0· internship 2022' },
    category: { FR: 'Systèmes', EN: 'Systems' },
    desc: {
      FR: 'J’ai installé un contrôleur de domaine Windows Server et un accès VPN sécurisé pendant mon stage à Orabank.',
      EN: 'I installed a Windows Server domain controller and secure VPN access during my Orabank internship.',
    },
    tags: ['Windows Server', 'Active Directory', 'GPO', 'VPN'],
  },
  {
    id: 'biasa',
    family: 'infra',
    year: 2021,
    title: { FR: 'Services réseau sous Linux', EN: 'Linux network services' },
    org: { FR: 'Clinique BIASA\u00a0· stage 2021', EN: 'BIASA Clinic\u00a0· internship 2021' },
    category: { FR: 'Réseaux', EN: 'Networks' },
    desc: {
      FR: 'J’ai configuré les services réseau de la clinique sous Ubuntu Server : DNS, DHCP, Apache et NAT.',
      EN: 'I configured the clinic’s network services on Ubuntu Server: DNS, DHCP, Apache and NAT.',
    },
    tags: ['Ubuntu Server', 'DNS', 'DHCP', 'Apache'],
  },
  {
    id: 'lan-wan',
    family: 'infra',
    year: 2022,
    title: {
      FR: 'Architecture réseau LAN / WAN multi-sites',
      EN: 'Multi-site LAN / WAN architecture',
    },
    org: { FR: 'Projet académique\u00a0· 2022', EN: 'Academic project\u00a0· 2022' },
    category: { FR: 'Réseaux', EN: 'Networks' },
    desc: {
      FR: 'J’ai conçu et simulé un réseau d’entreprise multisite sous GNS3 dans le cadre d’un projet académique.',
      EN: 'I designed and simulated a multi-site enterprise network in GNS3 for an academic project.',
    },
    tags: ['Cisco', 'GNS3'],
  },
  {
    id: 'archivage',
    family: 'infra',
    year: 2026,
    title: { FR: 'Archivage numérique du site', EN: 'Digital archiving of the site' },
    org: { FR: 'Neemba Togo · en cours', EN: 'Neemba Togo · in progress' },
    category: { FR: 'Gestion documentaire', EN: 'Document management' },
    desc: {
      FR: 'Je mène la numérisation et le classement des archives du site pour faciliter leur consultation et leur protection.',
      EN: 'I’m leading the digitisation and filing of the site’s archives to make them easier to access and protect.',
    },
    tags: ['Gestion documentaire', 'Microsoft 365'],
  },
  {
    id: 'tracker',
    family: 'apps',
    year: 2026,
    title: same('Neemba Tracker'),
    org: {
      FR: 'Application interne\u00a0· en cours',
      EN: 'Internal application\u00a0· in progress',
    },
    category: businessApp,
    desc: {
      FR: 'Je développe Neemba Tracker pour réunir le suivi du parc IT, les demandes, les approbations et les audits.',
      EN: 'I’m developing Neemba Tracker to bring IT asset tracking, requests, approvals and audits together.',
    },
    tags: ['React', 'TypeScript', 'Azure AD / MSAL', 'Node.js'],
  },
  {
    id: 'wisignal',
    family: 'apps',
    year: 2025,
    title: { FR: 'Simulateur de couverture Wi-Fi', EN: 'Wi-Fi coverage simulator' },
    org: same('Neemba Togo'),
    category: businessApp,
    desc: {
      FR: 'J’ai conçu un simulateur pour comparer la couverture Wi-Fi sur plan avant de déployer les points d’accès.',
      EN: 'I built a simulator to compare Wi-Fi coverage on a site plan before deploying access points.',
    },
    tags: ['JavaScript', 'Canvas API'],
  },
  {
    id: 'printtrack',
    family: 'apps',
    year: 2026,
    title: same('PrintTrack'),
    org: { FR: 'Application interne\u00a0· MVP', EN: 'Internal application\u00a0· MVP' },
    category: businessApp,
    desc: {
      FR: 'J’ai développé PrintTrack pour suivre les achats, les affectations et les stocks de consommables d’impression.',
      EN: 'I developed PrintTrack to track purchases, allocations and stocks of printing consumables.',
    },
    tags: ['React', 'TypeScript', 'Recharts'],
  },
  {
    id: 'smartprocure',
    family: 'apps',
    year: 2026,
    title: same('SmartProcure AI'),
    org: { FR: 'Projet personnel\u00a0· MVP', EN: 'Personal project\u00a0· MVP' },
    category: { FR: 'Application & IA', EN: 'Application & AI' },
    desc: {
      FR: 'J’ai créé un outil qui extrait les données des devis avec l’IA pour faciliter la comparaison des offres fournisseurs.',
      EN: 'I created a tool that uses AI to extract quote data and make supplier offers easier to compare.',
    },
    tags: ['React', 'Gemini API', 'jsPDF'],
  },
  {
    id: 'azure-infra',
    family: 'data',
    year: 2023,
    title: { FR: 'Tableau de bord Microsoft 365', EN: 'Microsoft 365 dashboard' },
    org: same('Microsoft 365 / Azure AD'),
    category: { FR: 'Données & reporting', EN: 'Data & reporting' },
    desc: {
      FR: 'J’ai construit un tableau de bord Power BI pour suivre les utilisateurs et les licences Microsoft 365 à partir de Microsoft Graph.',
      EN: 'I built a Power BI dashboard to track Microsoft 365 users and licences using Microsoft Graph.',
    },
    tags: ['Power BI', 'Graph API', 'DAX', 'Power Query'],
  },
  {
    id: 'automate',
    family: 'data',
    year: 2025,
    title: { FR: 'Reporting des sauvegardes Veeam', EN: 'Veeam backup reporting' },
    org: same('Microsoft 365'),
    category: { FR: 'Automatisation', EN: 'Automation' },
    desc: {
      FR: 'J’ai automatisé le suivi des sauvegardes Veeam : les notifications email alimentent un tableau Excel, sans ressaisie.',
      EN: 'I automated Veeam backup reporting: email notifications feed an Excel table without manual re-entry.',
    },
    tags: ['Power Automate', 'Veeam', 'Excel Online', 'Outlook'],
  },
  {
    id: 'mfa',
    family: 'guides',
    year: 2025,
    title: {
      FR: 'Authentification multifacteur sur Ubuntu',
      EN: 'Multi-factor authentication on Ubuntu',
    },
    org: guideOrg,
    category: guideCat,
    desc: {
      FR: 'J’explique pas à pas comment activer le MFA sur Ubuntu, y compris pour les accès SSH.',
      EN: 'I explain how to enable MFA on Ubuntu step by step, including SSH access.',
    },
    tags: ['Ubuntu', 'PAM', 'OpenSSH'],
  },
  {
    id: 'ubuntu_ldap',
    family: 'guides',
    year: 2024,
    title: {
      FR: 'Active Directory sur Ubuntu avec Samba',
      EN: 'Active Directory on Ubuntu with Samba',
    },
    org: guideOrg,
    category: guideCat,
    desc: {
      FR: 'Je détaille la mise en place d’un domaine Samba sur Ubuntu, avec Kerberos, DNS et intégration des clients.',
      EN: 'I walk through setting up a Samba domain on Ubuntu, with Kerberos, DNS and client integration.',
    },
    tags: ['Samba AD', 'Kerberos', 'DNS'],
  },
  {
    id: 'postgresql_ssl',
    family: 'guides',
    year: 2025,
    title: { FR: 'PostgreSQL chiffré en SSL/TLS', EN: 'PostgreSQL encrypted with SSL/TLS' },
    org: guideOrg,
    category: guideCat,
    desc: {
      FR: 'Je documente le chiffrement SSL/TLS de PostgreSQL sous Windows Server 2022 et la configuration des accès.',
      EN: 'I document PostgreSQL SSL/TLS encryption on Windows Server 2022 and access configuration.',
    },
    tags: ['PostgreSQL', 'Windows Server 2022', 'OpenSSL'],
  },
];

export const projectDataPaths: Record<string, string> = {
  automate: 'projects/automate/projects_data.json',
  'azure-infra': 'projects/azure-infra/projects_data.json',
  wisignal: 'projects/wisignal/projects_data.json',
  printtrack: 'projects/printtrack/projects_data.json',
  smartprocure: 'projects/smartprocure/projects_data.json',
  tracker: 'projects/tracker/projects_data.json',
  mfa: 'projects/mfa/projects_data.json',
  ubuntu_ldap: 'projects/ubuntu_ldap/projects_data.json',
  postgresql_ssl: 'projects/postgresql_ssl/projects_data.json',
};

const pdfReport: LS = { FR: 'Rapport PDF', EN: 'PDF report' };

// Projects shown as related at the end of a page (the written studies may name their own).
export const projectRelated: Record<string, string[]> = {
  automate: ['azure-infra', 'siem'],
  'azure-infra': ['automate', 'wisignal'],
  wisignal: ['moov', 'azure-infra'],
  printtrack: ['tracker', 'smartprocure'],
  smartprocure: ['printtrack', 'tracker'],
  tracker: ['printtrack', 'smartprocure'],
  mfa: ['siem', 'ubuntu_ldap'],
  ubuntu_ldap: ['mfa', 'postgresql_ssl'],
  postgresql_ssl: ['ubuntu_ldap', 'mfa'],
  'lan-wan': ['biasa', 'orabank'],
};

export const projectResources: Record<string, { href: string; label: LS }[]> = {
  mfa: [{ href: 'projects/mfa/exports/rapport_mfa.pdf', label: pdfReport }],
  ubuntu_ldap: [{ href: 'projects/ubuntu_ldap/exports/rapport_ldap.pdf', label: pdfReport }],
};

export const detailUi = {
  context: { FR: 'Cadre', EN: 'Context' },
  role: { FR: 'Rôle', EN: 'Role' },
  environment: { FR: 'Environnement', EN: 'Environment' },
  links: { FR: 'Liens', EN: 'Links' },
  demo: { FR: 'Démonstration', EN: 'Demo' },
  live: { FR: 'Version en ligne', EN: 'Live version' },
  decision: { FR: 'La décision clé', EN: 'The key decision' },
  overview: { FR: 'En détail', EN: 'In detail' },
  features: { FR: 'Ce que fait le projet', EN: 'What the project does' },
  stack: { FR: 'Technologies', EN: 'Technologies' },
  stackGroups: {
    frontend: { FR: 'Interface', EN: 'Front end' },
    backend: { FR: 'Serveur', EN: 'Back end' },
    database: { FR: 'Données', EN: 'Data' },
    devops: { FR: 'Déploiement', EN: 'Deployment' },
    tools: { FR: 'Outils', EN: 'Tools' },
  } satisfies Record<string, LS>,
  period: { FR: 'Période', EN: 'Period' },
  status: { FR: 'Statut', EN: 'Status' },
  timeline: { FR: 'Chronologie', EN: 'Timeline' },
  results: { FR: 'Résultats', EN: 'Results' },
  related: { FR: 'Projets liés', EN: 'Related projects' },
  challenges: { FR: 'Les difficultés', EN: 'The challenges' },
  learnings: { FR: 'Ce que j’en retiens', EN: 'What I took from it' },
  frenchOnly: {
    FR: 'Notes détaillées rédigées en français.',
    EN: 'The English version of these notes could not be loaded; they are shown in French.',
  },
  loading: { FR: 'Chargement du détail…', EN: 'Loading details…' },
  unavailable: {
    FR: 'Le détail de ce projet n’a pas pu être chargé.',
    EN: 'The details for this project could not be loaded.',
  },
  notFound: { FR: 'Projet introuvable.', EN: 'Project not found.' },
  otherProjects: { FR: 'Autres projets', EN: 'Other projects' },
  previous: { FR: 'Projet précédent', EN: 'Previous project' },
  next: { FR: 'Projet suivant', EN: 'Next project' },
  endTitle: {
    FR: ['Envie d’en savoir plus', 'sur ce projet ?'],
    EN: ['Want to know more', 'about this project?'],
  } satisfies Record<Language, [string, string]>,
};

// Phone numbers are deliberately left out: they belong to other people.
export const references: { name: string; role: LS; organization: LS }[] = [
  {
    name: 'Afi KOSSI',
    role: { FR: 'Coordinatrice SSE Bénin et Togo', EN: 'HSE Coordinator, Benin and Togo' },
    organization: { FR: 'Direction SSE', EN: 'HSE Department' },
  },
  {
    name: 'Alfred Noel DEGBE',
    role: { FR: 'Ingénieur support informatique', EN: 'IT Support Engineer' },
    organization: same('Groupe Orabank'),
  },
  {
    name: 'Ange KOBLAN',
    role: { FR: 'Responsable régional support IT', EN: 'Regional IT Support Manager' },
    organization: {
      FR: 'Finance Afrique\u00a0· Hub Abidjan',
      EN: 'Finance Afrique\u00a0· Abidjan hub',
    },
  },
  {
    name: 'Ankou KOUNTA',
    role: { FR: 'Responsable logistique', EN: 'Logistics Manager' },
    organization: { FR: 'Logistique', EN: 'Logistics' },
  },
  {
    name: 'Baboyime MAEBENA',
    role: { FR: 'Responsable RH Bénin', EN: 'HR Manager, Benin' },
    organization: { FR: 'Ressources humaines', EN: 'Human Resources' },
  },
  {
    name: 'Desire Francois SAVADOGO',
    role: { FR: 'Expert systèmes et réseaux', EN: 'Systems and Network Expert' },
    organization: {
      FR: 'DSI\u00a0· Support & opérations',
      EN: 'IT Department\u00a0· Support & operations',
    },
  },
  {
    name: 'El Djiba Kolon DIALLO',
    role: {
      FR: 'Chef de projet, administrateur systèmes et réseaux',
      EN: 'Project Manager, Systems and Network Administrator',
    },
    organization: {
      FR: 'DSI\u00a0· Support & opérations',
      EN: 'IT Department\u00a0· Support & operations',
    },
  },
  {
    name: 'Jerome KPETO',
    role: { FR: 'Responsable des systèmes d’information', EN: 'Information Systems Manager' },
    organization: same('Coris Bank International Togo'),
  },
  {
    name: 'Ousseni NAITE',
    role: { FR: 'Responsable GRC', EN: 'GRC Manager' },
    organization: {
      FR: 'DSI\u00a0· Cybersécurité, GRC',
      EN: 'IT Department\u00a0· Cybersecurity, GRC',
    },
  },
  {
    name: 'Yan NYAKU',
    role: { FR: 'Directeur des systèmes d’information', EN: 'Chief Information Officer' },
    organization: same('CFAO Mobility Togo'),
  },
];
