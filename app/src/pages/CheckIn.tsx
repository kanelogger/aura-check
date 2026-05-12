import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Barbell, BookOpen, Confetti, Sparkle, Microphone, MicrophoneSlash } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { EMOJI_MOODS, MY_AVATAR, CHECKIN_TYPE_LABELS } from '../data/demo';
import type { EmojiMood } from '../types';
import StickyHeader from '../components/StickyHeader';
import Avatar from '../components/Avatar';

const springTransition = { type: 'spring' as const, stiffness: 350, damping: 25 };
const jellySpring = { type: 'spring' as const, stiffness: 150, damping: 12, mass: 0.8 };

const CHECKIN_TYPES = [
  { type: 'text' as const, label: '文字', emoji: '✏️', desc: '简单记录' },
  { type: 'photo' as const, label: '图文', emoji: '📸', desc: '拍照证明' },
  { type: 'timer' as const, label: '专注', emoji: '⏱️', desc: '计时打卡' },
  { type: 'quantity' as const, label: '量化', emoji: '📊', desc: '记录数据' },
  { type: 'voice' as const, label: 'AI语音', emoji: '🎙️', desc: '语音打卡' },
];

const AI_AVATAR_GRADIENT = 'linear-gradient(135deg, #4ECDC4, #7C4DFF)';

// 打字机效果
function useTypewriter(text: string, speed = 25) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return { displayed, done };
}

// AI对话消息
interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

export default function CheckIn() {
  const navigate = useNavigate();
  const {
    state,
    setSelectedCategory,
    setCheckInType,
    addCheckIn,
    showToast,
  } = useCheckIn();

  // 通用状态
  const [localMood, setLocalMood] = useState<EmojiMood>(EMOJI_MOODS[0]);
  const [localNote, setLocalNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 专注计时状态
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerMin, setTimerMin] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 量化状态
  const [localQty, setLocalQty] = useState('');
  const [localUnit, setLocalUnit] = useState('km');

  // AI语音状态
  const [aiMessages, setAiMessages] = useState<ChatMsg[]>([
    { id: 'init', role: 'ai', content: '嗨金梦！我是你的AI打卡助手 🔥 今天想记录点什么？告诉我你做了什么运动/学习了什么，我来帮你生成打卡记录~' },
  ]);
  const [aiStep, setAiStep] = useState(0);
  const [aiCategory, setAiCategory] = useState<'fitness' | 'study'>('fitness');
  const [aiNote, setAiNote] = useState('');
  // AI quantity state placeholder for future use
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 专注计时逻辑
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSec(prev => {
          if (prev >= 59) { setTimerMin(m => m + 1); return 0; }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // 录音计时逻辑
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    return () => { if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, [isRecording]);

  // AI聊天自动滚动
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiMessages]);

  // ========== AI语音处理 ==========
  const addAiMsg = (role: 'ai' | 'user', content: string) => {
    setAiMessages(prev => [...prev, { id: `${role}-${Date.now()}`, role, content }]);
  };

  const handleAiOption = (option: string) => {
    addAiMsg('user', option);

    if (aiStep === 0) {
      const cat = option === '学习打卡' ? 'study' : 'fitness';
      setAiCategory(cat);
      setTimeout(() => {
        setAiStep(1);
        addAiMsg('ai', cat === 'fitness'
          ? '做了什么运动？跑了多远/练了多久？直接告诉我~'
          : '学了什么？读了多久书/刷了多少题？直接告诉我~');
      }, 500);
    } else if (aiStep === 1) {
      setAiNote(option);
      setTimeout(() => {
        setAiStep(2);
        addAiMsg('ai', '收到！今天心情怎么样？');
      }, 500);
    } else if (aiStep === 2) {
      const moodEmoji = option.split(' ')[0];
      setLocalMood(EMOJI_MOODS.find(m => m.emoji === moodEmoji) || EMOJI_MOODS[0]);
      setTimeout(() => {
        setAiStep(3);
        addAiMsg('ai', `完美！帮你生成的打卡记录：\n📊 ${aiNote || option}\n😊 ${moodEmoji}\n\n确认发布吗？`);
      }, 500);
    } else if (aiStep === 3) {
      if (option === '确认发布') {
        handleAiPublish();
      } else {
        setAiStep(0);
        addAiMsg('ai', '好，我们重新开始！健身打卡还是学习打卡？');
      }
    }
  };

  const handleAiPublish = () => {
    const newCheckIn = {
      id: `ai-${Date.now()}`,
      userId: 'young_dreamer',
      userName: '金梦young dreamer',
      userAvatar: MY_AVATAR,
      category: aiCategory,
      checkInType: 'voice' as const,
      emoji: localMood.emoji,
      note: aiNote || `${aiCategory === 'fitness' ? '健身' : '学习'}打卡`,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: `2025-11-11T${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:00`,
    };
    addCheckIn(newCheckIn);
    addAiMsg('ai', '🎉 打卡成功！已记录到你的自律日历。继续加油，金梦！');
    showToast('AI语音打卡成功 🔥');
    setTimeout(() => navigate('/'), 1500);
  };

  const handleAiRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      const mockTexts = [
        '今天去健身房练了胸肌，大概练了一个小时',
        '跑步五公里，配速还可以',
        '学习了两个小时的技术书籍',
        '游泳三十分钟，累瘫了',
      ];
      const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
      addAiMsg('user', `🎙️ "${randomText}"`);
      setAiNote(randomText);
      setTimeout(() => {
        setAiStep(2);
        addAiMsg('ai', `收到！我识别到了："${randomText}"\n\n今天心情怎么样？`);
      }, 600);
    } else {
      setIsRecording(true);
    }
  };

  // ========== 普通打卡 ==========
  const handleCheckIn = () => {
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

  // AI选项
  const aiOptions = aiStep === 0
    ? ['健身打卡', '学习打卡']
    : aiStep === 1
      ? ['跑步', '健身', '游泳', '阅读', '刷题', '自定']
      : aiStep === 2
        ? EMOJI_MOODS.map(m => `${m.emoji} ${m.label}`)
        : aiStep === 3
          ? ['确认发布', '重新来']
          : [];

  return (
    <motion.div
      className="min-h-full pb-6"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springTransition}
    >
      <StickyHeader
        title="打卡"
        leftAction={
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
            <ArrowLeft size={22} color="var(--text-secondary)" />
          </motion.button>
        }
      />

      {/* 打卡形式选择 - 5列 */}
      <div className="px-4 mt-3">
        <div className="grid grid-cols-5 gap-1.5">
          {CHECKIN_TYPES.map((t) => (
            <motion.button
              key={t.type}
              className="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
              style={{
                background: state.checkInType === t.type ? 'rgba(168,230,207,0.2)' : 'rgba(255,255,255,0.5)',
                border: state.checkInType === t.type ? '2px solid var(--accent-mint-deep)' : '2px solid transparent',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCheckInType(t.type);
                setIsRecording(false);
              }}
            >
              <span className="text-[18px]">{t.emoji}</span>
              <span className="text-[10px] font-medium" style={{
                fontFamily: 'var(--font-chinese)',
                color: state.checkInType === t.type ? 'var(--accent-mint-deep)' : 'var(--text-secondary)',
              }}>
                {t.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ========== AI语音打卡模式 ========== */}
      <AnimatePresence mode="wait">
        {state.checkInType === 'voice' && (
          <motion.div
            key="voice"
            className="mt-3 flex flex-col"
            style={{ height: 'calc(100dvh - 220px)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* AI身份标识 */}
            <div className="px-4 flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: AI_AVATAR_GRADIENT }}>
                <Sparkle size={14} color="#fff" weight="fill" />
              </div>
              <span className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                AI打卡助手
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(78,205,196,0.12)', color: 'var(--accent-mint-deep)' }}>
                在线
              </span>
            </div>

            {/* 聊天区域 */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: 'none' }}>
              <div className="flex flex-col gap-3 pb-3">
                {aiMessages.map((msg) => (
                  <AiChatBubble key={msg.id} msg={msg} />
                ))}

                {/* AI选项按钮 */}
                {aiOptions.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 pl-9"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {aiOptions.map(opt => (
                      <motion.button
                        key={opt}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                        style={{
                          background: opt === '确认发布' ? 'var(--accent-mint-deep)' : opt === '重新来' ? 'rgba(26,60,52,0.06)' : 'rgba(168,230,207,0.15)',
                          color: opt === '确认发布' ? '#fff' : 'var(--accent-mint-deep)',
                          fontFamily: 'var(--font-chinese)',
                          border: opt === '重新来' ? '1px solid var(--divider)' : 'none',
                        }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleAiOption(opt)}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* 底部录音区 */}
            <div className="px-4 pt-2 pb-4 flex-shrink-0">
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    className="text-center mb-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}>
                      {String(Math.floor(recordDuration / 60)).padStart(2, '0')}:{String(recordDuration % 60).padStart(2, '0')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-[14px] font-medium text-white"
                style={{
                  background: isRecording
                    ? 'linear-gradient(135deg, #FF8A80, #E53935)'
                    : 'linear-gradient(135deg, #4ECDC4, #7C4DFF)',
                  boxShadow: isRecording ? '0 4px 16px rgba(255,138,128,0.3)' : '0 4px 16px rgba(78,205,196,0.3)',
                  fontFamily: 'var(--font-chinese)',
                }}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
                onClick={handleAiRecord}
              >
                {isRecording ? (
                  <><MicrophoneSlash size={18} weight="fill" /> 松开结束</>
                ) : (
                  <><Microphone size={18} weight="fill" /> 按住说话</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 非AI模式：类别 + 详细表单 ========== */}
      <AnimatePresence>
        {state.checkInType !== 'voice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 类别选择 */}
            <div className="px-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  className="flex flex-col items-center gap-2 rounded-[20px] py-4 transition-all"
                  style={{
                    background: state.selectedCategory === 'fitness' ? 'rgba(168,230,207,0.25)' : 'rgba(168,230,207,0.15)',
                    border: state.selectedCategory === 'fitness' ? '2px solid var(--accent-mint-deep)' : '2px solid transparent',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory('fitness')}
                >
                  <Barbell size={28} color="var(--accent-mint-deep)" weight={state.selectedCategory === 'fitness' ? 'fill' : 'regular'} />
                  <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>健身</span>
                </motion.button>
                <motion.button
                  className="flex flex-col items-center gap-2 rounded-[20px] py-4 transition-all"
                  style={{
                    background: state.selectedCategory === 'study' ? 'rgba(255,138,128,0.18)' : 'rgba(255,138,128,0.1)',
                    border: state.selectedCategory === 'study' ? '2px solid var(--accent-salmon)' : '2px solid transparent',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory('study')}
                >
                  <BookOpen size={28} color="var(--accent-salmon)" weight={state.selectedCategory === 'study' ? 'fill' : 'regular'} />
                  <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>学习</span>
                </motion.button>
              </div>
            </div>

            {/* 专注计时 */}
            {state.checkInType === 'timer' && (
              <motion.div
                className="px-4 mt-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-[20px] p-6 flex flex-col items-center" style={{ background: 'rgba(168,230,207,0.1)', border: '1px solid rgba(168,230,207,0.2)' }}>
                  <div className="text-[48px] font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {String(timerMin).padStart(2, '0')}:{String(timerSec).padStart(2, '0')}
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                    {timerRunning ? '专注中...' : timerMin > 0 ? `已专注${timerMin}分钟` : '点击开始专注计时'}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    {!timerRunning ? (
                      <motion.button
                        className="px-5 py-2.5 rounded-full text-white text-[13px] font-medium"
                        style={{ background: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTimerRunning(true)}
                      >开始</motion.button>
                    ) : (
                      <motion.button
                        className="px-5 py-2.5 rounded-full text-white text-[13px] font-medium"
                        style={{ background: '#FF8A80', fontFamily: 'var(--font-chinese)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTimerRunning(false)}
                      >暂停</motion.button>
                    )}
                    <motion.button
                      className="px-4 py-2.5 rounded-full text-[13px] font-medium"
                      style={{ background: 'rgba(26,60,52,0.06)', color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setTimerRunning(false); setTimerSec(0); setTimerMin(0); }}
                    >重置</motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 量化 */}
            {state.checkInType === 'quantity' && (
              <motion.div className="px-4 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[13px] font-medium mb-3" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>记录数据</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="flex-1 h-14 rounded-2xl text-center text-[24px] font-bold outline-none"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--divider)', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                    placeholder="0"
                    value={localQty}
                    onChange={(e) => setLocalQty(e.target.value)}
                  />
                  <select
                    className="h-14 px-4 rounded-2xl text-[14px] font-medium outline-none appearance-none"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--divider)', fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                    value={localUnit}
                    onChange={(e) => setLocalUnit(e.target.value)}
                  >
                    {state.selectedCategory === 'fitness'
                      ? <><option value="km">公里</option><option value="min">分钟</option><option value="组">组</option><option value="kg">公斤</option></>
                      : <><option value="页">页</option><option value="min">分钟</option><option value="章">章</option><option value="题">题</option></>
                    }
                  </select>
                </div>
              </motion.div>
            )}

            {/* 图文模式 - 图片上传 */}
            {state.checkInType === 'photo' && (
              <motion.div className="px-4 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[13px] font-medium mb-3" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
                  上传打卡照片
                </p>
                <label
                  className="block w-full h-40 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.5)', border: '2px dashed var(--divider)' }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-[13px]" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>
                    点击上传照片
                  </span>
                  <span className="text-[11px]" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-muted)' }}>
                    支持拍照或从相册选择
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const preview = document.getElementById('photo-preview') as HTMLImageElement;
                          if (preview && ev.target?.result) {
                            preview.src = ev.target.result as string;
                            preview.classList.remove('hidden');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <img
                  id="photo-preview"
                  className="hidden w-full h-40 object-cover rounded-2xl mt-3"
                  alt="preview"
                />
              </motion.div>
            )}

            {/* 心情选择 */}
            <div className="px-4 mt-5">
              <p className="text-[13px] font-medium mb-3" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>今天的心情</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {EMOJI_MOODS.map((mood) => (
                  <motion.button
                    key={mood.label}
                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl"
                    style={{ width: 56, background: localMood.label === mood.label ? 'rgba(78,205,196,0.1)' : 'transparent' }}
                    whileTap={{ scale: 0.85 }}
                    animate={{ scale: localMood.label === mood.label ? 1.05 : 1 }}
                    onClick={() => setLocalMood(mood)}
                  >
                    <span className="text-[28px]">{mood.emoji}</span>
                    <span className="text-[12px]" style={{ fontFamily: 'var(--font-chinese)', color: localMood.label === mood.label ? 'var(--accent-mint-deep)' : 'var(--text-tertiary)' }}>
                      {mood.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 备注 */}
            <div className="px-4 mt-5">
              <p className="text-[13px] font-medium mb-2" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>打卡备注 (可选)</p>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-2xl text-[13px] resize-y outline-none"
                style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--divider)', fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                placeholder="记录一下今天的打卡内容..."
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
              />
            </div>

            {/* 确认打卡按钮 */}
            <div className="px-4 mt-6 pb-8">
              <motion.button
                className="w-full h-[52px] rounded-2xl text-white text-[16px] font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-mint-deep)', boxShadow: '0 4px 16px rgba(78,205,196,0.3)', fontFamily: 'var(--font-chinese)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckIn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M8 12l2.5 2.5L16 9" /></svg>
                确认打卡
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 打卡成功模态框 ========== */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[100]"
              style={{ background: 'var(--backdrop-modal)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                <motion.div className="flex justify-center" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}>
                  <Confetti size={48} color="var(--accent-mint-deep)" weight="fill" />
                </motion.div>
                <h3 className="text-center text-[18px] font-semibold mt-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>打卡成功！</h3>
                <p className="text-center text-[13px] mt-1.5" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>连续 6 天，继续保持</p>

                <div className="mt-5 rounded-2xl p-3.5" style={{ background: 'rgba(168,230,207,0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    {state.selectedCategory === 'fitness' ? <Barbell size={18} color="var(--accent-mint-deep)" /> : <BookOpen size={18} color="var(--accent-salmon)" />}
                    <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                      {state.selectedCategory === 'fitness' ? '健身' : '学习'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(168,230,207,0.15)', color: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}>
                      {CHECKIN_TYPE_LABELS[state.checkInType]?.emoji} {CHECKIN_TYPE_LABELS[state.checkInType]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{localMood.emoji}</span>
                    <span className="text-[13px]" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}>{localMood.label}</span>
                  </div>
                  {localNote && <p className="text-[12px] mt-2" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-tertiary)' }}>{localNote}</p>}
                </div>

                <motion.button
                  className="w-full h-[48px] rounded-2xl text-white text-[15px] font-semibold mt-5"
                  style={{ background: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                >太棒了</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// AI对话气泡
function AiChatBubble({ msg }: { msg: ChatMsg }) {
  const isAI = msg.role === 'ai';
  const { displayed, done } = useTypewriter(msg.content, 20);

  return (
    <motion.div
      className={`flex items-start gap-2 ${isAI ? '' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex-shrink-0">
        {isAI ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: AI_AVATAR_GRADIENT }}>
            <Sparkle size={13} color="#fff" weight="fill" />
          </div>
        ) : (
          <Avatar src={MY_AVATAR} size={28} />
        )}
      </div>
      <div
        className="max-w-[78%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
        style={{
          background: isAI ? 'rgba(255,255,255,0.7)' : 'var(--accent-mint-deep)',
          color: isAI ? 'var(--text-primary)' : '#fff',
          fontFamily: 'var(--font-chinese)',
          border: isAI ? '1px solid rgba(255,255,255,0.6)' : 'none',
          borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          whiteSpace: 'pre-line',
        }}
      >
        {isAI && !done ? displayed : msg.content}
        {isAI && !done && (
          <motion.span className="inline-block w-1.5 h-3 ml-0.5 bg-current opacity-50" animate={{ opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} />
        )}
      </div>
    </motion.div>
  );
}
