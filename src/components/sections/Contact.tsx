import React, { useState } from 'react';
import { t, Language } from '../../translations';

const contactEmail = 'charbelkafuieklu@gmail.com';
const contactPhone = '+228 70 66 42 25';
const contactPhoneHref = '+22870664225';
const linkedInUrl = 'https://www.linkedin.com/in/kafui-charbel-eklu';

interface ContactProps {
  lang: Language;
}

const Contact: React.FC<ContactProps> = ({ lang }) => {
  const v = t[lang];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      formData.subject.trim() ||
        `${lang === 'FR' ? 'Contact portfolio' : 'Portfolio contact'} - ${formData.name.trim()}`,
    );
    const body = encodeURIComponent(
      [
        `${lang === 'FR' ? 'Nom' : 'Name'}: ${formData.name.trim()}`,
        `Email: ${formData.email.trim()}`,
        '',
        formData.message.trim(),
      ].join('\n'),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="sec" id="contact">
      <div className="sec-hdr">
        <span className="sec-num">{v.contact.num}</span>
        <h2 className="sec-ttl">{v.contact.title}.</h2>
        <span className="sec-sub">{v.contact.sub}</span>
      </div>
      <div className="contact-wrap">
        <div className="contact-info">
          <h3>
            {lang === 'FR' ? (
              <>
                Parlons de votre
                <br />
                prochain projet.
              </>
            ) : (
              <>
                Let’s talk about
                <br />
                your next project.
              </>
            )}
          </h3>
          <p>
            {lang === 'FR'
              ? 'Une infrastructure à faire évoluer, un processus à simplifier ou une équipe à renforcer ? Parlons de vos besoins, à Lomé comme à l’international.'
              : 'An infrastructure to improve, a process to simplify or a team to strengthen? Let’s discuss your needs, in Lomé or internationally.'}
          </p>
          <div className="contact-items">
            <a className="c-item c-item-link" href={`mailto:${contactEmail}`}>
              <div className="c-icon">
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <small>Email</small>
                <p>{contactEmail}</p>
              </div>
            </a>
            <a className="c-item c-item-link" href={`tel:${contactPhoneHref}`}>
              <div className="c-icon">
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <small>{lang === 'FR' ? 'Téléphone' : 'Phone'}</small>
                <p>{contactPhone}</p>
              </div>
            </a>
            <a
              className="c-item c-item-link"
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="c-icon">
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <div>
                <small>LinkedIn</small>
                <p>Kafui Charbel Eklu</p>
              </div>
            </a>
            <div className="c-item">
              <div className="c-icon">
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <small>{lang === 'FR' ? 'Localisation' : 'Location'}</small>
                <p>
                  {lang === 'FR'
                    ? 'Lomé, Togo · Mobilité internationale'
                    : 'Lomé, Togo · International mobility'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact-name">{v.contact.formName}</label>
              <input
                id="contact-name"
                type="text"
                placeholder={lang === 'FR' ? 'Votre nom' : 'Your name'}
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">{v.contact.formEmail}</label>
              <input
                id="contact-email"
                type="email"
                placeholder={lang === 'FR' ? 'votre@email.com' : 'your@email.com'}
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </div>
          </div>
          <div className="form-full">
            <div className="form-group">
              <label htmlFor="contact-subject">{v.contact.formSubject}</label>
              <input
                id="contact-subject"
                type="text"
                placeholder={lang === 'FR' ? 'Objet de votre message' : 'Message subject'}
                value={formData.subject}
                onChange={handleChange('subject')}
              />
            </div>
          </div>
          <div className="form-full">
            <div className="form-group">
              <label htmlFor="contact-message">{v.contact.formMessage}</label>
              <textarea
                id="contact-message"
                placeholder={
                  lang === 'FR'
                    ? 'Décrivez votre projet ou votre opportunité...'
                    : 'Describe your project or opportunity...'
                }
                value={formData.message}
                onChange={handleChange('message')}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-submit">
            {v.contact.formSubmit}
          </button>
          <p className="studio-form-note">
            {lang === 'FR'
              ? 'Ce formulaire ouvre votre application de messagerie avec le message préparé.'
              : 'This form opens your email app with your message ready to send.'}
          </p>
        </form>
      </div>
    </section>
  );
};

export default Contact;
