import type { Language } from '../translations';

export default function LanguageToggle({
  lang,
  onToggle,
}: {
  lang: Language;
  onToggle: (lang: Language) => void;
}) {
  return (
    <div
      className="studio-language"
      role="group"
      aria-label={lang === 'FR' ? 'Langue du site' : 'Site language'}
    >
      {(['FR', 'EN'] as const).map((language) => (
        <button
          type="button"
          key={language}
          aria-pressed={lang === language}
          aria-label={language === 'FR' ? 'Français' : 'English'}
          onClick={() => onToggle(language)}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
