import { AnimatePresence, motion } from 'framer-motion';
import { useCheckIn } from '../hooks/useCheckInState';

export default function Toast() {
  const { state } = useCheckIn();

  return (
    <AnimatePresence>
      {state.toast?.visible && (
        <motion.div
          className="fixed left-1/2 z-[200] px-5 py-2.5 rounded-full text-white text-[13px] font-medium whitespace-nowrap"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 56px)',
            background: 'rgba(26, 60, 52, 0.85)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            fontFamily: 'var(--font-chinese)',
          }}
          initial={{ x: '-50%', y: -20, opacity: 0, scale: 0.95 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: -10, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {state.toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
