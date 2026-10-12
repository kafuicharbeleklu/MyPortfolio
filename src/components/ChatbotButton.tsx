import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Language } from '../translations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const endpoint = (import.meta.env.VITE_CHATBOT_API_URL || '').trim().replace(/\/+$/, '');
const apiUrl = endpoint ? (endpoint.endsWith('/api/chat') ? endpoint : `${endpoint}/api/chat`) : '';
type Message = { text: string; isUser: boolean };
const maxMessages = 10;

export default function ChatbotButton({ lang }: { lang: Language }) {
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
    if (open) inputRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages, loading, reduced]);

  const send = async () => {
    const message = input.trim();
    if (!message || loading || sent >= maxMessages || !apiUrl) return;
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
      if (response.status === 429) throw new Error('rate-limit');
      const payload = await response.json();
      if (!response.ok || typeof payload.reply !== 'string' || !payload.reply.trim())
        throw new Error('unavailable');
      setMessages((value) => [...value, { text: payload.reply.trim(), isUser: false }]);
    } catch (error) {
      const limited = error instanceof Error && error.message === 'rate-limit';
      setMessages((value) => [
        ...value,
        {
          isUser: false,
          text: limited
            ? fr
              ? 'La limite de messages est atteinte. Vous pouvez me contacter directement par email.'
              : 'The message limit has been reached. You can contact me directly by email.'
            : fr
              ? 'L’assistant est momentanément indisponible. Réessayez plus tard ou contactez-moi par email.'
              : 'The assistant is temporarily unavailable. Please try later or contact me by email.',
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-window"
            id="chatbot-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chatbot-title"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chat-header">
              <div className="chat-header-left">
                <span className="studio-status-dot" />
                <h3 id="chatbot-title">
                  {apiUrl
                    ? fr
                      ? 'L’assistant de Charbel'
                      : 'Charbel’s assistant'
                    : fr
                      ? 'Faisons connaissance'
                      : 'Let’s connect'}
                </h3>
              </div>
              <button
                className="chat-close-btn"
                onClick={close}
                aria-label={fr ? 'Fermer la conversation' : 'Close conversation'}
              >
                <X size={19} />
              </button>
            </div>
            <div className="chat-messages" role="log" aria-live="polite" aria-busy={loading}>
              <div className="chat-bubble bot">
                {apiUrl
                  ? fr
                    ? 'Bonjour ! Je suis l’assistant IA de Charbel. Posez-moi une question sur son parcours, ses compétences ou ses projets.'
                    : 'Hello! I’m Charbel’s AI assistant. Ask me about his background, skills or projects.'
                  : fr
                    ? 'Un projet, une opportunité ou simplement une question ? Échangeons directement.'
                    : 'A project, an opportunity, or a question? Let’s talk directly.'}
              </div>
              {messages.map((message, index) => (
                <div className={'chat-bubble ' + (message.isUser ? 'user' : 'bot')} key={index}>
                  {message.text}
                </div>
              ))}
              {loading && (
                <p className="studio-chat-loading" role="status">
                  {fr ? 'Réponse en cours…' : 'Thinking…'}
                </p>
              )}
              <div ref={endRef} />
            </div>
            {apiUrl && (
              <form
                className="studio-chat-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <div className="studio-chat-input-row">
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
                    <Send size={17} />
                  </button>
                </div>
                <p>
                  {fr
                    ? `${maxMessages - sent} messages restants`
                    : `${maxMessages - sent} messages remaining`}
                </p>
              </form>
            )}
            <a className="studio-chat-contact" href="mailto:charbelkafuieklu@gmail.com">
              {fr ? 'Contacter Charbel par email' : 'Email Charbel'}
              <ArrowUpRight size={15} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={triggerRef}
        type="button"
        className="chat-fab"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={
          open
            ? fr
              ? 'Fermer la conversation'
              : 'Close conversation'
            : fr
              ? 'Ouvrir la conversation'
              : 'Open conversation'
        }
        aria-expanded={open}
        aria-controls="chatbot-panel"
      >
        {open ? <X size={25} /> : <MessageCircle size={25} />}
      </button>
    </>
  );
}
