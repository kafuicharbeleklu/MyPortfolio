import { useEffect, useState } from 'react';
import { withBaseAsset } from '../config/assets';
import useProjectLoader from '../hooks/useProjectLoader';
import type { Language } from '../translations';
import type { StructuredProjectData } from '../types/portfolio';
import Settle from './Settle';
import {
  contact,
  detailUi,
  formatPeriod,
  formatSpan,
  projectDataPaths,
  projectRelated,
  projectResources,
  projects,
  ui,
} from './content';
import { detailProjects, studies } from './studies';

type ProjectPageProps = {
  lang: Language;
  id: string;
};

const EN_SUFFIX = '@EN';

// Each sheet exists twice on disk: projects_data.json (French) and projects_data.en.json.
const loaderConfigs = Object.fromEntries(
  Object.entries(projectDataPaths).flatMap(([projectId, dataPath]) => [
    [projectId, { dataPath }],
    [`${projectId}${EN_SUFFIX}`, { dataPath: dataPath.replace(/\.json$/, '.en.json') }],
  ]),
);

const stackGroups = ['frontend', 'backend', 'database', 'devops', 'tools'] as const;

// The JSON files are written by hand; keep their punctuation in line with the site copy.
const clean = (text: string) => text.replace(/\s[—–]\s/g, ', ');

type ProjectNotesProps = {
  data: StructuredProjectData;
  lang: Language;
  isFallback: boolean;
};

function ProjectNotes({ data, lang, isFallback }: ProjectNotesProps) {
  const [openExtra, setOpenExtra] = useState<string | null>(null);
  // Long reflective text stays folded so the page reads as facts first.
  const extras = [
    { key: 'challenges', label: detailUi.challenges[lang], text: data.challenges },
    { key: 'learnings', label: detailUi.learnings[lang], text: data.learnings },
  ].filter((extra) => extra.text);
  const stack = stackGroups
    .map((group) => ({ group, items: data.tech_stack[group] ?? [] }))
    .filter((entry) => entry.items.length > 0);

  return (
    <>
      {isFallback && <p className="sm-cap sm-muted">{detailUi.frenchOnly[lang]}</p>}
      {data.description && (
        <Settle className="sm-block">
          <p className="sm-cap sm-accent">{detailUi.overview[lang]}</p>
          <p>{clean(data.description)}</p>
        </Settle>
      )}
      {data.features.length > 0 && (
        <Settle className="sm-block">
          <p className="sm-cap sm-accent">{detailUi.features[lang]}</p>
          <ol>
            {data.features.map((feature, index) => (
              <li key={feature} className="sm-step">
                <span className="sm-serif">{index + 1}</span>
                <span>{clean(feature)}</span>
              </li>
            ))}
          </ol>
        </Settle>
      )}
      {stack.length > 0 && (
        <Settle className="sm-block">
          <p className="sm-cap sm-accent">{detailUi.stack[lang]}</p>
          <dl className="sm-stack">
            {stack.map((entry) => (
              <div key={entry.group}>
                <dt className="sm-cap sm-muted">{detailUi.stackGroups[entry.group][lang]}</dt>
                <dd className="sm-tags">
                  {entry.items.map((item) => (
                    <span key={item} className="sm-tag">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Settle>
      )}
      {extras.length > 0 && (
        <div>
          {extras.map((extra) => {
            const isOpen = openExtra === extra.key;
            const panelId = `project-note-${extra.key}`;

            return (
              <div key={extra.key} className="sm-item">
                <button
                  type="button"
                  className="sm-row sm-note-row"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenExtra(isOpen ? null : extra.key)}
                >
                  <span className="sm-serif sm-note-row__title">{extra.label}</span>
                  <span className="sm-serif sm-row__mark" aria-hidden="true">
                    +
                  </span>
                </button>
                <div id={panelId} className={isOpen ? 'sm-acc is-open' : 'sm-acc'} inert={!isOpen}>
                  <div>
                    <p className="sm-acc__inner sm-note-row__text">{clean(extra.text)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function ProjectPage({ lang, id }: ProjectPageProps) {
  const index = detailProjects.findIndex((item) => item.id === id);
  const project = index >= 0 ? detailProjects[index] : null;
  const hasData = id in projectDataPaths;
  const { projects: loaded, loadProjectDetail } = useProjectLoader(loaderConfigs, withBaseAsset);

  const dataKey = lang === 'EN' ? `${id}${EN_SUFFIX}` : id;
  const localized = loaded[dataKey];
  // null means the fetch failed: fall back to the French sheet rather than show nothing
  const isFallback = lang === 'EN' && localized === null;

  useEffect(() => {
    if (hasData) {
      void loadProjectDetail(isFallback ? id : dataKey);
    }
  }, [hasData, id, dataKey, isFallback, loadProjectDetail]);

  if (!project) {
    return (
      <main className="sm-wrap sm-projects">
        <h1 className="sm-serif sm-projects__title">{detailUi.notFound[lang]}</h1>
        <a className="sm-stitch" href="#/realisations">
          {ui.backToProjects[lang]}
        </a>
      </main>
    );
  }

  const study = studies[id];
  const text = study?.[lang];
  const data = isFallback ? loaded[id] : localized;
  const previous = detailProjects[(index - 1 + detailProjects.length) % detailProjects.length];
  const next = detailProjects[(index + 1) % detailProjects.length];
  // the facts of the page: the study first, the technical sheet when the study says nothing
  const role = text?.role ?? data?.role ?? null;
  const period = study?.start
    ? formatSpan(study.start, study.end ?? null, lang)
    : (data?.duration ?? null);
  const environment = study?.environment ?? project.tags.join(' · ');
  const related = (study?.related ?? projectRelated[id] ?? [])
    .map((relatedId) => projects.find((item) => item.id === relatedId))
    .filter((item): item is (typeof projects)[number] => Boolean(item))
    .slice(0, 2);
  const links = [
    ...(projectResources[id] ?? []).map((resource) => ({
      href: withBaseAsset(resource.href),
      label: resource.label[lang],
    })),
    ...(data?.links.demo ? [{ href: data.links.demo, label: detailUi.demo[lang] }] : []),
    ...(data?.links.live ? [{ href: data.links.live, label: detailUi.live[lang] }] : []),
    ...(data?.links.github ? [{ href: data.links.github, label: 'GitHub' }] : []),
  ];

  return (
    <main>
      <section className="sm-wrap sm-projects">
        <div>
          <p className="sm-cap sm-accent sm-fall" style={{ animationDelay: '0.1s' }}>
            {project.category[lang]}
            {' · '}
            {project.year}
          </p>
          <h1
            className="sm-serif sm-projects__title"
            style={{ viewTransitionName: `project-${project.id}` }}
          >
            {project.title[lang]}
          </h1>
          <p className="sm-projects__sub sm-fall" style={{ animationDelay: '0.35s' }}>
            {project.desc[lang]}
          </p>
        </div>

        <dl className="sm-facts sm-fall is-quick" style={{ animationDelay: '0.3s' }}>
          <div>
            <dt className="sm-cap sm-muted">{detailUi.context[lang]}</dt>
            <dd>{project.org[lang]}</dd>
          </div>
          {role && (
            <div>
              <dt className="sm-cap sm-muted">{detailUi.role[lang]}</dt>
              <dd>{role}</dd>
            </div>
          )}
          {period && (
            <div>
              <dt className="sm-cap sm-muted">{detailUi.period[lang]}</dt>
              <dd>{period}</dd>
            </div>
          )}
          <div>
            <dt className="sm-cap sm-muted">{detailUi.environment[lang]}</dt>
            <dd>{environment}</dd>
          </div>
          {links.length > 0 && (
            <div>
              <dt className="sm-cap sm-muted">{detailUi.links[lang]}</dt>
              <dd className="sm-facts__links">
                {links.map((link) => (
                  <a
                    key={link.href}
                    className="sm-stitch"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {text && (
        <section className="sm-section is-dark sm-twill">
          <div className="sm-wrap sm-detail">
            <div>
              <p className="sm-cap sm-detail__label">{ui.caseNeed[lang]}</p>
              <p className="sm-serif sm-detail__context">{text.context}</p>
            </div>
            <div>
              <p className="sm-cap sm-detail__label">{ui.caseDone[lang]}</p>
              <ol>
                {text.steps.map((step, stepIndex) => (
                  <li key={step} className="sm-detail__step">
                    <span className="sm-serif">{stepIndex + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            {text.decision && (
              <div>
                <p className="sm-cap sm-detail__label">{detailUi.decision[lang]}</p>
                <p>{text.decision}</p>
              </div>
            )}
            {text.timeline && (
              <div>
                <p className="sm-cap sm-detail__label">{detailUi.timeline[lang]}</p>
                <ol className="sm-timeline">
                  {text.timeline.map((milestone) => (
                    <li key={milestone.date + milestone.label}>
                      <span className="sm-cap">
                        {formatPeriod(milestone.date, milestone.date, lang)}
                      </span>
                      <span>{milestone.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="sm-detail__result">
              <p className="sm-cap">{ui.caseResult[lang]}</p>
              <p>{text.result}</p>
              {text.metrics && (
                <dl className="sm-metrics">
                  {text.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="sm-cap">{metric.label}</dt>
                      <dd className="sm-serif">{metric.value}</dd>
                      {metric.note && <small>{metric.note}</small>}
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {study?.technologies && (
              <div>
                <p className="sm-cap sm-detail__label">{detailUi.stack[lang]}</p>
                <div className="sm-tags">
                  {study.technologies.map((item) => (
                    <span key={item} className="sm-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {hasData && (
        <section className="sm-wrap sm-notes">
          {data === undefined && <p className="sm-muted">{detailUi.loading[lang]}</p>}
          {data === null && <p className="sm-muted">{detailUi.unavailable[lang]}</p>}
          {data && <ProjectNotes data={data} lang={lang} isFallback={isFallback} />}
        </section>
      )}

      {related.length > 0 ? (
        <nav className="sm-wrap sm-pager" aria-label={detailUi.related[lang]}>
          {related.map((item) => (
            <a key={item.id} href={`#/realisations/${item.id}`}>
              <span className="sm-cap sm-muted">
                {detailUi.related[lang]} · {item.year}
              </span>
              <span className="sm-serif">{item.title[lang]}</span>
            </a>
          ))}
        </nav>
      ) : (
        <nav className="sm-wrap sm-pager" aria-label={detailUi.otherProjects[lang]}>
          <a href={`#/realisations/${previous.id}`}>
            <span className="sm-cap sm-muted">{detailUi.previous[lang]}</span>
            <span className="sm-serif">{previous.title[lang]}</span>
          </a>
          <a href={`#/realisations/${next.id}`}>
            <span className="sm-cap sm-muted">{detailUi.next[lang]}</span>
            <span className="sm-serif">{next.title[lang]}</span>
          </a>
        </nav>
      )}

      <section className="sm-end">
        <div className="sm-wrap sm-end__inner">
          <h2 className="sm-serif sm-end__title">
            {detailUi.endTitle[lang][0]}
            <br />
            <em>{detailUi.endTitle[lang][1]}</em>
          </h2>
          <div className="sm-end__actions">
            <a className="sm-patte is-light" href={`mailto:${contact.email}`}>
              {ui.write[lang]}
            </a>
            <a className="sm-stitch is-on-dark" href="#/realisations">
              {ui.backToProjects[lang]}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProjectPage;
