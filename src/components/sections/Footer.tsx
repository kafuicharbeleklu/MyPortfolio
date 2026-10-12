import React from 'react';
import { t, Language } from '../../translations';

interface FooterProps {
  lang: Language;
  onNavigate: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const v = t[lang];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <button type="button" className="footer-logo" onClick={() => onNavigate('hero')}>
              <span className="studio-monogram">
                ce<span>.</span>
              </span>
            </button>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">{v.footer.navTitle}</h3>
            <ul className="footer-nav">
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => onNavigate('about')}
                >
                  {v.nav.about}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => onNavigate('skills')}
                >
                  {v.nav.skills}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => onNavigate('parcours')}
                >
                  {v.nav.experience}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => onNavigate('projets')}
                >
                  {v.nav.projects}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => onNavigate('contact')}
                >
                  {v.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">{v.footer.contactTitle}</h3>
            <ul className="footer-nav">
              <li>
                <a href="mailto:charbelkafuieklu@gmail.com">charbelkafuieklu@gmail.com</a>
              </li>
              <li>
                <a href="tel:+22870664225">+228 70 66 42 25</a>
              </li>
              <li>{lang === 'FR' ? 'Lomé, Togo' : 'Lomé, Togo'}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-socials">
            <a
              href="https://www.linkedin.com/in/kafui-charbel-eklu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://github.com/kafuicharbeleklu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
          <p className="footer-copy">© 2026 Kafui Charbel EKLU. {v.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
