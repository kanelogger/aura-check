import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown, Fire, ChatCircle } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { FRIEND_RANKINGS, CHECKIN_TYPE_LABELS } from '../data/demo';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import StickyHeader from '../components/StickyHeader';

const springTransition = { type: 'spring' as const, stiffness: 220, damping: 22 };
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function Friends() {
  const { state, showToast } = useCheckIn();
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader
        title="好友"
        rightAction={
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => showToast('邀请好友功能开发中 🚧')}
          >
            <Plus size={22} color="var(--text-secondary)" />
          </motion.button>
        }
      />

      {/* Friend Feed */}
      <motion.div className="px-4 mt-2" variants={itemVariants}>
        <h3
          className="text-[15px] font-semibold mb-3"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
        >
          好友动态
        </h3>
        <div className="flex flex-col gap-3">
          {state.checkIns.map((ci, i) => (
            <motion.div
              key={ci.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, ...springTransition }}
            >
              <GlassCard className="p-3.5 overflow-hidden">
                {/* Photo */}
                {ci.photoUrl && (
                  <div className="mb-3 -mx-3.5 -mt-3.5">
                    <img
                      src={ci.photoUrl}
                      alt="checkin"
                      className="w-full h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Avatar src={ci.userAvatar} size={36} />
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[13px] font-medium block"
                      style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                    >
                      {ci.userName}
                    </span>
                    <span
                      className="text-[10px] inline-flex items-center gap-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {CHECKIN_TYPE_LABELS[ci.checkInType]?.emoji} {CHECKIN_TYPE_LABELS[ci.checkInType]?.label}
                    </span>
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {ci.createdAt.includes('T') ? ci.createdAt.split('T')[1].slice(0, 5) : '昨天'}
                  </span>
                </div>

                {/* Quantity */}
                {ci.quantityValue && ci.quantityUnit && (
                  <div className="mt-2">
                    <span
                      className="text-[20px] font-bold"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}
                    >
                      {ci.quantityValue}
                      <span className="text-[13px] font-medium ml-0.5">{ci.quantityUnit}</span>
                    </span>
                  </div>
                )}

                {/* Timer */}
                {ci.timerDuration && (
                  <div className="mt-2">
                    <span
                      className="text-[13px] font-medium px-2.5 py-1 rounded-lg"
                      style={{
                        background: 'rgba(168,230,207,0.12)',
                        color: 'var(--accent-mint-deep)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      ⏱️ 专注 {ci.timerDuration} 分钟
                    </span>
                  </div>
                )}

                <p
                  className="text-[13px] mt-2 leading-relaxed"
                  style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
                >
                  {ci.note}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <LikeButton checkInId={ci.id} likes={ci.likes} />
                    <motion.button
                      className="flex items-center gap-1"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleComments(ci.id)}
                    >
                      <ChatCircle size={16} color="var(--text-muted)" />
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {ci.comments.length}
                      </span>
                    </motion.button>
                  </div>
                  <span
                    className="text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      color: 'var(--text-tertiary)',
                      background: 'rgba(168, 230, 207, 0.12)',
                      fontFamily: 'var(--font-chinese)',
                    }}
                  >
                    {ci.emoji} {
                      ci.emoji === '😊' ? '开心' :
                      ci.emoji === '📚' ? '充实' :
                      ci.emoji === '🧘' ? '平静' :
                      ci.emoji === '💪' ? '酸痛' : '疲惫'
                    }
                  </span>
                </div>

                {/* Comments */}
                {(expandedComments[ci.id] || ci.comments.length > 0) && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--divider)' }}>
                    <CommentSection
                      checkInId={ci.id}
                      comments={ci.comments}
                      compact={!expandedComments[ci.id]}
                    />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Friend Ranking */}
      <motion.div className="px-4 mt-6" variants={itemVariants}>
        <h3
          className="text-[15px] font-semibold mb-3"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
        >
          好友排行榜
        </h3>
        <div className="flex flex-col gap-2.5">
          {FRIEND_RANKINGS.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05, ...springTransition }}
            >
              <GlassCard className="p-3 flex items-center gap-3">
                <div className="w-8 text-center flex-shrink-0">
                  {f.rank === 1 ? (
                    <Crown size={20} weight="fill" color="#FFD54F" />
                  ) : f.rank === 2 ? (
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#C0C0C0' }}>2</span>
                  ) : f.rank === 3 ? (
                    <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#CD7F32' }}>3</span>
                  ) : (
                    <span className="text-[16px] font-medium" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>{f.rank}</span>
                  )}
                </div>
                <Avatar src={f.avatar} size={40} />
                <span className="text-[13px] font-medium flex-1" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                  {f.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}>
                    {f.streak}
                  </span>
                  <Fire size={14} weight="fill" color="#FF8A80" />
                  <span className="text-[11px] ml-0.5" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>天</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
