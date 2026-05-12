import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Barbell, BookOpen, Fire, Microphone } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { getWeeklyDays, FRIEND_RANKINGS, MY_AVATAR, MY_GOALS, PUSH_QUOTES } from '../data/demo';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
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

// 环形进度条
function CircularProgress({ value, max, size = 80, strokeWidth = 8, color }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string;
}) {
  const pct = Math.min(value / max, 1);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(26,60,52,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {value}/{max}
        </span>
      </div>
    </div>
  );
}

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
      <StickyHeader title="翻起来吧" />

      {/* ===== 目标宣言 + 进度区域 ===== */}
      <motion.div className="px-4 mt-2" variants={itemVariants}>
        <GlassCard className="p-4 relative overflow-hidden">
          {/* 背景火焰装饰 */}
          <div className="absolute -right-4 -top-4 text-[80px] opacity-[0.06] select-none">🔥</div>

          {/* 目标宣言 */}
          <div className="flex items-start gap-3">
            <Avatar src={MY_AVATAR} size={44} border="2px solid var(--accent-mint)" />
            <div className="flex-1 min-w-0">
              <h2
                className="text-[15px] font-semibold leading-snug"
                style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
              >
                {MY_GOALS.mantra}
              </h2>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                你的自律宣言
              </p>
            </div>
          </div>

          {/* 本周进度环形 */}
          <div className="flex items-center justify-around mt-4 pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
            <div className="flex flex-col items-center gap-1.5">
              <CircularProgress
                value={MY_GOALS.weeklyFitnessDone}
                max={MY_GOALS.weeklyFitness}
                size={72}
                strokeWidth={6}
                color="#FF8A80"
              />
              <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}>
                <Barbell size={12} color="#FF8A80" /> 本周健身
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <CircularProgress
                value={MY_GOALS.weeklyStudyDone}
                max={MY_GOALS.weeklyStudy}
                size={72}
                strokeWidth={6}
                color="#4ECDC4"
              />
              <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}>
                <BookOpen size={12} color="#4ECDC4" /> 本周学习
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <CircularProgress
                value={MY_GOALS.monthDone}
                max={MY_GOALS.monthTarget}
                size={72}
                strokeWidth={6}
                color="#FFD54F"
              />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}>
                本月打卡
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ===== 鞭策语录 ===== */}
      <motion.div className="px-4 mt-3" variants={itemVariants}>
        <motion.div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,138,128,0.12) 0%, rgba(78,205,196,0.08) 100%)',
            border: '1px solid rgba(255,138,128,0.15)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-[24px] flex-shrink-0">⚡</span>
          <p className="text-[13px] font-medium leading-snug" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
            {PUSH_QUOTES[0]}
          </p>
        </motion.div>
      </motion.div>

      {/* ===== 周历 + 今日状态 ===== */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <div className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {weeklyDays.map((day) => (
            <div
              key={day.dayName}
              className="flex-shrink-0 snap-center flex flex-col items-center gap-1"
              style={{ width: 48, padding: '6px 0' }}
            >
              <span className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>
                周{day.dayName}
              </span>
              <div
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 32,
                  height: 32,
                  background: day.isToday ? 'var(--accent-mint-deep)' : day.isChecked ? 'rgba(168,230,207,0.2)' : 'transparent',
                  boxShadow: day.isToday ? '0 2px 8px rgba(78,205,196,0.3)' : 'none',
                }}
              >
                <span
                  className="text-[13px]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: day.isToday ? '#fff' : 'var(--text-secondary)',
                    fontWeight: day.isToday ? 700 : 400,
                  }}
                >
                  {day.dayOfMonth}
                </span>
              </div>
              {day.isChecked && (
                <div className="rounded-full" style={{ width: 4, height: 4, background: 'var(--accent-mint)', marginTop: 1 }} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ===== 今日打卡状态 ===== */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <GlassCard className="p-4">
          {state.todayStatus === 'pending' ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
                  今天还没打卡
                </p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>
                  Stars已经动了，你还在等？
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(124,77,255,0.1))', boxShadow: '0 2px 8px rgba(124,77,255,0.15)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/ai-chat')}
                >
                  <Microphone size={22} color="#7C4DFF" />
                </motion.button>
                <motion.button
                  className="h-12 px-5 rounded-2xl text-[13px] font-medium text-white flex items-center gap-1.5"
                  style={{
                    background: 'var(--accent-mint-deep)',
                    boxShadow: '0 2px 12px rgba(78, 205, 196, 0.3)',
                    fontFamily: 'var(--font-chinese)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={springTransition}
                  onClick={() => navigate('/checkin')}
                >
                  <Fire size={16} weight="fill" />
                  去打卡
                </motion.button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <Avatar src={MY_AVATAR} size={40} border="2px solid var(--accent-mint)" />
                <div>
                  <span className="text-[13px] font-medium block" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                    金梦young dreamer
                  </span>
                  <span
                    className="text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-0.5"
                    style={{ color: 'var(--accent-mint)', background: 'rgba(168,230,207,0.2)', fontFamily: 'var(--font-chinese)' }}
                  >
                    连续 5 天 <Fire size={12} weight="fill" color="#FF8A80" />
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl p-2.5" style={{ background: 'rgba(168,230,207,0.08)' }}>
                  <Barbell size={18} color="var(--accent-mint-deep)" />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>健身</p>
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}>
                    {myFitnessCheckIn ? '已打卡' : '未打卡'}
                  </p>
                </div>
                <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,138,128,0.06)' }}>
                  <BookOpen size={18} color="var(--accent-salmon)" />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>学习</p>
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: myStudyCheckIn ? 'var(--accent-mint-deep)' : 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                    {myStudyCheckIn ? '已打卡' : '未打卡'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ===== 快捷入口（3格 + AI语音浮动气泡） ===== */}
      <motion.div className="px-4 mt-4" variants={itemVariants}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '打卡', icon: '✏️', path: '/checkin', color: 'var(--accent-mint-deep)', bg: 'rgba(168,230,207,0.15)' },
            { label: '挑战', icon: '🏆', path: '/discover', color: 'var(--accent-gold)', bg: 'rgba(255,213,79,0.1)' },
            { label: '排行', icon: '📊', path: '/friends', color: '#FF8A80', bg: 'rgba(255,138,128,0.08)' },
          ].map((item) => (
            <motion.button
              key={item.label}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl"
              style={{ background: item.bg, border: '1px solid rgba(255,255,255,0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
            >
              <span className="text-[20px]">{item.icon}</span>
              <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: item.color }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ===== AI语音浮动气泡 ===== */}
      <motion.div
        className="flex justify-center mt-3"
        variants={itemVariants}
      >
        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium text-white"
          style={{
            background: 'linear-gradient(135deg, #4ECDC4, #7C4DFF)',
            boxShadow: '0 3px 12px rgba(124,77,255,0.25)',
            fontFamily: 'var(--font-chinese)',
          }}
          whileTap={{ scale: 0.92 }}
          animate={{ boxShadow: ['0 3px 12px rgba(124,77,255,0.2)', '0 3px 20px rgba(124,77,255,0.35)', '0 3px 12px rgba(124,77,255,0.2)'] }}
          transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
          onClick={() => navigate('/ai-chat')}
        >
          <span className="text-[16px]">🃏</span>
          cue一下翻一翻
        </motion.button>
      </motion.div>

      {/* ===== 底部排行预览 ===== */}
      <motion.div className="px-4 mt-5 grid grid-cols-2 gap-3" variants={itemVariants}>
        <motion.div whileTap={{ scale: 0.97 }} transition={springTransition}>
          <GlassCard className="p-4 flex flex-col items-center text-center">
            <Fire size={28} weight="fill" color="#FF8A80" />
            <span className="text-[28px] font-bold mt-1 leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}>5</span>
            <span className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>连续天数</span>
          </GlassCard>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }} transition={springTransition} onClick={() => navigate('/friends')}>
          <GlassCard className="p-4">
            <span className="text-[13px] font-medium block" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>好友排行</span>
            <div className="flex items-center mt-2">
              {FRIEND_RANKINGS.slice(0, 3).map((f, i) => (
                <Avatar key={f.id} src={f.avatar} size={28} border="2px solid #fff" className={i > 0 ? '-ml-2' : ''} />
              ))}
            </div>
            <span className="text-[11px] font-medium mt-2 block" style={{ color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}>查看全部</span>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
