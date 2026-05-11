import { motion } from 'framer-motion';
import { Heart } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';

interface LikeButtonProps {
  checkInId: string;
  likes: number;
}

export default function LikeButton({ checkInId, likes }: LikeButtonProps) {
  const { state, toggleLike } = useCheckIn();
  const isLiked = state.likes[checkInId] || false;

  return (
    <motion.button
      className="flex items-center gap-1.5 select-none"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(checkInId);
      }}
      whileTap={{ scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <Heart
        size={18}
        weight={isLiked ? 'fill' : 'regular'}
        color={isLiked ? '#E53935' : 'var(--text-muted)'}
      />
      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        {likes}
      </span>
    </motion.button>
  );
}
