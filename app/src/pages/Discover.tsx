import { motion } from 'framer-motion';
import { Plus, Users, Trophy } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { CHALLENGES, BADGES } from '../data/demo';
import GlassCard from '../components/GlassCard';
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

export default function Discover() {
  const { showToast } = useCheckIn();
  const unlockedBadges = BADGES.filter(b => b.isUnlocked);

  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader title="发现" />

      {/* Challenges Section */}
      <motion.div className="px-4 mt-2" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
          >
            <Trophy size={18} color="var(--accent-gold)" weight="fill" />
            打卡挑战
          </h3>
          <span
            className="text-[11px]"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}
          >
            {CHALLENGES.filter(c => c.isJoined).length} 进行中
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {CHALLENGES.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, ...springTransition }}
            >
              <GlassCard className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
                    style={{ background: ch.isJoined ? 'rgba(168,230,207,0.2)' : 'rgba(255,255,255,0.5)' }}
                  >
                    {ch.coverEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className="text-[14px] font-medium"
                        style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                      >
                        {ch.title}
                      </h4>
                      {ch.isJoined && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: 'rgba(78,205,196,0.12)',
                            color: 'var(--accent-mint-deep)',
                            fontFamily: 'var(--font-chinese)',
                          }}
                        >
                          进行中
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px] mt-0.5 leading-relaxed"
                      style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
                    >
                      {ch.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Users size={12} color="var(--text-tertiary)" />
                        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                          {ch.participants}人参与
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {ch.durationDays}天
                      </span>
                    </div>
                    {/* Progress bar */}
                    {ch.isJoined && (
                      <div className="mt-2">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'rgba(26,60,52,0.06)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-mint-deep)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${ch.progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                        <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-tertiary)' }}>
                          {ch.progress}%
                        </p>
                      </div>
                    )}
                    {!ch.isJoined && (
                      <motion.button
                        className="mt-2 flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full"
                        style={{
                          background: 'var(--accent-mint-deep)',
                          color: '#fff',
                          fontFamily: 'var(--font-chinese)',
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => showToast(`已加入「${ch.title}」挑战！`)}
                      >
                        <Plus size={14} weight="bold" />
                        加入挑战
                      </motion.button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div className="px-4 mt-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
          >
            <Trophy size={18} color="var(--accent-gold)" weight="fill" />
            成就徽章
          </h3>
          <span
            className="text-[11px]"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}
          >
            {unlockedBadges.length}/{BADGES.length} 已解锁
          </span>
        </div>

        {/* Unlocked badges */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.id}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.04, ...springTransition }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-[24px] mb-1.5"
                style={{
                  background: badge.isUnlocked ? `${badge.color}25` : 'rgba(26,60,52,0.04)',
                  opacity: badge.isUnlocked ? 1 : 0.4,
                }}
              >
                {badge.emoji}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  fontFamily: 'var(--font-chinese)',
                  color: badge.isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {badge.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <GlassCard className="p-5 text-center">
          <p
            className="text-[14px] leading-relaxed"
            style={{
              fontFamily: 'var(--font-chinese)',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            "习惯是自我提高的复利，每天进步1%，一年后你会强大37倍。"
          </p>
          <p
            className="text-[11px] mt-2"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}
          >
            ——《原子习惯》
          </p>
        </GlassCard>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
