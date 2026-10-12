import React from 'react';
import ProjectCard from '../components/ProjectCard';
import Footer from '../components/sections/Footer';
import type { Language } from '../translations';
import type {
  PaginationToken,
  ProjectCardData,
  ProjectFilterKey,
  ProjectTag,
} from '../types/portfolio';

type FilterOption = {
  key: ProjectFilterKey;
  label: string;
};

interface ProjectsPageProps {
  lang: Language;
  activeProjectFilterLabel: string;
  allProjectsSectionRef: React.RefObject<HTMLElement | null>;
  isProjectFilterMenuOpen: boolean;
  projectFilterMenuRef: React.RefObject<HTMLDivElement | null>;
  projectSearch: string;
  setProjectSearch: React.Dispatch<React.SetStateAction<string>>;
  sortedProjectFilters: FilterOption[];
  projectFilter: ProjectFilterKey;
  selectProjectFilter: (filterKey: ProjectFilterKey) => void;
  setIsProjectFilterMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  paginatedProjectRange: {
    start: number;
    end: number;
  };
  filteredProjects: ProjectCardData[];
  paginatedProjects: ProjectCardData[];
  projectPaginationTokens: PaginationToken[];
  projectPage: number;
  totalProjectPages: number;
  changeProjectPage: (nextPage: number) => void;
  renderProjectIcon: (icon: ProjectCardData['icon'], accent: string) => React.ReactNode;
  getSortedTags: (tags: ProjectTag[]) => ProjectTag[];
  showDetail: (id: string) => void;
  backToMain: () => void;
  scrollToSection: (id: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  lang,
  activeProjectFilterLabel,
  allProjectsSectionRef,
  isProjectFilterMenuOpen,
  projectFilterMenuRef,
  projectSearch,
  setProjectSearch,
  sortedProjectFilters,
  projectFilter,
  selectProjectFilter,
  setIsProjectFilterMenuOpen,
  paginatedProjectRange,
  filteredProjects,
  paginatedProjects,
  projectPaginationTokens,
  projectPage,
  totalProjectPages,
  changeProjectPage,
  renderProjectIcon,
  getSortedTags,
  showDetail,
  backToMain,
  scrollToSection,
}) => {
  return (
    <div className="page active" id="page-all-projects">
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
        <button type="button" className="nav-back nav-control-btn" onClick={backToMain}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {lang === 'FR' ? 'Retour au portfolio' : 'Back to portfolio'}
        </button>
      </nav>
      <section ref={allProjectsSectionRef} className="sec projects-page section-muted">
        <div className="sec-hdr">
          <span className="sec-num">06</span>
          <h1 className="sec-ttl">{lang === 'FR' ? 'Tous mes projets.' : 'All my projects.'}</h1>
          <span className="sec-sub">
            {lang === 'FR'
              ? 'Explore mes réalisations par mot-clé, domaine ou environnement technique.'
              : 'Explore my work by keyword, domain, or technical environment.'}
          </span>
        </div>

        <div className="projects-tools">
          <label className="projects-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
            <input
              type="search"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder={
                lang === 'FR'
                  ? 'Rechercher un projet, une techno, un client...'
                  : 'Search by project, stack, client...'
              }
              aria-label={lang === 'FR' ? 'Rechercher dans les projets' : 'Search projects'}
            />
          </label>

          <div className="project-filter-mobile-row">
            <div
              className={`project-filter-dropdown ${isProjectFilterMenuOpen ? 'open' : ''}`}
              ref={projectFilterMenuRef}
            >
              <button
                type="button"
                className="project-filter-trigger"
                aria-haspopup="listbox"
                aria-expanded={isProjectFilterMenuOpen}
                aria-label={lang === 'FR' ? 'Filtrer les projets' : 'Filter projects'}
                onClick={() => setIsProjectFilterMenuOpen((current) => !current)}
              >
                <span>{activeProjectFilterLabel}</span>
                <svg
                  className="project-filter-trigger-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6.5L8 10L12 6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isProjectFilterMenuOpen && (
                <div
                  className="project-filter-menu"
                  role="listbox"
                  aria-label={lang === 'FR' ? 'Options de filtre projet' : 'Project filter options'}
                >
                  {sortedProjectFilters.map((filter) => (
                    <button
                      key={`mobile-filter-${filter.key}`}
                      type="button"
                      role="option"
                      aria-selected={projectFilter === filter.key}
                      className={`project-filter-option ${projectFilter === filter.key ? 'active' : ''}`}
                      onClick={() => selectProjectFilter(filter.key)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="project-filter-bar"
            role="group"
            aria-label={lang === 'FR' ? 'Filtres de projet' : 'Project filters'}
          >
            {sortedProjectFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`project-filter-btn ${projectFilter === filter.key ? 'active' : ''}`}
                onClick={() => selectProjectFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <p className="projects-results">
            {lang === 'FR'
              ? `${paginatedProjectRange.start}–${paginatedProjectRange.end} sur ${filteredProjects.length} projet${filteredProjects.length > 1 ? 's' : ''}`
              : `${paginatedProjectRange.start}–${paginatedProjectRange.end} of ${filteredProjects.length} project${filteredProjects.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {filteredProjects.length > 0 ? (
          <>
            <div className="studio-project-grid">
              {paginatedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  lang={lang}
                  index={index}
                  onOpen={project.detailPage ? showDetail : undefined}
                />
              ))}
            </div>
            {totalProjectPages > 1 ? (
              <nav
                className="projects-pagination"
                aria-label={lang === 'FR' ? 'Pagination des projets' : 'Projects pagination'}
              >
                <div className="projects-pagination-pages">
                  {projectPaginationTokens.map((token) =>
                    typeof token === 'number' ? (
                      <button
                        key={`project-page-${token}`}
                        type="button"
                        className={`projects-pagination-btn projects-pagination-page ${projectPage === token ? 'active' : ''}`}
                        aria-current={projectPage === token ? 'page' : undefined}
                        onClick={() => changeProjectPage(token)}
                      >
                        {token}
                      </button>
                    ) : (
                      <span
                        key={`project-page-${token}`}
                        className="projects-pagination-ellipsis"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    ),
                  )}
                </div>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="projects-empty">
            <h3>{lang === 'FR' ? 'Aucun projet trouvé.' : 'No matching project found.'}</h3>
            <p>
              {lang === 'FR'
                ? 'Essaie un autre mot-clé ou retire un filtre pour élargir la liste.'
                : 'Try another keyword or remove a filter to broaden the list.'}
            </p>
          </div>
        )}
      </section>
      <Footer lang={lang} onNavigate={scrollToSection} />
    </div>
  );
};

export default ProjectsPage;
