import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StickyHeaderProps {
  title: string;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
}

export default function StickyHeader({ title, rightAction, leftAction }: StickyHeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-40 flex items-center justify-between px-4"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        height: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        background: 'linear-gradient(180deg, rgba(244, 249, 246, 0.95) 0%, rgba(244, 249, 246, 0.7) 70%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="flex items-center gap-2">
        {leftAction}
        <h1
          className="text-[20px] font-semibold leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h1>
      </div>
      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </motion.header>
  );
}
