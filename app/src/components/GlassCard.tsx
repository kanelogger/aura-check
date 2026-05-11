import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  noIso?: boolean;
}

export default function GlassCard({ children, className = '', onClick, noIso }: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-[20px] border border-white/[0.8] ${className}`}
      style={{
        background: 'var(--card-bg)',
        boxShadow: 'var(--shadow-soft)',
        backdropFilter: 'blur(12px) saturate(140%)',
      }}
      whileHover={onClick ? { scale: 1.01, boxShadow: 'var(--shadow-float)' } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={onClick}
    >
      {children}
      {!noIso && (
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none -z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(168,230,207,0.08) 0%, rgba(78,205,196,0.04) 100%)',
            transform: 'translate(3px, 4px)',
            filter: 'blur(6px)',
            opacity: 0.6,
          }}
        />
      )}
    </motion.div>
  );
}
