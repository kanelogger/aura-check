import { motion } from 'framer-motion';
import { CalendarCheck, Fire, Barbell, BookOpen } from 'phosphor-react';
import { getCalendarGrid } from '../data/demo';
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const MONTHS = [
  { label: '9月', year: 2025, month: 8 },
  { label: '10月', year: 2025, month: 9 },
  { label: '11月', year: 2025, month: 10 },
];

const BENTO_ITEMS = [
  { title: '打卡天数', value: '18', icon: CalendarCheck, color: 'var(--accent-mint-deep)', bg: 'rgba(168, 230, 207, 0.12)' },
  { title: '连续天数', value: '5', icon: Fire, color: '#FF8A80', bg: 'rgba(255, 138, 128, 0.08)' },
  { title: '健身次数', value: '12', icon: Barbell, color: 'var(--accent-mint-deep)', bg: 'rgba(168, 230, 207, 0.12)' },
  { title: '学习次数', value: '6', icon: BookOpen, color: 'var(--accent-salmon)', bg: 'rgba(255, 138, 128, 0.08)' },
];

function MiniCalendar({ year, month, isCurrent }: { year: number; month: number; isCurrent?: boolean }) {
  const days = getCalendarGrid(year, month);
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="relative" style={{ aspectRatio: '1' }}>
      <span
        className="absolute top-2 left-2.5 text-[11px] font-medium"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}
      >
        {MONTHS.find(m => m.year === year && m.month === month)?.label || ''}
      </span>
      <div
        className="grid grid-cols-7 gap-0.5 pt-7 px-1.5 pb-1.5"
        style={{ height: '100%' }}
      >
        {dayLabels.map(d => (
          <div
            key={d}
            className="flex items-center justify-center text-[7px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-chinese)' }}
          >
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          let bg = 'transparent';
          let color = day.isCurrentMonth ? 'var(--text-tertiary)' : 'transparent';
          if (day.isCurrentMonth && day.hasCheckIn) {
            if (day.checkInCategory === 'fitness') bg = 'rgba(168, 230, 207, 0.35)';
            else if (day.checkInCategory === 'study') bg = 'rgba(255, 138, 128, 0.2)';
            color = 'var(--text-primary)';
          }
          if (isCurrent && day.isCurrentMonth && day.dayOfMonth === 11) {
            bg = 'transparent';
            color = 'var(--accent-mint-deep)';
          }
          return (
            <motion.div
              key={idx}
              className="flex items-center justify-center rounded-[3px] text-[8px]"
              style={{
                background: bg,
                color,
                fontFamily: 'var(--font-display)',
                aspectRatio: '1',
                ...(isCurrent && day.isCurrentMonth && day.dayOfMonth === 11
                  ? { border: '1.5px solid var(--accent-gold)', borderRadius: '50%' }
                  : {}),
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.003, duration: 0.2 }}
            >
              {day.isCurrentMonth ? day.dayOfMonth : ''}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader title="统计" />

      {/* Calendar Archive (Memories Archive) */}
      <motion.div className="px-4 mt-2" variants={itemVariants}>
        <h3
          className="text-[15px] font-semibold mb-3"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
        >
          打卡日历
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {MONTHS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, ...springTransition }}
              whileTap={{ scale: 1.02 }}
            >
              <GlassCard className="overflow-hidden" noIso>
                <MiniCalendar year={m.year} month={m.month} isCurrent={i === 2} />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Stats (Bento Grid) */}
      <motion.div className="px-4 mt-6" variants={itemVariants}>
        <h3
          className="text-[15px] font-semibold mb-3"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
        >
          本月统计
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {BENTO_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, ...springTransition }}
                whileTap={{ scale: 1.02 }}
              >
                <GlassCard
                  className="p-4"
                  noIso
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: item.bg }}
                  >
                    <Icon size={22} color={item.color} />
                  </div>
                  <p
                    className="text-[11px] mt-2"
                    style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-[24px] font-bold mt-1 leading-none"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text-primary)',
                      letterSpacing: '-1px',
                    }}
                  >
                    {item.value}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
