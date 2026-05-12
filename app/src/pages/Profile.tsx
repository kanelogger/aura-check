import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShareNetwork, Info, CaretRight } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { MY_AVATAR } from '../data/demo';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import StickyHeader from '../components/StickyHeader';

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

const SETTINGS = [
  { icon: Bell, color: 'var(--accent-salmon)', label: '打卡提醒', hasToggle: true },
  { icon: ShareNetwork, color: 'var(--accent-mint-deep)', label: '邀请好友', hasToggle: false },
  { icon: Info, color: 'var(--text-tertiary)', label: '关于 翻起来吧', hasToggle: false },
];

export default function Profile() {
  const { showToast } = useCheckIn();
  const [reminderOn, setReminderOn] = useState(true);

  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader title="我的" />

      {/* User Info Card */}
      <motion.div className="px-4 mt-2" variants={itemVariants}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <Avatar
              src={MY_AVATAR}
              size={64}
              border="3px solid var(--accent-mint)"
            />
            <div>
              <h2
                className="text-[18px] font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                金梦young dreamer
              </h2>
              <p
                className="text-[12px] mt-1"
                style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}
              >
                拖延症蜕变者
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Settings List */}
      <motion.div className="px-4 mt-5" variants={itemVariants}>
        <GlassCard className="overflow-hidden" noIso>
          {SETTINGS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  borderBottom: i < SETTINGS.length - 1 ? '1px solid var(--divider)' : 'none',
                }}
                whileTap={{ backgroundColor: 'rgba(234, 243, 238, 0.5)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                onClick={() => {
                  if (item.label === '打卡提醒') {
                    setReminderOn(!reminderOn);
                    showToast(`打卡提醒${!reminderOn ? '已开启' : '已关闭'} 🔔`);
                  } else if (item.label === '邀请好友') {
                    showToast('邀请链接已复制 📋');
                  } else {
                    showToast('翻起来吧 v3.0 🎉');
                  }
                }}
              >
                <Icon size={20} color={item.color} />
                <span
                  className="text-[13px] font-medium flex-1"
                  style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                >
                  {item.label}
                </span>
                {item.hasToggle ? (
                  <div
                    className="w-11 h-6 rounded-full relative transition-colors"
                    style={{
                      background: reminderOn ? 'var(--accent-mint-deep)' : 'var(--text-muted)',
                    }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ left: reminderOn ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  </div>
                ) : (
                  <CaretRight size={16} color="var(--text-tertiary)" />
                )}
              </motion.button>
            );
          })}
        </GlassCard>
      </motion.div>

      <div className="h-6" />
    </motion.div>
  );
}
