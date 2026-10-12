import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Language } from '../translations';
import Settle from './Settle';
import {
  contact,
  projectCount,
  projectDataPaths,
  projectFamilies,
  projects,
  ui,
  type ProjectFamily,
} from './content';
import { studies } from './studies';
import { PROJECTS_HASH } from './navigation';

type PageProps = {
  lang: Language;
  /** True when coming back from a project page: filter and scroll position are restored. */
  restore: boolean;
};

// Survives the page being unmounted while a project is open.
const memory: {
  family: 'all' | ProjectFamily;
  scrollY: number;
  openId: string | null;
  focusId: string | null;
} = { family: 'all', scrollY: 0, openId: null, focusId: null };

// What a visitor finds behind the row: a written case study, a technical sheet, or neither.
const getDepth = (id: string) => {
  if (id in studies) {
    return ui.depthStudy;
  }

  return id in projectDataPaths ? ui.depthSheet : null;
};

function ProjectsPage({ lang, restore }: PageProps) {
  const [initial] = useState(() =>
    restore
      ? { ...memory }
      : {
          family: 'all' as const,
          scrollY: 0,
          openId: null,
          focusId: null,
        },
  );
  const [family, setFamily] = useState<'all' | ProjectFamily>(initial.family);
  const [openId, setOpenId] = useState<string | null>(initial.openId);
  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    Object.assign(memory, initial);
    window.scrollTo({ top: initial.scrollY, behavior: 'instant' });
    const target = initial.focusId ? document.getElementById(initial.focusId) : null;
    if (target) target.focus({ preventScroll: true });
    else if (restore) {
      const heading = mainRef.current?.querySelector('h1');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }

    // Record while the list is mounted; never read the shorter destination's scroll on cleanup.
    const rememberScroll = () => {
      if (window.location.hash !== PROJECTS_HASH) return;
      memory.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', rememberScroll, { passive: true });
    return () => window.removeEventListener('scroll', rememberScroll);
  }, [initial, restore]);

  useEffect(() => {
    memory.family = family;
    memory.openId = openId;
  }, [family, openId]);
  // newest first, the order of content.ts deciding within a year
  const visibleProjects = projects
    .filter((project) => family === 'all' || project.family === family)
    .sort((a, b) => b.year - a.year);

  const selectFamily = (key: 'all' | ProjectFamily) => {
    setFamily(key);
    setOpenId(null);
  };

  return (
    <main
      ref={mainRef}
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
        if (!link || !link.hash.startsWith(`${PROJECTS_HASH}/`)) return;
        memory.scrollY = window.scrollY;
        const project = link.closest<HTMLElement>('[data-project]')?.dataset.project;
        memory.focusId = project ? `project-link-${project}` : null;
      }}
    >
      <section className={`sm-wrap sm-projects${restore ? ' is-restoring' : ''}`}>
        <div className="sm-projects__head">
          <div>
            <p className="sm-cap sm-accent sm-fall" style={{ animationDelay: '0.1s' }}>
              {ui.projectsKicker[lang]}
            </p>
            <h1 className="sm-serif sm-projects__title">
              <span className="sm-line">
                <span style={{ animationDelay: '0.15s' }}>{ui.projectsTitle[lang][0]}</span>
              </span>
              <span className="sm-line">
                <span style={{ animationDelay: '0.3s' }}>
                  <em>{ui.projectsTitle[lang][1]}</em>
                </span>
              </span>
            </h1>
            <p className="sm-projects__sub sm-fall" style={{ animationDelay: '0.4s' }}>
              {ui.projectsSub[lang]}
            </p>
          </div>
          <div className="sm-filters sm-fall is-quick" style={{ animationDelay: '0.3s' }}>
            <div className="sm-filters__chips" role="group" aria-label={ui.projectsKicker[lang]}>
              {projectFamilies.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="sm-chip"
                  aria-pressed={family === item.key}
                  onClick={() => selectFamily(item.key)}
                >
                  {item.label[lang]}
                </button>
              ))}
            </div>
            <p className="sm-cap sm-muted" aria-live="polite">
              {projectCount(visibleProjects.length)[lang]}
            </p>
          </div>
        </div>

        <div className="sm-projects__list">
          {visibleProjects.map((project, index) => {
            const isOpen = openId === project.id;
            const panelId = `project-panel-${project.id}`;
            const depth = getDepth(project.id);

            return (
              <div
                key={project.id}
                data-project={project.id}
                className="sm-item sm-item--in"
                style={{ '--sm-i': index } as CSSProperties}
              >
                <div className="sm-row sm-prow">
                  <span className="sm-cap sm-row__num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="sm-prow__text">
                    {depth ? (
                      <a
                        id={`project-link-${project.id}`}
                        className="sm-serif sm-prow__title"
                        href={`#/realisations/${project.id}`}
                        style={{ viewTransitionName: `project-${project.id}` }}
                      >
                        {project.title[lang]}
                      </a>
                    ) : (
                      <span className="sm-serif sm-prow__title">{project.title[lang]}</span>
                    )}
                    <span className="sm-prow__org">
                      {project.org[lang]}
                      {depth && <strong> · {depth[lang]}</strong>}
                    </span>
                  </span>
                  <span className="sm-cap sm-prow__year">{project.year}</span>
                  <span className="sm-cap sm-prow__cat">{project.category[lang]}</span>
                  <button
                    type="button"
                    className="sm-prow__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={`${(isOpen ? ui.hideSummary : ui.showSummary)[lang]} : ${project.title[lang]}`}
                    onClick={() => setOpenId(isOpen ? null : project.id)}
                  >
                    <span className="sm-serif sm-row__mark" aria-hidden="true">
                      +
                    </span>
                  </button>
                </div>
                <div id={panelId} className={isOpen ? 'sm-acc is-open' : 'sm-acc'} inert={!isOpen}>
                  <div>
                    <div className="sm-acc__inner sm-prow__detail">
                      <p>{project.desc[lang]}</p>
                      <div className="sm-tags">
                        {project.tags.map((tag) => (
                          <span key={tag} className="sm-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {depth && (
                        <a className="sm-stitch" href={`#/realisations/${project.id}`}>
                          {ui.viewProject[lang]}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sm-end">
        <div className="sm-wrap sm-end__inner">
          <Settle rise>
            <h2 className="sm-serif sm-end__title">
              {ui.projectsEnd[lang][0]}
              <br />
              <em>{ui.projectsEnd[lang][1]}</em>
            </h2>
          </Settle>
          <div className="sm-end__actions">
            <a className="sm-patte is-light" href={`mailto:${contact.email}`}>
              {ui.write[lang]}
            </a>
            <a className="sm-stitch is-on-dark" href="#realisations">
              {ui.back[lang]}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProjectsPage;
