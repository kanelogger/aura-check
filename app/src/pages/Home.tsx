import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Barbell, BookOpen, Fire } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { getWeeklyDays, FRIEND_RANKINGS, MY_AVATAR, CHECKIN_TYPE_LABELS } from '../data/demo';
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

export default function Home() {
  const navigate = useNavigate();
  const { state } = useCheckIn();
  const weeklyDays = getWeeklyDays();
  const todayCheckIns = state.checkIns.filter(ci => ci.createdAt.startsWith('2025-11-11'));
  const myFitnessCheckIn = todayCheckIns.find(ci => ci.userId === 'young_dreamer' && ci.category === 'fitness');
  const myStudyCheckIn = todayCheckIns.find(ci => ci.userId === 'young_dreamer' && ci.category === 'study');

  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader title="燃起来了！" />

      {/* Date Greeting */}
      <motion.div
        className="pt-2"
        variants={itemVariants}
        style={{
          position: 'sticky',
          top: 'calc(env(safe-area-inset-top, 0px) + 48px)',
          zIndex: 35,
          background: 'linear-gradient(180deg, rgba(244, 249, 246, 0.95) 0%, rgba(244, 249, 246, 0.7) 70%, transparent 100%)',
          backdropFilter: 'blur(12px)',
          paddingBottom: 8,
          marginLeft: -16,
          marginRight: -16,
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        <h2
          className="text-[24px] font-bold leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          11月11日 星期二
        </h2>
        <p
          className="text-[13px] mt-1"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
        >
          早安，金梦！新的一天，加油 💪
        </p>
      </motion.div>

      {/* Weekly Strip */}
      <motion.div
        className="flex overflow-x-auto snap-x snap-mandatory mt-3 px-2"
        variants={itemVariants}
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {weeklyDays.map((day) => (
          <div
            key={day.dayName}
            className="flex-shrink-0 snap-center flex flex-col items-center gap-1.5"
            style={{ width: 48, padding: '8px 0' }}
          >
            <span
              className="text-[11px] font-medium"
              style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}
            >
              周{day.dayName}
            </span>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 32,
                height: 32,
                background: day.isToday ? 'rgba(78, 205, 196, 0.12)' : 'transparent',
              }}
            >
              <span
                className="text-[13px]"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: day.isToday ? 'var(--accent-mint-deep)' : 'var(--text-secondary)',
                  fontWeight: day.isToday ? 700 : 400,
                }}
              >
                {day.dayOfMonth}
              </span>
            </div>
            {day.isChecked && (
              <div
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: 'var(--accent-mint)',
                  marginTop: 2,
                }}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Today CheckIn Card */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <GlassCard className="p-4">
          {state.todayStatus === 'pending' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center justify-center rounded-full" style={{ opacity: 0.3 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l2.5 2.5L16 9" />
                </svg>
              </div>
              <p
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
              >
                今天还没打卡哦
              </p>
              <motion.button
                className="px-5 py-2 rounded-full text-[13px] font-medium text-white"
                style={{
                  background: 'var(--accent-mint-deep)',
                  boxShadow: '0 2px 8px rgba(78, 205, 196, 0.25)',
                  fontFamily: 'var(--font-chinese)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={springTransition}
                onClick={() => navigate('/checkin')}
              >
                去打卡 →
              </motion.button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <Avatar src={MY_AVATAR} size={40} border="2px solid var(--accent-mint)" />
                <div>
                  <span
                    className="text-[13px] font-medium block"
                    style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                  >
                    young dreamer
                  </span>
                  <span
                    className="text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-0.5"
                    style={{
                      color: 'var(--accent-mint)',
                      background: 'rgba(168, 230, 207, 0.2)',
                      fontFamily: 'var(--font-chinese)',
                    }}
                  >
                    连续 5 天 <Fire size={12} weight="fill" color="#FF8A80" />
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl p-2.5" style={{ background: 'rgba(168, 230, 207, 0.08)' }}>
                  <Barbell size={18} color="var(--accent-mint-deep)" />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>健身</p>
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}>
                    {myFitnessCheckIn ? '已打卡 ✓' : '未打卡'}
                  </p>
                  {myFitnessCheckIn && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {myFitnessCheckIn.emoji} {myFitnessCheckIn.note || '开心'}
                    </p>
                  )}
                </div>
                <div className="rounded-xl p-2.5" style={{ background: 'rgba(255, 138, 128, 0.06)' }}>
                  <BookOpen size={18} color="var(--accent-salmon)" />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>学习</p>
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: myStudyCheckIn ? 'var(--accent-mint-deep)' : 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                    {myStudyCheckIn ? '已打卡 ✓' : '未打卡'}
                  </p>
                  {myStudyCheckIn && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {myStudyCheckIn.emoji} {myStudyCheckIn.note || '充实'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '打卡', icon: '✏️', path: '/checkin', color: 'var(--accent-mint-deep)' },
            { label: '挑战', icon: '🏆', path: '/discover', color: 'var(--accent-gold)' },
            { label: '排行', icon: '📊', path: '/friends', color: '#FF8A80' },
            { label: '发现', icon: '🔥', path: '/discover', color: '#4ECDC4' },
          ].map((item) => (
            <motion.button
              key={item.label}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
            >
              <span className="text-[20px]">{item.icon}</span>
              <span
                className="text-[11px] font-medium"
                style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
              >
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Friend Feed */}
      <motion.div className="px-4 mt-5" variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold"
            style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
          >
            好友动态
          </h3>
          <button
            className="text-[11px] font-medium"
            style={{ color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
            onClick={() => navigate('/friends')}
          >
            查看全部
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {state.checkIns.slice(0, 4).map((ci, i) => (
            <motion.div
              key={ci.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
            >
              <GlassCard className="p-3.5 overflow-hidden">
                {/* Photo check-in */}
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
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: ci.category === 'fitness' ? 'rgba(168,230,207,0.2)' : 'rgba(255,138,128,0.12)',
                          color: ci.category === 'fitness' ? 'var(--accent-mint-deep)' : 'var(--accent-salmon)',
                          fontFamily: 'var(--font-chinese)',
                        }}
                      >
                        {CHECKIN_TYPE_LABELS[ci.checkInType]?.emoji} {CHECKIN_TYPE_LABELS[ci.checkInType]?.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {ci.createdAt.includes('T') ? ci.createdAt.split('T')[1].slice(0, 5) : '昨天'}
                  </span>
                </div>

                {/* Quantity display */}
                {ci.quantityValue && ci.quantityUnit && (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="text-[22px] font-bold"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}
                    >
                      {ci.quantityValue}
                      <span className="text-[13px] font-medium ml-0.5">{ci.quantityUnit}</span>
                    </span>
                  </div>
                )}

                {/* Timer display */}
                {ci.timerDuration && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="text-[14px] font-medium px-2.5 py-1 rounded-lg"
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
                <div className="flex items-center justify-between mt-2">
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
                  <LikeButton checkInId={ci.id} likes={ci.likes} />
                </div>

                {/* Comments */}
                {ci.comments.length > 0 && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--divider)' }}>
                    <CommentSection checkInId={ci.id} comments={ci.comments} compact />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Streak + Rank Preview */}
      <motion.div className="px-4 mt-5 grid grid-cols-2 gap-3" variants={itemVariants}>
        <motion.div whileTap={{ scale: 0.97 }} transition={springTransition}>
          <GlassCard className="p-4 flex flex-col items-center text-center">
            <Fire size={28} weight="fill" color="#FF8A80" />
            <span
              className="text-[28px] font-bold mt-1 leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}
            >
              5
            </span>
            <span
              className="text-[11px] mt-1"
              style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}
            >
              连续天数
            </span>
          </GlassCard>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.97 }}
          transition={springTransition}
          onClick={() => navigate('/friends')}
        >
          <GlassCard className="p-4">
            <span
              className="text-[13px] font-medium block"
              style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
            >
              好友排行
            </span>
            <div className="flex items-center mt-2">
              {FRIEND_RANKINGS.slice(0, 3).map((f, i) => (
                <Avatar
                  key={f.id}
                  src={f.avatar}
                  size={28}
                  border="2px solid #fff"
                  className={i > 0 ? '-ml-2' : ''}
                />
              ))}
            </div>
            <span
              className="text-[11px] font-medium mt-2 block"
              style={{ color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
            >
              查看全部 →
            </span>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
