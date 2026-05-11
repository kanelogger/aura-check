import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Barbell, BookOpen, Confetti, Image, Play, Pause, ArrowCounterClockwise } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { EMOJI_MOODS, MY_AVATAR } from '../data/demo';
import type { EmojiMood } from '../types';
import StickyHeader from '../components/StickyHeader';

const springTransition = { type: 'spring' as const, stiffness: 350, damping: 25 };
const jellySpring = { type: 'spring' as const, stiffness: 150, damping: 12, mass: 0.8 };

const CHECKIN_TYPES = [
  { type: 'text' as const, label: '文字', emoji: '📝', desc: '简单记录' },
  { type: 'photo' as const, label: '图文', emoji: '📸', desc: '拍照证明' },
  { type: 'timer' as const, label: '专注', emoji: '⏱️', desc: '计时打卡' },
  { type: 'quantity' as const, label: '量化', emoji: '📊', desc: '记录数据' },
];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 25, staggerChildren: 0.06 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function CheckIn() {
  const navigate = useNavigate();
  const {
    state,
    setSelectedCategory,
    setSelectedMood,
    setCheckInNote,
    setCheckInType,
    setTimerDuration,
    setQuantityValue,
    setQuantityUnit,
    addCheckIn,
  } = useCheckIn();

  const [localMood, setLocalMood] = useState<EmojiMood>(state.selectedMood);
  const [localNote, setLocalNote] = useState('');
  const [localQty, setLocalQty] = useState('');
  const [localUnit, setLocalUnit] = useState('km');
  const [showModal, setShowModal] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerMin, setTimerMin] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSec(prev => {
          if (prev >= 59) {
            setTimerMin(m => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSec(0);
    setTimerMin(0);
  };

  const handleCheckIn = () => {
    setSelectedMood(localMood);
    setCheckInNote(localNote);
    if (state.checkInType === 'timer') {
      setTimerDuration(timerMin);
    }
    if (state.checkInType === 'quantity') {
      setQuantityValue(Number(localQty) || 0);
      setQuantityUnit(localUnit);
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    const newCheckIn = {
      id: `yd-${Date.now()}`,
      userId: 'young_dreamer',
      userName: '金梦young dreamer',
      userAvatar: MY_AVATAR,
      category: state.selectedCategory,
      checkInType: state.checkInType,
      emoji: localMood.emoji,
      note: localNote || (state.selectedCategory === 'fitness' ? '健身打卡' : '学习打卡'),
      photoUrl: state.checkInType === 'photo'
        ? 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'
        : undefined,
      timerDuration: state.checkInType === 'timer' ? timerMin || 25 : undefined,
      quantityValue: state.checkInType === 'quantity' ? (Number(localQty) || 0) : undefined,
      quantityUnit: state.checkInType === 'quantity' ? localUnit : undefined,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: `2025-11-11T${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:00`,
    };
    addCheckIn(newCheckIn);
    setShowModal(false);
    setTimeout(() => navigate('/'), 300);
  };

  return (
    <motion.div
      className="min-h-full pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StickyHeader
        title="打卡"
        leftAction={
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
            <ArrowLeft size={22} color="var(--text-secondary)" />
          </motion.button>
        }
      />

      {/* CheckIn Type Selector */}
      <motion.div className="px-4 mt-3" variants={itemVariants}>
        <p
          className="text-[13px] font-medium mb-2"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
        >
          选择打卡形式
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CHECKIN_TYPES.map((t) => (
            <motion.button
              key={t.type}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
              style={{
                background: state.checkInType === t.type ? 'rgba(168,230,207,0.2)' : 'rgba(255,255,255,0.5)',
                border: state.checkInType === t.type ? '2px solid var(--accent-mint-deep)' : '2px solid transparent',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCheckInType(t.type)}
            >
              <span className="text-[22px]">{t.emoji}</span>
              <span
                className="text-[11px] font-medium"
                style={{
                  fontFamily: 'var(--font-chinese)',
                  color: state.checkInType === t.type ? 'var(--accent-mint-deep)' : 'var(--text-secondary)',
                }}
              >
                {t.label}
              </span>
              <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                {t.desc}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Category Picker */}
      <motion.div className="px-4 mt-5" variants={itemVariants}>
        <p
          className="text-[13px] font-medium mb-2"
          style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
        >
          选择类别
        </p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            className="flex flex-col items-center gap-2 rounded-[20px] py-4 transition-all"
            style={{
              background: state.selectedCategory === 'fitness' ? 'rgba(168,230,207,0.25)' : 'rgba(168,230,207,0.15)',
              border: state.selectedCategory === 'fitness' ? '2px solid var(--accent-mint-deep)' : '2px solid transparent',
              boxShadow: state.selectedCategory === 'fitness' ? '0 0 0 3px rgba(78,205,196,0.15)' : 'none',
            }}
            whileTap={{ scale: 0.97 }}
            transition={springTransition}
            onClick={() => setSelectedCategory('fitness')}
          >
            <Barbell size={28} color="var(--accent-mint-deep)" weight={state.selectedCategory === 'fitness' ? 'fill' : 'regular'} />
            <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
              健身
            </span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center gap-2 rounded-[20px] py-4 transition-all"
            style={{
              background: state.selectedCategory === 'study' ? 'rgba(255,138,128,0.18)' : 'rgba(255,138,128,0.1)',
              border: state.selectedCategory === 'study' ? '2px solid var(--accent-salmon)' : '2px solid transparent',
              boxShadow: state.selectedCategory === 'study' ? '0 0 0 3px rgba(255,138,128,0.12)' : 'none',
            }}
            whileTap={{ scale: 0.97 }}
            transition={springTransition}
            onClick={() => setSelectedCategory('study')}
          >
            <BookOpen size={28} color="var(--accent-salmon)" weight={state.selectedCategory === 'study' ? 'fill' : 'regular'} />
            <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
              学习
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Timer CheckIn */}
      <AnimatePresence mode="wait">
        {state.checkInType === 'timer' && (
          <motion.div
            key="timer"
            className="px-4 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="rounded-[20px] p-6 flex flex-col items-center"
              style={{ background: 'rgba(168,230,207,0.1)', border: '1px solid rgba(168,230,207,0.2)' }}
            >
              <div
                className="text-[48px] font-bold tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {String(timerMin).padStart(2, '0')}:{String(timerSec).padStart(2, '0')}
              </div>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                {timerRunning ? '专注中...' : timerMin > 0 ? '已专注' + timerMin + '分钟' : '点击开始专注计时'}
              </p>
              <div className="flex items-center gap-3 mt-4">
                {!timerRunning ? (
                  <motion.button
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-[13px] font-medium"
                    style={{ background: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimerRunning(true)}
                  >
                    <Play size={16} weight="fill" />
                    开始
                  </motion.button>
                ) : (
                  <motion.button
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-[13px] font-medium"
                    style={{ background: '#FF8A80', fontFamily: 'var(--font-chinese)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimerRunning(false)}
                  >
                    <Pause size={16} weight="fill" />
                    暂停
                  </motion.button>
                )}
                <motion.button
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium"
                  style={{ background: 'rgba(26,60,52,0.06)', color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                >
                  <ArrowCounterClockwise size={16} />
                  重置
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quantity CheckIn */}
        {state.checkInType === 'quantity' && (
          <motion.div
            key="quantity"
            className="px-4 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[13px] font-medium mb-3" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
              记录数据
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="flex-1 h-14 rounded-2xl text-center text-[24px] font-bold outline-none"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid var(--divider)',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                }}
                placeholder="0"
                value={localQty}
                onChange={(e) => setLocalQty(e.target.value)}
              />
              <select
                className="h-14 px-4 rounded-2xl text-[14px] font-medium outline-none appearance-none"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid var(--divider)',
                  fontFamily: 'var(--font-chinese)',
                  color: 'var(--text-primary)',
                }}
                value={localUnit}
                onChange={(e) => setLocalUnit(e.target.value)}
              >
                {state.selectedCategory === 'fitness' ? (
                  <>
                    <option value="km">公里</option>
                    <option value="min">分钟</option>
                    <option value="组">组</option>
                    <option value="次">次</option>
                    <option value="kg">公斤</option>
                  </>
                ) : (
                  <>
                    <option value="页">页</option>
                    <option value="min">分钟</option>
                    <option value="章">章</option>
                    <option value="个">个</option>
                    <option value="题">题</option>
                  </>
                )}
              </select>
            </div>
          </motion.div>
        )}

        {/* Photo CheckIn hint */}
        {state.checkInType === 'photo' && (
          <motion.div
            key="photo"
            className="px-4 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="rounded-[20px] p-8 flex flex-col items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.5)', border: '2px dashed var(--divider)' }}
            >
              <Image size={36} color="var(--text-muted)" />
              <p className="text-[13px] text-center" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
                点击上传打卡照片
              </p>
              <p className="text-[11px] text-center" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>
                支持拍照或从相册选择
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Picker */}
      <motion.div className="px-4 mt-5" variants={itemVariants}>
        <p className="text-[13px] font-medium mb-3" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
          今天的心情
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {EMOJI_MOODS.map((mood) => (
            <motion.button
              key={mood.label}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-colors"
              style={{
                width: 56,
                background: localMood.label === mood.label ? 'rgba(78, 205, 196, 0.1)' : 'transparent',
              }}
              whileTap={{ scale: 0.85 }}
              animate={{ scale: localMood.label === mood.label ? 1.05 : 1 }}
              transition={springTransition}
              onClick={() => setLocalMood(mood)}
            >
              <span className="text-[28px] leading-none">{mood.emoji}</span>
              <span
                className="text-[12px]"
                style={{
                  fontFamily: 'var(--font-chinese)',
                  color: localMood.label === mood.label ? 'var(--accent-mint-deep)' : 'var(--text-tertiary)',
                }}
              >
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Note Input */}
      <motion.div className="px-4 mt-5" variants={itemVariants}>
        <p className="text-[13px] font-medium mb-2" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
          打卡备注 (可选)
        </p>
        <textarea
          className="w-full min-h-[80px] p-3 rounded-2xl text-[13px] resize-y outline-none transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid var(--divider)',
            fontFamily: 'var(--font-chinese)',
            color: 'var(--text-primary)',
          }}
          placeholder="记录一下今天的打卡内容..."
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-mint-deep)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--divider)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </motion.div>

      {/* CheckIn Button */}
      <motion.div className="px-4 mt-6 pb-8" variants={itemVariants}>
        <motion.button
          className="w-full h-[52px] rounded-2xl text-white text-[16px] font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'var(--accent-mint-deep)',
            boxShadow: '0 4px 16px rgba(78, 205, 196, 0.3)',
            fontFamily: 'var(--font-chinese)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
          onClick={handleCheckIn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
          确认打卡
        </motion.button>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[100]"
              style={{ background: 'var(--backdrop-modal)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[28px]"
              style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
              initial={{ y: '100%', scale: 0.96, opacity: 0.5 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: '100%', scale: 0.96, opacity: 0.5 }}
              transition={jellySpring}
            >
              <div className="mx-auto mt-3 rounded-full" style={{ width: 36, height: 4, background: 'var(--divider)' }} />
              <div className="px-6 pt-4 pb-2">
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
                >
                  <Confetti size={48} color="var(--accent-mint-deep)" weight="fill" />
                </motion.div>
                <motion.h3
                  className="text-center text-[18px] font-semibold mt-4"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  打卡成功！
                </motion.h3>
                <motion.p
                  className="text-center text-[13px] mt-1.5"
                  style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  连续 6 天，继续保持 💪
                </motion.p>

                {/* Summary */}
                <motion.div
                  className="mt-5 rounded-2xl p-3.5"
                  style={{ background: 'rgba(168, 230, 207, 0.1)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {state.selectedCategory === 'fitness' ? (
                      <Barbell size={18} color="var(--accent-mint-deep)" />
                    ) : (
                      <BookOpen size={18} color="var(--accent-salmon)" />
                    )}
                    <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                      {state.selectedCategory === 'fitness' ? '健身' : '学习'}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(168,230,207,0.15)',
                        color: 'var(--accent-mint-deep)',
                        fontFamily: 'var(--font-chinese)',
                      }}
                    >
                      {state.checkInType === 'text' && '📝 文字'}
                      {state.checkInType === 'photo' && '📸 图文'}
                      {state.checkInType === 'timer' && `⏱️ 专注 ${timerMin}分钟`}
                      {state.checkInType === 'quantity' && `📊 ${localQty}${localUnit}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{localMood.emoji}</span>
                    <span className="text-[13px]" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
                      {localMood.label}
                    </span>
                  </div>
                  {localNote && (
                    <p className="text-[12px] mt-2" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>
                      {localNote}
                    </p>
                  )}
                </motion.div>

                <motion.button
                  className="w-full h-[48px] rounded-2xl text-white text-[15px] font-semibold mt-5"
                  style={{ background: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  太棒了
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
