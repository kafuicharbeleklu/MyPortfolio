import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

type SettleProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Titles rise from behind a mask, like the hero title, instead of fading in. */
  rise?: boolean;
};

const ease = [0.19, 1, 0.22, 1] as const;

/** Scroll-in wrapper: the block settles into place once, slowly. */
export default function Settle({ children, className, delay = 0, rise = false }: SettleProps) {
  const reduced = usePrefersReducedMotion();
  const maskRef = useRef<HTMLDivElement>(null);
  // The mask is observed rather than its content, which starts shifted out of view.
  const maskInView = useInView(maskRef, { once: true, amount: 0.3 });

  if (rise) {
    return (
      <div ref={maskRef} className={className ? `sm-mask ${className}` : 'sm-mask'}>
        <motion.div
          initial={reduced ? false : { y: '105%' }}
          animate={{ y: reduced || maskInView ? 0 : '105%' }}
          transition={{ duration: 0.9, delay: reduced ? 0 : delay, ease }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: reduced ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}
