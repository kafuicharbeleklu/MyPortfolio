import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { assetPaths, withBaseAsset } from '../config/assets';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import ProjectsBadge from './ProjectsBadge';
import Settle from './Settle';
import { HOME_HASH } from './navigation';
import {
  approach,
  contact,
  education,
  featuredCases,
  featuredNote,
  formatSpan,
  yearsSince,
  jobs,
  projectCount,
  references,
  projects,
  skills,
  ui,
  type CaseStudy,
} from './content';
import { studies } from './studies';

type PageProps = {
  lang: Language;
};

const pad = (index: number) => String(index + 1).padStart(2, '0');

function CaseDetail({ study, lang }: { study: CaseStudy; lang: Language }) {
  const extra = studies[study.id];
  const text = extra?.[lang];
  const facts = [
    extra?.start ? formatSpan(extra.start, extra.end ?? null, lang) : '',
    text?.role ?? '',
  ].filter(Boolean);

  return (
    <div className="sm-detail">
      {facts.length > 0 && <p className="sm-cap sm-detail__facts">{facts.join('\u00a0· ')}</p>}
      <div>
        <p className="sm-cap sm-detail__label">{ui.caseNeed[lang]}</p>
        <p className="sm-serif sm-detail__context">{study.context[lang]}</p>
      </div>
      <div>
        <p className="sm-cap sm-detail__label">{ui.caseDone[lang]}</p>
        <ol>
          {study.steps[lang].map((step, index) => (
            <li key={step} className="sm-detail__step">
              <span className="sm-serif">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="sm-detail__result">
        <p className="sm-cap">{ui.caseResult[lang]}</p>
        <p>{study.result[lang]}</p>
        {text?.metrics && (
          <dl className="sm-metrics">
            {text.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="sm-cap">{metric.label}</dt>
                <dd className="sm-serif">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <a className="sm-stitch is-on-dark" href={`#/realisations/${study.id}`}>
        {ui.viewProject[lang]}
      </a>
    </div>
  );
}

/** The home page in five scenes: profile, expertise, selected work, path, contact. */
function HomePage({ lang }: PageProps) {
  const [activeCase, setActiveCase] = useState(0);
  // +1 when moving down the list, -1 when moving up: the detail leaves and enters accordingly
  const [caseDirection, setCaseDirection] = useState(1);
  const pathRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress: pathProgress } = useScroll({
    target: pathRef,
    offset: ['start 0.85', 'end 0.55'],
  });
  const resumeHref = withBaseAsset(assetPaths.resumes[lang]);
  const [statementA, statementB, statementC] = ui.statement[lang];
  const currentCase = featuredCases[activeCase];
  const caseShift = reduced ? 0 : 26 * caseDirection;

  const selectCase = (index: number) => {
    if (index !== activeCase) {
      setCaseDirection(index > activeCase ? 1 : -1);
      setActiveCase(index);
    }
  };

  return (
    <main>
      <section id="profil" className="sm-section is-alt">
        <div className="sm-wrap sm-split">
          <div className="sm-split__aside">
            <p className="sm-cap sm-accent">01</p>
            <Settle rise>
              <h2 className="sm-scene__word">{ui.nav.profil[lang]}</h2>
            </Settle>
            <p className="sm-serif sm-scene__line">{ui.profilLine[lang]}</p>
          </div>
          <div className="sm-split__main sm-profile">
            <div className="sm-profile__side">
              <Settle className="sm-portrait" delay={0.05}>
                <picture>
                  <source
                    srcSet={withBaseAsset(assetPaths.studioPortrait.webp)}
                    type="image/webp"
                  />
                  <img
                    src={withBaseAsset(assetPaths.studioPortrait.jpg)}
                    alt={ui.portraitAlt[lang]}
                    width={1024}
                    height={768}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <p className="sm-cap sm-portrait__caption">{ui.portraitCaption[lang]}</p>
              </Settle>
            </div>
            <div className="sm-profile__text">
              <p className="sm-serif sm-statement">
                {statementA}
                <em>{statementB}</em>
                {statementC}
              </p>
              <p className="sm-cap sm-muted sm-figures">
                <span>
                  {yearsSince('2023-05')} {lang === 'FR' ? 'ans' : 'years'}{' '}
                  {ui.figures.experience[lang]}
                </span>
                <span>{projectCount(projects.length)[lang]}</span>
                <span>
                  {skills.length} {ui.figures.domains[lang]}
                </span>
                <span>
                  {references.length} {ui.figures.references[lang]}
                </span>
              </p>
              <hr className="sm-seam" />
              <div className="sm-profile__cols">
                {ui.profile[lang].map((paragraph, index) => (
                  <Settle key={paragraph} delay={index * 0.1}>
                    <p>{paragraph}</p>
                  </Settle>
                ))}
              </div>
              <Settle className="sm-approach">
                <p className="sm-cap sm-accent">{ui.approachTitle[lang]}</p>
                <ul className="sm-approach__list">
                  {approach.map((item) => (
                    <li key={item.title.FR}>
                      <h3 className="sm-serif">{item.title[lang]}</h3>
                      <p>{item.desc[lang]}</p>
                    </li>
                  ))}
                </ul>
              </Settle>
            </div>
          </div>
        </div>
      </section>

      <section id="expertise" className="sm-section">
        <div className="sm-wrap sm-split">
          <div className="sm-split__aside">
            <p className="sm-cap sm-accent">02</p>
            <Settle rise>
              <h2 className="sm-scene__word">{ui.nav.expertise[lang]}</h2>
            </Settle>
            <p className="sm-serif sm-scene__line">{ui.expertiseTitle[lang]}</p>
          </div>
          <div className="sm-split__main sm-skills">
            {skills.map((skill, index) => (
              <Settle key={skill.title.FR} className="sm-item sm-skill" delay={index * 0.05}>
                <div className="sm-skill__head">
                  <span className="sm-cap sm-row__num">{pad(index)}</span>
                  <h3 className="sm-serif sm-row__title">{skill.title[lang]}</h3>
                </div>
                <p className="sm-skill__desc">{skill.desc[lang]}</p>
                <div className="sm-tags sm-item__tags">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="sm-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </Settle>
            ))}
          </div>
        </div>
      </section>

      <section id="realisations" className="sm-section is-dark sm-twill">
        <div className="sm-wrap sm-work">
          <div className="sm-split__aside">
            <p className="sm-cap sm-work__kicker">03</p>
            <Settle rise>
              <h2 className="sm-scene__word is-big">{ui.nav.realisations[lang]}</h2>
            </Settle>
            <p className="sm-serif sm-scene__line">
              {ui.workTitle[lang][0]}
              <em>{ui.workTitle[lang][1]}</em>
            </p>
          </div>
          <div className="sm-work__body">
            <div className="sm-work__list">
              {featuredCases.map((study, index) => (
                <div key={study.id} className="sm-case">
                  <button
                    type="button"
                    className="sm-case__tab"
                    aria-expanded={activeCase === index}
                    onClick={() => selectCase(index)}
                  >
                    <span className="sm-serif sm-case__name">{study.title[lang]}</span>
                    <span className="sm-case__org">{study.org}</span>
                  </button>
                  <div className="sm-case__inline">
                    {activeCase === index && <CaseDetail study={study} lang={lang} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="sm-work__panel" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentCase.id}
                  initial={{ opacity: 0, y: caseShift }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -caseShift }}
                  transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                >
                  <CaseDetail study={currentCase} lang={lang} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <Settle className="sm-work__more">
            <ProjectsBadge lang={lang} />
            <span>{featuredNote(projects.length)[lang]}</span>
          </Settle>
        </div>
      </section>

      <section id="parcours" className="sm-section">
        <div className="sm-wrap sm-split">
          <div className="sm-split__aside">
            <p className="sm-cap sm-accent">04</p>
            <Settle rise>
              <h2 className="sm-scene__word">{ui.nav.parcours[lang]}</h2>
            </Settle>
            <p className="sm-serif sm-scene__line">{ui.pathTitle[lang]}</p>
          </div>
          <div className="sm-split__main sm-path">
            <div className="sm-path__jobs" ref={pathRef}>
              <div className="sm-path__rail" aria-hidden="true" />
              <motion.div
                className="sm-path__pli"
                aria-hidden="true"
                style={{ scaleY: reduced ? 1 : pathProgress }}
              />
              <ol className="sm-path__list">
                {jobs.map((job) => (
                  <li key={job.start}>
                    <Settle className="sm-job">
                      <p className="sm-cap sm-job__date">{formatSpan(job.start, job.end, lang)}</p>
                      <div className="sm-job__body">
                        <h3 className="sm-serif sm-job__title">{job.title[lang]}</h3>
                        <p className="sm-job__org">{job.org[lang]}</p>
                        <p className="sm-job__desc">{job.desc[lang]}</p>
                      </div>
                    </Settle>
                  </li>
                ))}
              </ol>
            </div>
            <div className="sm-edu">
              <p className="sm-cap sm-muted sm-edu__kicker">{ui.education[lang]}</p>
              {education.map((item) => (
                <Settle key={item.title.FR}>
                  <div className="sm-edu__item">
                    <p className="sm-cap sm-muted">
                      {item.start
                        ? formatSpan(item.start, item.end ?? null, lang)
                        : item.period?.[lang]}
                    </p>
                    <h3 className="sm-serif sm-edu__title">{item.title[lang]}</h3>
                    <p className="sm-edu__school">{item.school[lang]}</p>
                    <p className="sm-edu__grade">{item.grade[lang]}</p>
                  </div>
                </Settle>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="sm-contact">
        <div className="sm-wrap sm-contact__inner">
          <p className="sm-cap">05 · {ui.nav.contact[lang]}</p>
          <Settle rise>
            <h2 className="sm-serif sm-contact__title">
              {ui.contactTitle[lang][0]}
              <br />
              <em>{ui.contactTitle[lang][1]}</em>
            </h2>
          </Settle>
          <Settle className="sm-contact__actions">
            <a className="sm-serif sm-contact__mail" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <a
              className="sm-patte is-light"
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ui.cv[lang]}
            </a>
          </Settle>
          <hr className="sm-seam" />
          <div className="sm-contact__grid">
            <div>
              <span className="sm-cap">{ui.phone[lang]}</span>
              <a className="sm-stitch is-on-dark" href={contact.phoneHref}>
                {contact.phoneDisplay}
              </a>
            </div>
            <div>
              <span className="sm-cap">LinkedIn</span>
              <a
                className="sm-stitch is-on-dark"
                href={contact.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.linkedInLabel}
              </a>
            </div>
            <div>
              <span className="sm-cap">GitHub</span>
              <a
                className="sm-stitch is-on-dark"
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.githubLabel}
              </a>
            </div>
            <div>
              <span className="sm-cap">{ui.based[lang]}</span>
              <span>{ui.basedValue[lang]}</span>
            </div>
            {/* the references stay folded: names on request, like their contact details */}
            <div className="sm-contact__refs">
              <span className="sm-cap">{ui.references[lang]}</span>
              <details className="sm-refs">
                <summary>
                  <span>{ui.referencesTitle[lang]}</span>
                  <span className="sm-serif sm-refs__mark" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="sm-refs__note">{ui.referencesNote[lang]}</p>
                <ul className="sm-refs__list">
                  {references.map((reference) => (
                    <li key={reference.name}>
                      <span className="sm-serif">{reference.name}</span>
                      <span>
                        {reference.role[lang]} · {reference.organization[lang]}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
          <footer className="sm-footer">
            <div className="sm-footer__base sm-cap">
              {/* "#top" is the poster: back to top stays on the home page */}
              <a
                href={HOME_HASH}
                onClick={(event) => {
                  if (window.location.hash === HOME_HASH) {
                    event.preventDefault();
                    window.scrollTo({ top: 0 });
                  }
                }}
              >
                {ui.top[lang]}
              </a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
