import { useCallback, useEffect, useRef, useState } from 'react';
import { assetPaths, withBaseAsset } from '../config/assets';
import type { Language } from '../translations';

/** One persistent audio element, shared by every page through the site header. */
function MusicPlayer({ lang }: { lang: Language }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayback = useRef(false);
  const manuallyPaused = useRef(false);
  const playAttempt = useRef(0);
  const mounted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const fr = lang === 'FR';

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || manuallyPaused.current) return;
    const attempt = ++playAttempt.current;
    wantsPlayback.current = true;
    setFailed(false);
    setLoading(true);
    audio.volume = 0.18;
    if (audio.error) audio.load();

    try {
      await audio.play();
    } catch (error) {
      if (!mounted.current || attempt !== playAttempt.current) return;
      wantsPlayback.current = false;
      setPlaying(false);
      // A browser policy rejection is expected before the first user interaction.
      if (!(error instanceof Error && error.name === 'NotAllowedError')) setFailed(true);
    } finally {
      if (mounted.current && attempt === playAttempt.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const audio = audioRef.current;
    const interaction = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('.sm-music__toggle')) return;
      if (event instanceof KeyboardEvent && (event.ctrlKey || event.altKey || event.metaKey))
        return;
      if (manuallyPaused.current || !audio?.paused || wantsPlayback.current) return;
      void startPlayback();
    };
    // Browsers that block audible autoplay allow it on the first click or key press.
    document.addEventListener('click', interaction);
    document.addEventListener('touchend', interaction, { passive: true });
    document.addEventListener('keydown', interaction);
    void startPlayback();
    return () => {
      mounted.current = false;
      playAttempt.current += 1;
      wantsPlayback.current = false;
      document.removeEventListener('click', interaction);
      document.removeEventListener('touchend', interaction);
      document.removeEventListener('keydown', interaction);
      audio?.pause();
    };
  }, [startPlayback]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantsPlayback.current || !audio.paused) {
      manuallyPaused.current = true;
      wantsPlayback.current = false;
      playAttempt.current += 1;
      audio.pause();
      setPlaying(false);
      setLoading(false);
    } else {
      manuallyPaused.current = false;
      void startPlayback();
    }
  };

  const label = loading
    ? fr
      ? 'Annuler le démarrage de la musique'
      : 'Cancel music playback'
    : playing
      ? fr
        ? 'Mettre la musique en pause'
        : 'Pause music'
      : fr
        ? 'Écouter le Duo des fleurs'
        : 'Play the Flower Duet';
  const title = failed
    ? fr
      ? 'Musique indisponible. Cliquer pour réessayer.'
      : 'Music unavailable. Click to retry.'
    : label;

  return (
    <div className="sm-music">
      <audio
        ref={audioRef}
        src={withBaseAsset(assetPaths.backgroundMusic)}
        preload="auto"
        autoPlay
        loop
        onPlaying={() => {
          if (manuallyPaused.current) {
            audioRef.current?.pause();
            return;
          }
          wantsPlayback.current = true;
          setPlaying(true);
          setLoading(false);
        }}
        onWaiting={() => {
          setPlaying(false);
          setLoading(wantsPlayback.current);
        }}
        onPause={() => {
          // Ignore a delayed pause event if playback has already resumed.
          if (!audioRef.current?.paused) return;
          wantsPlayback.current = false;
          setPlaying(false);
          setLoading(false);
        }}
        onError={() => {
          wantsPlayback.current = false;
          setPlaying(false);
          setLoading(false);
          setFailed(true);
        }}
      />
      <button
        type="button"
        className="sm-music__toggle"
        aria-label={label}
        aria-pressed={playing}
        aria-busy={loading}
        title={title}
        onClick={toggle}
      >
        <svg
          className="sm-music__disc"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" />
          <path d="M7.8 7.8a6 6 0 0 1 8.4 0M7.8 16.2a6 6 0 0 0 8.4 0" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default MusicPlayer;
