import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Network,
  Server,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import type { Language } from '../translations';
import type { ProjectCardData } from '../types/portfolio';
import Reveal from '../components/Reveal';
import Footer from '../components/sections/Footer';

type Study = {
  environment: string;
  FR: { context: string; steps: string[]; result: string; role: string; decision?: string };
  EN: { context: string; steps: string[]; result: string; role: string; decision?: string };
};
const studies: Record<string, Study> = {
  tracker: {
    environment: 'React · TypeScript · Azure AD · Node.js',
    FR: {
      role: 'Conception & développement fullstack',
      context:
        'Le suivi du parc IT, des demandes et des dépenses mobilise plusieurs équipes et validations. Neemba Tracker rassemble ces opérations dans une application métier unique.',
      steps: [
        'Modéliser les équipements, les utilisateurs, les emplacements et les états du parc.',
        'Construire les parcours d’affectation, de retour et d’approbation avec des droits par rôle.',
        'Intégrer Azure AD via MSAL et ajouter les exports PDF/CSV ainsi que les audits.',
        'Relier les contrôles terrain aux fiches du parc par QR et check-ins machine.',
      ],
      decision:
        'Les règles d’accès et les transitions d’état sont traitées comme des règles métier explicites : une action visible dans l’interface ne suffit pas à autoriser sa validation.',
      result:
        'Une application en évolution qui relie inventaire, demandes, approbations, audits et reporting dans un même parcours.',
    },
    EN: {
      role: 'Fullstack design & development',
      context:
        'IT assets, requests and spending involve several teams and approvals. Neemba Tracker brings these operations together in one business application.',
      steps: [
        'Model assets, users, locations and equipment states.',
        'Build assignment, return and approval journeys with role-based access.',
        'Integrate Azure AD through MSAL and add PDF/CSV exports and audits.',
        'Connect field checks to asset records through QR and machine check-ins.',
      ],
      decision:
        'Access rules and state transitions are defined as explicit business rules: seeing an action in the interface does not, by itself, authorise it.',
      result:
        'An evolving application that connects inventory, requests, approvals, audits and reporting in one workflow.',
    },
  },
  automate: {
    environment: 'Power Automate · Veeam · Outlook · Excel Online',
    FR: {
      role: 'Conception du workflow',
      context:
        'Les notifications de sauvegarde Veeam arrivaient par email, tandis que le suivi demandait une ressaisie dans Excel. Le flux transforme ces messages en lignes de reporting exploitables.',
      steps: [
        'Déclencher le flux à la réception des notifications de sauvegarde dans Outlook.',
        'Convertir le corps HTML et extraire le job ainsi que les indicateurs de résultat.',
        'Vérifier les doublons par date et nom de job avant toute écriture.',
        'Insérer les données validées dans un tableau Excel Online centralisé.',
      ],
      decision:
        'Le contrôle de doublon rend l’écriture idempotente : un message reçu de nouveau ne doit pas créer une deuxième ligne de suivi.',
      result:
        'Un suivi des sauvegardes alimenté automatiquement, avec moins de saisie manuelle et des données plus faciles à contrôler.',
    },
    EN: {
      role: 'Workflow design',
      context:
        'Veeam backup notifications arrived by email while tracking required manual re-entry in Excel. The workflow turns these messages into usable reporting rows.',
      steps: [
        'Trigger the flow when backup notifications arrive in Outlook.',
        'Convert the HTML body and extract the job and result indicators.',
        'Check for duplicates by date and job name before writing.',
        'Insert validated data into a central Excel Online table.',
      ],
      decision:
        'The duplicate check makes the write idempotent: receiving the same message again should not create a second reporting row.',
      result:
        'Backup tracking is populated automatically, with less manual entry and data that is easier to review.',
    },
  },
  siem: {
    environment: 'Linux · Wazuh · SIEM / XDR',
    FR: {
      role: 'Déploiement & supervision',
      context:
        'Donner à l’équipe IT de Neemba Togo une vue centralisée des événements de sécurité du parc, pour faciliter la détection et l’analyse des incidents.',
      steps: [
        'Cartographier les équipements et les événements à surveiller.',
        'Installer et configurer le manager Wazuh sur Linux.',
        'Déployer les agents sur les postes Windows et Linux, puis adapter les règles de détection.',
        'Organiser les alertes et accompagner l’équipe dans leur analyse.',
      ],
      result:
        'Une supervision centralisée qui rend les événements de sécurité visibles et exploitables par l’équipe IT.',
    },
    EN: {
      role: 'Deployment & monitoring',
      context:
        'Give Neemba Togo’s IT team a central view of endpoint security events to support incident detection and investigation.',
      steps: [
        'Map the devices and events to monitor.',
        'Install and configure the Wazuh manager on Linux.',
        'Deploy agents on Windows and Linux endpoints, then adapt detection rules.',
        'Organise alerts and support the team in analysing them.',
      ],
      result:
        'Centralised monitoring that makes security events visible and actionable for the IT team.',
    },
  },
  moov: {
    environment: 'Télécom · VSAT · ARCEP',
    FR: {
      role: 'Coordination de migration',
      context:
        'Accompagner la portabilité du réseau mobile professionnel de Neemba Togo, de MOOV vers Togocom, avec une attention particulière à la continuité des communications.',
      steps: [
        'Recenser les lignes mobiles et leurs dépendances.',
        'Coordonner le calendrier de migration avec les opérateurs.',
        'Superviser les liaisons VSAT pendant la transition.',
        'Contrôler la qualité de service après la bascule et documenter le nouvel environnement.',
      ],
      result:
        'Une migration coordonnée entre les équipes et les opérateurs, avec des contrôles de continuité et une documentation de l’environnement cible.',
    },
    EN: {
      role: 'Migration coordination',
      context:
        'Support the portability of Neemba Togo’s business mobile network from MOOV to Togocom, with particular attention to communication continuity.',
      steps: [
        'Inventory mobile lines and their dependencies.',
        'Coordinate the migration schedule with the operators.',
        'Monitor VSAT links during the transition.',
        'Check service quality after switching and document the new environment.',
      ],
      result:
        'A coordinated migration between teams and operators, supported by continuity checks and documentation of the target environment.',
    },
  },
  orabank: {
    environment: 'Windows Server · Active Directory · GPO',
    FR: {
      role: 'Technicien système · Stage',
      context:
        'Centraliser l’authentification et l’administration des postes dans un environnement bancaire, tout en participant au support avancé des agences Orabank.',
      steps: [
        'Installer et configurer Windows Server et le contrôleur de domaine.',
        'Structurer les comptes et les accès dans Active Directory.',
        'Appliquer les stratégies de groupe et vérifier le fonctionnement des services.',
        'Assurer le support N2/N3 et documenter les interventions.',
      ],
      result:
        'Une administration centralisée des identités et des postes, accompagnée d’un support adapté aux contraintes d’un réseau d’agences.',
    },
    EN: {
      role: 'Systems technician · Internship',
      context:
        'Centralise authentication and workstation administration in a banking environment while contributing to advanced support for Orabank branches.',
      steps: [
        'Install and configure Windows Server and the domain controller.',
        'Organise accounts and access in Active Directory.',
        'Apply group policies and check service operation.',
        'Provide L2/L3 support and document interventions.',
      ],
      result:
        'Centralised identity and workstation administration, supported by assistance tailored to a branch network.',
    },
  },
  biasa: {
    environment: 'Ubuntu Server · DNS · DHCP · Apache',
    FR: {
      role: 'Technicien réseau · Stage',
      context:
        'Mettre en place les services réseau nécessaires aux équipements et aux ressources internes de la Clinique BIASA.',
      steps: [
        'Installer et préparer Ubuntu Server.',
        'Configurer DNS et DHCP pour les noms et l’adressage du réseau interne.',
        'Déployer Apache et configurer le partage de connexion via NAT.',
        'Vérifier les services et accompagner les utilisateurs.',
      ],
      result:
        'Un socle de services Linux pour connecter les équipements et rendre les ressources internes accessibles.',
    },
    EN: {
      role: 'Network technician · Internship',
      context:
        'Set up the network services needed by devices and internal resources at Clinique BIASA.',
      steps: [
        'Install and prepare Ubuntu Server.',
        'Configure DNS and DHCP for internal naming and addressing.',
        'Deploy Apache and configure connection sharing through NAT.',
        'Verify the services and support users.',
      ],
      result:
        'A foundation of Linux services connecting devices and making internal resources accessible.',
    },
  },
};

export default function CaseStudyPage({
  project,
  lang,
  onBack,
  onNavigate,
  related,
  onProject,
}: {
  project: ProjectCardData;
  lang: Language;
  onBack: () => void;
  onNavigate: (id: string) => void;
  related: ProjectCardData[];
  onProject: (id: string) => void;
}) {
  const study = studies[project.id];
  if (!study) return null;
  const copy = study[lang];
  const fr = lang === 'FR';
  const Icon =
    {
      tracker: Network,
      automate: ChartNoAxesCombined,
      siem: ShieldCheck,
      moov: Wifi,
      orabank: Network,
      biasa: Server,
    }[project.id] || Server;
  return (
    <div className="page active" id={'page-' + project.id}>
      <nav className="nav">
        <button className="nav-logo nav-control-btn" onClick={() => onNavigate('hero')}>
          <span className="studio-monogram">
            ce<span>.</span>
          </span>
        </button>
        <button className="nav-back nav-control-btn" onClick={onBack}>
          {fr ? '← Retour aux projets' : '← Back to projects'}
        </button>
      </nav>
      <div className="sec">
        <Reveal className="det-hero">
          <div className="det-vis">
            <Icon size={100} strokeWidth={1.1} />
          </div>
          <div>
            <p className="det-eye">{project.category[lang]}</p>
            <h1 className="det-title">{project.title[lang]}</h1>
            <p className="det-co">{project.companyLine[lang]}</p>
            <p className="det-desc">{project.desc[lang]}</p>
            <div className="det-meta">
              <div className="dm">
                <small>{fr ? 'Contribution' : 'Contribution'}</small>
                <p>{copy.role}</p>
              </div>
              <div className="dm">
                <small>{fr ? 'Environnement' : 'Environment'}</small>
                <p>{study.environment}</p>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="det-body">
          <div>
            <Reveal className="blk">
              <h2 className="blk-ttl">{fr ? 'L’enjeu' : 'The challenge'}</h2>
              <p>{copy.context}</p>
            </Reveal>
            <Reveal className="blk">
              <h2 className="blk-ttl">{fr ? 'Ma contribution' : 'My contribution'}</h2>
              <ol className="steps">
                {copy.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Reveal>
            {copy.decision && (
              <Reveal className="blk studio-case-decision">
                <h2 className="blk-ttl">{fr ? 'Le choix qui compte' : 'A key design decision'}</h2>
                <p>{copy.decision}</p>
              </Reveal>
            )}
            <Reveal className="studio-case-result">
              <p className="studio-eyebrow">
                {fr ? 'Ce que le projet apporte' : 'What the project delivers'}
              </p>
              <h2>{copy.result}</h2>
            </Reveal>
          </div>
          <aside>
            <div className="sb-blk">
              <h2 className="sb-lbl">Technologies</h2>
              <div className="tags">
                {project.tags.map((tag) => (
                  <span className="tag" key={tag.label}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="sb-blk">
              <h2 className="sb-lbl">{fr ? 'Un besoin similaire ?' : 'A similar challenge?'}</h2>
              <button className="studio-text-link" onClick={() => onNavigate('contact')}>
                {fr ? 'Échangeons' : 'Let’s talk'}
                <ArrowUpRight size={16} />
              </button>
            </div>
          </aside>
        </div>
        <div className="rel">
          <h2 className="blk-ttl">{fr ? 'À découvrir aussi' : 'Explore more'}</h2>
          <div className="rel-grid">
            {related.map((item) => (
              <button
                key={item.id}
                className="rel-card card-action"
                onClick={() => onProject(item.id)}
              >
                <h3>{item.title[lang]}</h3>
                <p>
                  {item.category[lang]} <ArrowUpRight size={14} />
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer lang={lang} onNavigate={onNavigate} />
    </div>
  );
}
