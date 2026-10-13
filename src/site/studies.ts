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
  'it-filiales': {
    start: '2024-12',
    end: '2025-04',
    environment: 'Power BI · Excel · DSI du groupe',
    technologies: ['Power BI', 'DAX', 'Power Query', 'Excel'],
    related: ['azure-infra', 'rh-groupe'],
    FR: {
      role: 'Conception et réalisation du tableau de bord',
      context:
        'Après la tournée du CIO dans les filiales, les comités de direction demandaient plus de visibilité sur l’activité informatique et un suivi rigoureux du parc.',
      steps: [
        'J’ai identifié les besoins et les indicateurs avec la DSI.',
        'J’ai conçu le prototype\u00a0: parc d’ordinateurs et de téléphones, SIM, incidents et SLA, liaisons Internet, sécurité, budget et projets.',
        'J’ai intégré les retours du CIO et des directions de filiales.',
        'J’ai mis en production la version finale et automatisé les flux de données.',
      ],
      result:
        'Chaque filiale lit l’activité de son service informatique sur un même tableau de bord, avec des indicateurs comparables.',
      timeline: [
        { date: '2024-12', label: 'Besoins et indicateurs' },
        { date: '2025-02', label: 'Prototype' },
        { date: '2025-03', label: 'Validation par le CIO et les directions de filiales' },
        { date: '2025-04', label: 'Mise en production' },
      ],
      metrics: [
        {
          label: 'Domaines suivis',
          value: '8',
          note: 'parc, téléphones, SIM, incidents, Internet, sécurité, budget, projets',
        },
      ],
    },
    EN: {
      role: 'Dashboard design and build',
      context:
        'After the CIO’s tour of the subsidiaries, their executive committees asked for more visibility on IT activity and a rigorous follow-up of the fleet.',
      steps: [
        'I identified the needs and the indicators with group IT.',
        'I designed the prototype: computer and phone fleets, SIM cards, incidents and SLA, internet links, security, budget and projects.',
        'I integrated the feedback of the CIO and the subsidiaries’ management.',
        'I put the final version in production and automated the data flows.',
      ],
      result:
        'Each subsidiary reads its IT department’s activity on one dashboard, with comparable indicators.',
      timeline: [
        { date: '2024-12', label: 'Needs and indicators' },
        { date: '2025-02', label: 'Prototype' },
        { date: '2025-03', label: 'Validated by the CIO and the subsidiaries’ management' },
        { date: '2025-04', label: 'In production' },
      ],
      metrics: [
        {
          label: 'Areas tracked',
          value: '8',
          note: 'fleet, phones, SIM, incidents, internet, security, budget, projects',
        },
      ],
    },
  },
  'azure-infra': {
    start: '2026-03',
    end: '2026-07',
    environment: 'Power BI · Microsoft 365 · Python',
    technologies: ['Power BI', 'DAX', 'Power Query', 'Python'],
    related: ['it-filiales', 'automate'],
    FR: {
      role: 'Modèle de données, mesures et visuels',
      context:
        'La direction voulait savoir si le tenant Microsoft 365 avait assez de licences, s’il en payait d’inutiles et quels comptes vérifier.',
      steps: [
        'J’ai modélisé les utilisateurs, les produits, les affectations et l’activité du tenant.',
        'J’ai construit quatre pages\u00a0: analyse des licences, vue d’ensemble, analyse et détail utilisateur, avec des filtres par pays, service, produit et type de licence.',
        'J’ai qualifié les comptes à vérifier\u00a0: inactifs, jamais connectés, désactivés, techniques.',
        'J’ai tenu un journal d’audit et de corrections, et écrit un outil Python qui produit le reporting à partir des exports.',
      ],
      result:
        'Les licences à risque et les licences gaspillées se lisent en un filtre\u00a0; les comptes à nettoyer sont listés avant tout nouvel achat.',
      timeline: [
        { date: '2026-03', label: 'Import du projet, ergonomie et mesures DAX' },
        { date: '2026-04', label: 'Infobulles, signets et mesures harmonisés' },
        { date: '2026-07', label: 'Modèle sémantique mis à jour, outil de reporting' },
      ],
      metrics: [
        { label: 'Corrections documentées', value: '117', note: 'de mars à avril 2026' },
        { label: 'Pages', value: '4' },
      ],
    },
    EN: {
      role: 'Data model, measures and visuals',
      context:
        'Management wanted to know whether the Microsoft 365 tenant had enough licences, whether it paid for unused ones, and which accounts to check.',
      steps: [
        'I modelled the tenant’s users, products, assignments and activity.',
        'I built four pages: licence analysis, overview, user analysis and user detail, with filters by country, department, product and licence type.',
        'I qualified the accounts to check: inactive, never signed in, disabled, technical.',
        'I kept an audit and fix log, and wrote a Python tool that produces the reporting from the exports.',
      ],
      result:
        'Licences at risk and wasted licences read in one filter; the accounts to clean up are listed before any new purchase.',
      timeline: [
        { date: '2026-03', label: 'Project import, UX and DAX measures' },
        { date: '2026-04', label: 'Tooltips, bookmarks and measures harmonised' },
        { date: '2026-07', label: 'Semantic model updated, reporting tool' },
      ],
      metrics: [
        { label: 'Documented fixes', value: '117', note: 'from March to April 2026' },
        { label: 'Pages', value: '4' },
      ],
    },
  },
  'rh-groupe': {
    start: '2026-04',
    end: '2026-04',
    environment: 'Power BI · Excel',
    technologies: ['Power BI', 'DAX', 'Excel'],
    related: ['academy', 'it-filiales'],
    FR: {
      role: 'Modèle de collecte et tableau de bord',
      context:
        'Le groupe voulait une lecture commune des ressources humaines de ses onze filiales, à partir d’une collecte homogène.',
      steps: [
        'J’ai conçu le modèle de collecte Excel 2026, son guide de remplissage et le document de passation.',
        'J’ai aligné le modèle sémantique sur les nouvelles tables\u00a0: effectifs, embauches, départs, absences, formation, masse salariale, recrutement.',
        'J’ai relié les faits aux dimensions (filiale, contrat, sexe, nationalité, motifs) et étendu le calendrier.',
        'J’ai migré les visuels des pages Overview, HR Performance, carte et TCDP, et ajouté le filtre par filiale.',
      ],
      result:
        'Un tableau de bord multi-filiales alimenté par un modèle de collecte unique, prêt à basculer sur SharePoint.',
      metrics: [{ label: 'Filiales', value: '11' }],
    },
    EN: {
      role: 'Collection template and dashboard',
      context:
        'The group wanted a shared reading of the human resources of its eleven subsidiaries, from a uniform collection.',
      steps: [
        'I designed the 2026 Excel collection template, its filling guide and the handover document.',
        'I aligned the semantic model on the new tables: headcount, hires, departures, absences, training, payroll, recruitment.',
        'I linked facts to dimensions (subsidiary, contract, gender, nationality, reasons) and extended the calendar.',
        'I migrated the visuals of the Overview, HR Performance, map and TCDP pages, and added the subsidiary filter.',
      ],
      result:
        'A multi-subsidiary dashboard fed by a single collection template, ready to switch to SharePoint.',
      metrics: [{ label: 'Subsidiaries', value: '11' }],
    },
  },
  'finance-guinee': {
    start: '2026-03',
    end: '2026-03',
    environment: 'Power BI · Excel',
    technologies: ['Power BI', 'DAX', 'Excel'],
    related: ['rh-groupe', 'azure-infra'],
    FR: {
      role: 'Refonte du tableau de bord',
      context:
        'La direction financière de Neemba Guinée suivait ses impôts et taxes sur cinq pages difficiles à lire.',
      steps: [
        'J’ai comparé l’ancienne version visuel par visuel et dressé le plan de corrections.',
        'J’ai regroupé le suivi en trois pages\u00a0: vue d’ensemble, détail des taxes, conformité et risque.',
        'J’ai gardé les indicateurs mensuels\u00a0: impôts sur salaires, TVA payée et crédit de TVA, retenues à la source, respect des échéances, risque sur opérations.',
        'J’ai documenté chaque correction dans un journal.',
      ],
      result:
        'Trois pages lisibles à la place de cinq, avec les mêmes indicateurs et leurs variations mensuelles.',
      metrics: [{ label: 'Pages', value: '5 → 3' }],
    },
    EN: {
      role: 'Dashboard rebuild',
      context:
        'The finance department of Neemba Guinea followed its taxes on five pages that were hard to read.',
      steps: [
        'I compared the previous version visual by visual and drew up the correction plan.',
        'I grouped the follow-up on three pages: overview, tax detail, compliance and risk.',
        'I kept the monthly indicators: payroll taxes, VAT paid and VAT credit, withholding taxes, deadline compliance, operational risk.',
        'I documented every fix in a log.',
      ],
      result:
        'Three readable pages instead of five, with the same indicators and their monthly variations.',
      metrics: [{ label: 'Pages', value: '5 → 3' }],
    },
  },
  academy: {
    start: '2026-06',
    end: null,
    environment: 'Power BI · SharePoint · PowerShell',
    technologies: ['Power BI', 'SharePoint', 'PowerShell', 'Python'],
    related: ['rh-groupe', 'it-filiales'],
    FR: {
      role: 'Architecture de collecte et tableau de bord',
      context:
        'Neemba Academy voulait piloter la formation des douze entités du groupe sans dépendre de fichiers Excel dispersés.',
      steps: [
        'J’ai conçu l’architecture\u00a0: un site SharePoint, une liste par filiale avec ses droits, des référentiels communs, Power Query pour consolider.',
        'J’ai écrit les scripts PowerShell qui créent le site, les listes et l’habillage, et un jeu de données de simulation.',
        'J’ai construit le tableau de bord en trois pages\u00a0: pilotage groupe, qualité et actions, formation et budget.',
      ],
      result:
        'Une chaîne de collecte gouvernée, de la liste SharePoint au tableau de bord, prête à recevoir les données réelles.',
      metrics: [{ label: 'Entités', value: '12' }],
    },
    EN: {
      role: 'Collection architecture and dashboard',
      context:
        'Neemba Academy wanted to steer the training of the group’s twelve entities without depending on scattered Excel files.',
      steps: [
        'I designed the architecture: one SharePoint site, one list per subsidiary with its rights, shared reference lists, Power Query to consolidate.',
        'I wrote the PowerShell scripts that provision the site, the lists and the branding, and a simulation dataset.',
        'I built the three-page dashboard: group steering, quality and actions, training and budget.',
      ],
      result:
        'A governed collection chain, from the SharePoint list to the dashboard, ready for the real data.',
      metrics: [{ label: 'Entities', value: '12' }],
    },
  },
  'neemba-reports': {
    start: '2026-05',
    end: '2026-06',
    environment: 'Python · pandas · openpyxl',
    technologies: ['Python', 'pandas', 'openpyxl', 'Excel'],
    related: ['automate', 'printtrack'],
    FR: {
      role: 'Conception et développement',
      context:
        'La logistique produisait ses rapports à la main à partir de plusieurs exports Excel.',
      steps: [
        'J’ai écrit les moteurs qui lisent les exports\u00a0: appels et demandes par responsable, commandes, PIC, stocks par antériorité.',
        'J’ai consolidé les données et mis en forme les rapports Excel\u00a0: Call & Demande, Stock antériorité et rapport complet.',
        'J’ai ajouté une interface en terminal\u00a0: détection des sources, aperçu, sélection des rapports, progression.',
      ],
      result: 'Les rapports se génèrent en une commande, avec la même mise en forme à chaque fois.',
    },
    EN: {
      role: 'Design and development',
      context: 'Logistics produced its reports by hand from several Excel exports.',
      steps: [
        'I wrote the engines that read the exports: calls and requests per manager, orders, PIC, stock by age.',
        'I consolidated the data and formatted the Excel reports: Call & Demand, Stock ageing and full report.',
        'I added a terminal interface: source detection, preview, report selection, progress.',
      ],
      result: 'The reports are generated in one command, with the same formatting every time.',
    },
  },
  'biasa-immo': {
    start: '2026-09',
    end: '2026-10',
    environment: 'HTML · CSS · JavaScript · serveur local',
    technologies: ['JavaScript', 'HTML / CSS', 'Node.js', 'Excel'],
    related: ['tracker', 'biasa'],
    FR: {
      role: 'Conception et développement',
      context:
        'La Clinique BIASA tenait son registre des immobilisations et ses amortissements dans des classeurs Excel.',
      steps: [
        'J’ai conçu une application statique servie en local, sans dépendance à Internet, qui enregistre ses données en fichiers.',
        'J’ai couvert le cycle complet\u00a0: fiches et registre, amortissements de l’exercice au référentiel SYSCOHADA, cessions, inventaire physique, arrêté des comptes, journal des saisies.',
        'J’ai repris les classeurs existants par import, avec les états imprimables, les utilisateurs et droits, et les sauvegardes.',
      ],
      decision:
        'J’ai repris le système de design de Tracker pour que la clinique retrouve une interface déjà éprouvée.',
      result:
        'Un registre des immobilisations conforme au SYSCOHADA, installé sur place et utilisable hors ligne.',
    },
    EN: {
      role: 'Design and development',
      context:
        'The BIASA Clinic kept its fixed-asset register and depreciation in Excel workbooks.',
      steps: [
        'I designed a static application served locally, with no internet dependency, that stores its data in files.',
        'I covered the full cycle: asset sheets and register, yearly depreciation under the SYSCOHADA framework, disposals, physical inventory, closing date, entry log.',
        'I imported the existing workbooks, with printable statements, users and rights, and backups.',
      ],
      decision:
        'I reused Tracker’s design system so that the clinic gets an interface already proven.',
      result: 'A SYSCOHADA-compliant fixed-asset register, installed on site and usable offline.',
    },
  },
  siem: {
    start: '2023-05',
    end: '2024-08',
    environment: 'Linux · Wazuh · OpenSearch · sur site',
    technologies: ['Wazuh', 'SIEM / XDR', 'Linux', 'OpenSearch', 'Kibana', 'Bash'],
    related: ['orabank', 'mfa'],
    FR: {
      role: 'Stagiaire · projet académique',
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
      role: 'Academic intern',
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
      context:
        'Je développe Tracker, l’application de gestion du parc d’équipements IT et de la flotte de Neemba Togo\u00a0: inventaire, affectations, audits, budgets et droits dans un seul outil.',
      steps: [
        'Je structure les équipements, les utilisateurs et les emplacements.',
        'Je construis les parcours d’affectation et d’approbation.',
        'J’intègre Azure AD, les exports et les audits.',
        'Je relie les contrôles terrain aux fiches du parc\u00a0: l’agent QRInventory relève la configuration d’un poste Windows et l’affiche en QR code pour l’audit.',
      ],
      decision:
        'Je définis les droits d’accès dans les règles métier : afficher un bouton ne suffit pas à autoriser une action.',
      result: 'Je fais évoluer un outil qui rassemble inventaire, demandes, audits et reporting.',
    },
    EN: {
      role: 'Fullstack design & development',
      context:
        'I’m developing Tracker, the IT asset and fleet management application of Neemba Togo: inventory, assignments, audits, budgets and rights in one tool.',
      steps: [
        'I structure assets, users and locations.',
        'I build assignment and approval workflows.',
        'I integrate Azure AD, exports and audits.',
        'I connect field checks to asset records: the QRInventory agent reads a Windows workstation’s configuration and shows it as a QR code for the audit.',
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
      role: 'Conception du flux',
      context:
        'Les rapports automatiques des sauvegardes Veeam arrivaient par e-mail, sans vue d’ensemble ni indicateurs.',
      steps: [
        'Un flux Power Automate récupère chaque rapport de sauvegarde à sa réception.',
        'Il analyse et traite le contenu pour en extraire les données utiles aux indicateurs.',
        'Il les consolide dans un fichier Excel qui sert de base de données.',
        'Un histogramme construit sur ce fichier suit les résultats des sauvegardes.',
      ],
      result:
        'Les indicateurs de sauvegarde se lisent sur un histogramme alimenté automatiquement, sans saisie manuelle.',
    },
    EN: {
      role: 'Flow design',
      context:
        'The automatic Veeam backup reports arrived by email, with no overview and no indicators.',
      steps: [
        'A Power Automate flow picks up each backup report as it arrives.',
        'It parses and processes the content to extract the data the KPIs need.',
        'It consolidates that data in an Excel file that serves as the database.',
        'A histogram built on that file tracks the backup results.',
      ],
      result:
        'The backup indicators read on a histogram that is fed automatically, with no manual entry.',
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
