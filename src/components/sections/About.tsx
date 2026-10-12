import { ArrowUpRight, Network, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '../Reveal';
import type { Language } from '../../translations';

export default function About({ lang, onReadMore }: { lang: Language; onReadMore: () => void }) {
  const fr = lang === 'FR';
  const principles = [
    {
      Icon: Network,
      title: fr ? 'Faire fonctionner' : 'Keep things running',
      text: fr
        ? 'Des systèmes stables, des équipes accompagnées, des services qui tiennent leurs promesses.'
        : 'Stable systems, supported teams, and services that deliver.',
    },
    {
      Icon: ShieldCheck,
      title: fr ? 'Voir et anticiper' : 'See and anticipate',
      text: fr
        ? 'La supervision et la sécurité intégrées aux opérations, dès la conception.'
        : 'Monitoring and security built into operations from the outset.',
    },
    {
      Icon: Workflow,
      title: fr ? 'Rendre plus simple' : 'Make it simpler',
      text: fr
        ? 'Automatiser ce qui se répète. Créer les outils qui manquent. Redonner du temps aux équipes.'
        : 'Automate recurring work. Build the tools that are missing. Give teams their time back.',
    },
  ];
  return (
    <section className="studio-section studio-about" id="about">
      <div className="studio-container">
        <Reveal className="studio-about-intro">
          <div>
            <p className="studio-eyebrow">01 / {fr ? 'Ma façon de travailler' : 'How I work'}</p>
            <h2>
              {fr ? 'J’administre l’essentiel.' : 'I run what matters.'}
              <br />
              <span>{fr ? 'Je construis ce qui manque.' : 'I build what’s missing.'}</span>
            </h2>
          </div>
          <div className="studio-about-copy">
            <p>
              {fr
                ? 'Je suis Charbel, professionnel de l’IT basé à Lomé. Chez Neemba Togo, je fais le lien entre les besoins du terrain et les solutions techniques : infrastructure, support, cybersécurité et outils métier.'
                : 'I’m Charbel, an IT professional based in Lomé. At Neemba Togo, I connect operational needs with technical solutions: infrastructure, support, cybersecurity, and business tools.'}
            </p>
            <p>
              {fr
                ? 'Ce qui m’intéresse : comprendre un problème, construire une réponse utile, puis la rendre fiable et accessible à ceux qui l’utilisent.'
                : 'What drives me: understanding a problem, building something useful, and making it reliable and accessible to the people who use it.'}
            </p>
            <button className="studio-text-link" onClick={onReadMore}>
              {fr ? 'Mon parcours en détail' : 'More about my background'}{' '}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </Reveal>
        <div className="studio-principles">
          {principles.map(({ Icon, title, text }, index) => (
            <Reveal key={title} className="studio-principle" delay={index * 0.08}>
              <Icon size={28} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
