import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Microphone, MicrophoneSlash, Barbell, BookOpen, PaperPlaneRight, UsersThree, Shuffle, Lightning, Cards } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import { MY_AVATAR } from '../data/demo';
import Avatar from '../components/Avatar';
import StickyHeader from '../components/StickyHeader';

const AI_AVATAR = 'linear-gradient(135deg, #4ECDC4, #7C4DFF)';

interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  content: string;
  type?: 'text' | 'checkin_card' | 'flip_card';
  flipContent?: string;
}

// 打字机效果
function useTypewriter(text: string, speed = 20) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setDone(true); clearInterval(timer); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return { displayed, done };
}

// "翻一翻"AI回复库
const FAN_RESPONSES: Record<string, string> = {
  '健身': '来翻一张健身卡！💪 今天练了什么部位？',
  '学习': '翻开学习模式！📚 今天学了什么新东西？',
  '跑步': '翻开跑步日志！🏃 跑了多远？心情如何？',
  '累': '累了就翻开休息卡 😊 自律不是拼命，是可持续的坚持',
  '不想动': '来，翻开一张激励卡 🔥\n\n"不想动的时候，就只做5分钟。5分钟后，你会发现自己停不下来。"\n\n— 翻一翻的自律箴言',
  '拖延': '翻开拖延克星卡 ✨\n\n翻一翻教你3步法：\n1. 数到3就站起来\n2. 只做第一个动作\n3. 告诉自己"翻过去就好了"',
  '建议': '翻开翻一翻的智慧卡：\n\n1. 🎯 目标要小：每天只翻一页书\n2. 🔗 绑定习惯：刷牙后立刻翻开运动垫\n3. 🎁 即时奖励：翻完卡立刻给自己点赞\n4. 👥 翻友相伴：翻一翻随时陪你',
  '打卡': '来，跟我一起翻牌打卡！🃏\n\n第一步：翻开你的类别牌\n今天翻「健身」还是「学习」？',
  '翻': '来了！翻一翻为你翻开今日卡片 🃏\n\n今天翻到什么？\n• 💪 健身打卡\n• 📚 学习打卡\n• 🔥 求翻一翻打气\n• 👥 翻牌cue朋友',
  'default': '翻一翻在听 👂\n\n你可以对我说：\n• "翻牌打卡" — 开始打卡\n• "翻一翻" — 随机翻开建议\n• "cue朋友" — 翻牌叫朋友一起\n• "求打气" — 翻开激励卡',
};

// 每日翻签
const DAILY_FLIPS = [
  { front: '🔥 今日挑战', back: '做一件让你不舒服但正确的事' },
  { front: '💪 健身箴言', back: '身体不会骗你，汗水不会白流' },
  { front: '📚 学习智慧', back: '每天翻一页书，一年就是365页' },
  { front: '✨ 自律秘诀', back: '不是等有了心情才做，而是做了才会有心情' },
  { front: '🎯 目标法则', back: '把大目标翻成小目标，小到不可能失败' },
  { front: '🌟 翻一翻说', back: '你今天翻过的每一页，都在为未来铺路' },
];

function getFanResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('翻')) return FAN_RESPONSES['翻'];
  if (lower.includes('cue') || lower.includes('朋友') || lower.includes('提醒')) {
    return '🃏 翻开朋友召唤卡！\n\n📢 @星宇stars @华亢KaneLogger\n「该翻开今天的打卡牌啦！🔥」\n\n已发送翻牌邀请：\n✓ 星宇stars 收到翻牌挑战\n✓ 华亢KaneLogger 被翻牌点名\n\n等他们翻开响应吧！';
  }
  if (lower.includes('健身') || lower.includes('练') || lower.includes('运动')) return FAN_RESPONSES['健身'];
  if (lower.includes('学习') || lower.includes('读书') || lower.includes('刷题')) return FAN_RESPONSES['学习'];
  if (lower.includes('跑')) return FAN_RESPONSES['跑步'];
  if (lower.includes('累') || lower.includes('疲惫')) return FAN_RESPONSES['累'];
  if (lower.includes('不想') || lower.includes('懒')) return FAN_RESPONSES['不想动'];
  if (lower.includes('拖延')) return FAN_RESPONSES['拖延'];
  if (lower.includes('建议') || lower.includes('怎么办')) return FAN_RESPONSES['建议'];
  if (lower.includes('打卡')) return FAN_RESPONSES['打卡'];
  return FAN_RESPONSES['default'];
}

export default function AIChat() {
  const navigate = useNavigate();
  const { addCheckIn, showToast } = useCheckIn();
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: '嗨金梦！我是翻一翻 🃏\n\n我能帮你：\n• 🃏 翻牌打卡\n• 💡 翻开自律建议\n• 🔥 翻开激励卡\n• 👥 翻牌cue朋友\n\n说"翻一翻"或"翻牌"开始吧！',
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [checkInStep, setCheckInStep] = useState(0);
  const [ciCategory, setCiCategory] = useState<'fitness' | 'study'>('fitness');
  const [ciNote, setCiNote] = useState('');
  const [ciMood, setCiMood] = useState('😊');
  const [, setFlippedCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => setRecordDuration(prev => prev + 1), 1000);
    } else if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    return () => { if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role: 'ai' | 'user', content: string, type?: 'text' | 'checkin_card' | 'flip_card', flipContent?: string) => {
    setMessages(prev => [...prev, { id: `${role}-${Date.now()}`, role, content, type, flipContent }]);
  };

  const handleSend = (text?: string) => {
    const content = text || inputText.trim();
    if (!content) return;

    addMsg('user', content);
    setInputText('');

    // 翻牌随机签
    if (content.includes('翻一翻') && !content.includes('打卡')) {
      const randomIdx = Math.floor(Math.random() * DAILY_FLIPS.length);
      setFlippedCard(randomIdx);
      setTimeout(() => {
        addMsg('ai', '🃏 翻一翻为你翻开今日卡片！', 'flip_card', DAILY_FLIPS[randomIdx].back);
      }, 400);
      return;
    }

    // 打卡流程
    if (checkInStep === 1) {
      const cat = content.includes('学习') || content.includes('读') ? 'study' : 'fitness';
      setCiCategory(cat);
      setCheckInStep(2);
      setTimeout(() => addMsg('ai', `翻开${cat === 'fitness' ? '健身' : '学习'}卡！📝\n\n具体做了什么？`), 400);
      return;
    }
    if (checkInStep === 2) {
      setCiNote(content);
      setCheckInStep(3);
      setTimeout(() => addMsg('ai', '收到！翻开心情卡 👇\n😊开心 📚充实 💪酸痛 😴疲惫 🧘平静'), 400);
      return;
    }
    if (checkInStep === 3) {
      const moodEmoji = content.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '😊';
      setCiMood(moodEmoji);
      setCheckInStep(4);
      setTimeout(() => {
        addMsg('ai', `打卡预览：\n━━━━━━━━━━━━\n🃏 ${ciCategory === 'fitness' ? '健身' : '学习'}：${ciNote}\n😊 心情：${moodEmoji}\n━━━━━━━━━━━━`, 'checkin_card');
      }, 400);
      return;
    }
    if (checkInStep === 4) {
      if (content.includes('确认') || content.includes('好') || content.includes('发')) {
        handlePublishCheckIn();
        setCheckInStep(0);
      } else {
        setCheckInStep(0);
        addMsg('ai', '已翻回。再翻一张？说"翻一翻"试试 🃏');
      }
      return;
    }

    // 触发打卡流程
    if (content.includes('打卡')) {
      setCheckInStep(1);
      setTimeout(() => addMsg('ai', '🃏 翻开打卡牌！\n\n今天翻「健身」还是「学习」？'), 400);
      return;
    }

    // 普通对话
    setTimeout(() => {
      const reply = getFanResponse(content);
      addMsg('ai', reply);
    }, 600);
  };

  const handlePublishCheckIn = () => {
    const newCheckIn = {
      id: `fan-${Date.now()}`,
      userId: 'young_dreamer',
      userName: '金梦young dreamer',
      userAvatar: MY_AVATAR,
      category: ciCategory,
      checkInType: 'voice' as const,
      emoji: ciMood,
      note: ciNote,
      likes: 0,
      isLiked: false,
      comments: [],
      createdAt: `2025-11-11T${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:00`,
    };
    addCheckIn(newCheckIn);
    addMsg('ai', '🎉 翻牌打卡成功！已记录 🔥\n\n再翻一张？说"翻一翻"看看今天翻到什么 🃏');
    showToast('翻牌打卡成功 🔥');
  };

  const handleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      const mockTexts = [
        '翻一翻',
        '今天去健身房练了胸肌',
        '不想动怎么办',
        'cue一下朋友们',
        '给我一些自律建议',
      ];
      const text = mockTexts[Math.floor(Math.random() * mockTexts.length)];
      addMsg('user', `🎙️ "${text}"`);
      setTimeout(() => {
        if (text.includes('翻')) {
          const randomIdx = Math.floor(Math.random() * DAILY_FLIPS.length);
          setFlippedCard(randomIdx);
          addMsg('ai', '🃏 翻一翻为你翻开今日卡片！', 'flip_card', DAILY_FLIPS[randomIdx].back);
        } else {
          const reply = getFanResponse(text);
          addMsg('ai', reply);
        }
      }, 600);
    } else {
      setIsRecording(true);
    }
  };

  const quickActions = [
    { icon: <Barbell size={14} />, label: '翻牌健身', action: () => { setCheckInStep(1); addMsg('user', '翻牌健身'); setTimeout(() => addMsg('ai', '💪 翻开健身卡！\n\n具体做了什么？'), 300); } },
    { icon: <BookOpen size={14} />, label: '翻牌学习', action: () => { setCheckInStep(1); addMsg('user', '翻牌学习'); setTimeout(() => addMsg('ai', '📚 翻开学习卡！\n\n具体做了什么？'), 300); } },
    { icon: <Shuffle size={14} />, label: '翻一翻', action: () => { addMsg('user', '翻一翻'); const randomIdx = Math.floor(Math.random() * DAILY_FLIPS.length); setFlippedCard(randomIdx); setTimeout(() => addMsg('ai', '🃏 翻一翻为你翻开今日卡片！', 'flip_card', DAILY_FLIPS[randomIdx].back), 400); } },
    { icon: <UsersThree size={14} />, label: '翻牌cue朋友', action: () => { addMsg('user', '翻牌cue朋友'); setTimeout(() => addMsg('ai', '🃏 翻开朋友召唤卡！\n\n📢 @星宇stars @华亢KaneLogger\n「该翻开今天的打卡牌啦！🔥」\n\n已发送翻牌邀请：\n✓ 星宇stars 收到翻牌挑战\n✓ 华亢KaneLogger 被翻牌点名'), 400); } },
    { icon: <Lightning size={14} />, label: '求翻一翻打气', action: () => { addMsg('user', '求打气'); setTimeout(() => addMsg('ai', '🔥 翻开激励卡！\n\n"每一个你翻不过去的时刻，\n都是在为未来积累翻盘的资本。"\n\n— 翻一翻'), 300); } },
  ];

  return (
    <motion.div
      className="min-h-full flex flex-col"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <StickyHeader
        title="翻一翻"
        leftAction={
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
            <ArrowLeft size={22} color="var(--text-secondary)" />
          </motion.button>
        }
      />

      {/* 翻一翻头部 */}
      <div className="px-4 flex items-center gap-2.5 pb-2">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: AI_AVATAR }}>
          <Cards size={18} color="#fff" weight="fill" />
        </div>
        <div>
          <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
            翻一翻
          </span>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(78,205,196,0.12)', color: 'var(--accent-mint-deep)' }}>
            AI自律伙伴
          </span>
        </div>
      </div>

      {/* 聊天区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              onConfirm={handlePublishCheckIn}
              onCancel={() => { setCheckInStep(0); addMsg('ai', '已翻回。说"翻一翻"再试 🃏'); }}
            />
          ))}
        </div>
      </div>

      {/* 快捷操作条 */}
      <div className="px-3 pb-2 flex gap-1.5 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium flex-shrink-0"
            style={{
              background: 'rgba(168,230,207,0.15)',
              color: 'var(--accent-mint-deep)',
              fontFamily: 'var(--font-chinese)',
              border: '1px solid rgba(168,230,207,0.3)',
            }}
            whileTap={{ scale: 0.92 }}
            onClick={action.action}
          >
            {action.icon}
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* 底部输入区 */}
      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <AnimatePresence>
          {isRecording && (
            <motion.div className="text-center mb-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-mint-deep)' }}>
                {String(Math.floor(recordDuration / 60)).padStart(2, '0')}:{String(recordDuration % 60).padStart(2, '0')}
              </span>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
                翻一翻在听...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isRecording ? 'linear-gradient(135deg, #FF8A80, #E53935)' : 'linear-gradient(135deg, #4ECDC4, #7C4DFF)',
            }}
            whileTap={{ scale: 0.9 }}
            animate={isRecording ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
            onClick={handleVoice}
          >
            {isRecording ? <MicrophoneSlash size={18} color="#fff" weight="fill" /> : <Microphone size={18} color="#fff" weight="fill" />}
          </motion.button>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--divider)' }}>
            <input
              type="text"
              className="flex-1 text-[13px] bg-transparent outline-none"
              style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
              placeholder="翻一翻，说点什么..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleSend()} disabled={!inputText.trim()}>
              <PaperPlaneRight size={18} color={inputText.trim() ? 'var(--accent-mint-deep)' : 'var(--text-muted)'} weight="fill" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 对话气泡
function ChatBubble({ msg, onConfirm, onCancel }: { msg: ChatMsg; onConfirm: () => void; onCancel: () => void }) {
  const isAI = msg.role === 'ai';
  const { displayed, done } = useTypewriter(isAI ? msg.content : msg.content, 20);
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className={`flex items-start gap-2 ${isAI ? '' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex-shrink-0">
        {isAI ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: AI_AVATAR }}>
            <Cards size={15} color="#fff" weight="fill" />
          </div>
        ) : (
          <Avatar src={MY_AVATAR} size={32} />
        )}
      </div>

      <div className="max-w-[78%]">
        {/* 翻牌卡片特效 */}
        {msg.type === 'flip_card' ? (
          <motion.div
            className="relative w-56 h-32 cursor-pointer"
            style={{ perspective: 600 }}
            onClick={() => setFlipped(!flipped)}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* 正面 */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4ECDC4, #7C4DFF)',
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 4px 16px rgba(124,77,255,0.3)',
                }}
              >
                <Cards size={28} color="#fff" weight="fill" />
                <span className="text-[13px] font-medium text-white" style={{ fontFamily: 'var(--font-chinese)' }}>
                  🃏 点击翻开
                </span>
              </div>
              {/* 背面 */}
              <div
                className="absolute inset-0 rounded-2xl flex items-center justify-center p-4"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  border: '1px solid rgba(168,230,207,0.4)',
                }}
              >
                <p className="text-[13px] text-center leading-relaxed" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}>
                  {msg.flipContent}
                </p>
              </div>
            </motion.div>
            {/* 点击提示 */}
            {!flipped && (
              <motion.div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px]"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                点击翻牌
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div
            className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
            style={{
              background: isAI ? 'rgba(255,255,255,0.7)' : 'var(--accent-mint-deep)',
              color: isAI ? 'var(--text-primary)' : '#fff',
              fontFamily: 'var(--font-chinese)',
              border: isAI ? '1px solid rgba(255,255,255,0.6)' : 'none',
              borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              whiteSpace: 'pre-line',
              backdropFilter: isAI ? 'blur(12px)' : 'none',
            }}
          >
            {isAI && !done ? displayed : msg.content}
            {isAI && !done && (
              <motion.span className="inline-block w-1.5 h-3.5 ml-0.5 bg-current opacity-50" animate={{ opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} />
            )}
          </div>
        )}

        {/* 打卡确认按钮 */}
        {msg.type === 'checkin_card' && (
          <motion.div className="flex gap-2 mt-2 pl-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <motion.button
              className="px-4 py-1.5 rounded-full text-[12px] font-medium text-white"
              style={{ background: 'var(--accent-mint-deep)', fontFamily: 'var(--font-chinese)' }}
              whileTap={{ scale: 0.92 }}
              onClick={onConfirm}
            >
              确认发布
            </motion.button>
            <motion.button
              className="px-4 py-1.5 rounded-full text-[12px] font-medium"
              style={{ background: 'rgba(26,60,52,0.06)', color: 'var(--text-secondary)', fontFamily: 'var(--font-chinese)' }}
              whileTap={{ scale: 0.92 }}
              onClick={onCancel}
            >
              再翻一次
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
