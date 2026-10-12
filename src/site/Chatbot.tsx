import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import type { Language } from '../translations';
import { contact } from './content';

const endpoint = (import.meta.env.VITE_CHATBOT_API_URL || '').trim().replace(/\/+$/, '');
const apiUrl = endpoint ? (endpoint.endsWith('/api/chat') ? endpoint : `${endpoint}/api/chat`) : '';
const maxMessages = 10;

type Message = { text: string; isUser: boolean };

function Chatbot({ lang, suspended = false }: { lang: Language; suspended?: boolean }) {
  const fr = lang === 'FR';
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (suspended) setOpen(false);
  }, [suspended]);

  useEffect(() => {
    if (!open || suspended) {
      return undefined;
    }

    inputRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, suspended]);

  useEffect(() => {
    if (open && !suspended) {
      endRef.current?.scrollIntoView({
        behavior: reduced ? 'instant' : 'smooth',
        block: 'nearest',
      });
    }
  }, [messages, loading, reduced, open, suspended]);

  const send = async () => {
    const message = input.trim();
    if (!message || loading || sent >= maxMessages || !apiUrl) {
      return;
    }

    setInput('');
    setLoading(true);
    setSent((value) => value + 1);
    setMessages((value) => [...value, { text: message, isUser: true }]);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history: messages.map((item) => ({
            role: item.isUser ? 'user' : 'assistant',
            text: item.text,
          })),
        }),
      });
      if (response.status === 429) {
        throw new Error('rate-limit');
      }
      const payload = await response.json();
      if (!response.ok || typeof payload.reply !== 'string' || !payload.reply.trim()) {
        throw new Error('unavailable');
      }
      setMessages((value) => [...value, { text: payload.reply.trim(), isUser: false }]);
    } catch (error) {
      const limited = error instanceof Error && error.message === 'rate-limit';
      const fallback = limited
        ? fr
          ? 'La limite de messages est atteinte. Vous pouvez me contacter directement par email.'
          : 'The message limit has been reached. You can contact me directly by email.'
        : fr
          ? 'L’assistant est momentanément indisponible. Réessayez plus tard ou contactez-moi par email.'
          : 'The assistant is temporarily unavailable. Please try later or contact me by email.';
      setMessages((value) => [...value, { isUser: false, text: fallback }]);
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
      setLoading(false);
    }
  };

  const title = apiUrl
    ? fr
      ? 'L’assistant de Charbel'
      : 'Charbel’s assistant'
    : fr
      ? 'Faisons connaissance'
      : 'Let’s connect';
  const greeting = apiUrl
    ? fr
      ? 'Bonjour ! Je suis l’assistant IA de Charbel. Posez-moi une question sur son parcours, ses compétences ou ses projets.'
      : 'Hello! I’m Charbel’s AI assistant. Ask me about his background, skills or projects.'
    : fr
      ? 'Un projet, une opportunité ou simplement une question ? Échangeons directement.'
      : 'A project, an opportunity, or a question? Let’s talk directly.';
  const toggleLabel = open
    ? fr
      ? 'Fermer la conversation'
      : 'Close conversation'
    : fr
      ? 'Ouvrir la conversation'
      : 'Open conversation';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sm-chat"
            id="chatbot-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chatbot-title"
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="sm-chat__head sm-twill">
              <h3 id="chatbot-title" className="sm-serif">
                {title}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label={fr ? 'Fermer la conversation' : 'Close conversation'}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <div className="sm-chat__log" role="log" aria-live="polite" aria-busy={loading}>
              <p className="sm-chat__bubble">{greeting}</p>
              {messages.map((message, index) => (
                <p
                  key={index}
                  className={message.isUser ? 'sm-chat__bubble is-user' : 'sm-chat__bubble'}
                >
                  {message.text}
                </p>
              ))}
              {loading && (
                <p className="sm-chat__status" role="status">
                  {fr ? 'Réponse en cours…' : 'Thinking…'}
                </p>
              )}
              <div ref={endRef} />
            </div>
            {apiUrl && (
              <form
                className="sm-chat__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <div className="sm-chat__field">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    maxLength={2000}
                    placeholder={fr ? 'Votre question…' : 'Your question…'}
                    aria-label={fr ? 'Votre question' : 'Your question'}
                    disabled={loading || sent >= maxMessages}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || sent >= maxMessages}
                    aria-label={fr ? 'Envoyer le message' : 'Send message'}
                  >
                    <Send size={17} aria-hidden="true" />
                  </button>
                </div>
                <p className="sm-chat__status">
                  {fr
                    ? `${maxMessages - sent} messages restants`
                    : `${maxMessages - sent} messages remaining`}
                </p>
              </form>
            )}
            <a className="sm-chat__mail sm-stitch" href={`mailto:${contact.email}`}>
              {fr ? 'Contacter Charbel par email' : 'Email Charbel'}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={triggerRef}
        type="button"
        className="sm-chat-toggle"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={toggleLabel}
        aria-expanded={open}
        aria-controls="chatbot-panel"
      >
        {open ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
      </button>
    </>
  );
}

export default Chatbot;
