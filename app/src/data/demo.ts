import type { CheckIn, FriendRanking, EmojiMood, WeeklyDay, CalendarDay, Challenge, Badge } from '../types';

export const EMOJI_MOODS: EmojiMood[] = [
  { emoji: '😊', label: '开心' },
  { emoji: '📚', label: '充实' },
  { emoji: '😴', label: '疲惫' },
  { emoji: '💪', label: '酸痛' },
  { emoji: '🧘', label: '平静' },
];

export const INITIAL_CHECKINS: CheckIn[] = [
  // ========== 星宇stars - 自律の神 · 凡间分神 ==========
  {
    id: '1',
    userId: 'stars',
    userName: '星宇stars',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80',
    category: 'fitness',
    checkInType: 'quantity',
    emoji: '😊',
    note: '晨跑5公里，配速5分30，今天状态不错！自律即自由 💫',
    quantityValue: 5,
    quantityUnit: 'km',
    likes: 12,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        userId: 'young_dreamer',
        userName: '金梦young dreamer',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
        content: '这也太早了…我还在床上 🛏️',
        createdAt: '2025-11-11T07:35:00',
      },
    ],
    createdAt: '2025-11-11T07:30:00',
  },
  {
    id: '2',
    userId: 'stars',
    userName: '星宇stars',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80',
    category: 'study',
    checkInType: 'timer',
    emoji: '📚',
    note: '早间阅读《深度工作》，专注90分钟',
    timerDuration: 90,
    likes: 8,
    isLiked: false,
    comments: [],
    createdAt: '2025-11-11T06:15:00',
  },
  {
    id: '3',
    userId: 'stars',
    userName: '星宇stars',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80',
    category: 'fitness',
    checkInType: 'quantity',
    emoji: '💪',
    note: '深蹲训练，突破100kg！💥',
    quantityValue: 100,
    quantityUnit: 'kg',
    likes: 18,
    isLiked: false,
    comments: [
      {
        id: 'c3',
        userId: 'young_dreamer',
        userName: '金梦young dreamer',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
        content: '牛啊！下次一起练',
        createdAt: '2025-11-10T08:15:00',
      },
    ],
    createdAt: '2025-11-10T08:00:00',
  },
  // ========== 华亢KaneLogger - 技术大神 ==========
  {
    id: '4',
    userId: 'kanelogger',
    userName: '华亢KaneLogger',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kanelogger&size=80',
    category: 'study',
    checkInType: 'timer',
    emoji: '📚',
    note: '刷LeetCode动态规划专题，专注120分钟',
    timerDuration: 120,
    likes: 10,
    isLiked: false,
    comments: [
      {
        id: 'c2',
        userId: 'stars',
        userName: '星宇stars',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80',
        content: '大佬带带我！',
        createdAt: '2025-11-11T07:40:00',
      },
    ],
    createdAt: '2025-11-11T06:15:00',
  },
  {
    id: '5',
    userId: 'kanelogger',
    userName: '华亢KaneLogger',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kanelogger&size=80',
    category: 'study',
    checkInType: 'quantity',
    emoji: '📚',
    note: '《深入理解计算机系统》读完第5章，硬核',
    quantityValue: 5,
    quantityUnit: '章',
    likes: 15,
    isLiked: false,
    comments: [],
    createdAt: '2025-11-10T22:30:00',
  },
  {
    id: '6',
    userId: 'kanelogger',
    userName: '华亢KaneLogger',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kanelogger&size=80',
    category: 'fitness',
    checkInType: 'text',
    emoji: '😴',
    note: '偶尔也动一下…游泳30分钟，累瘫',
    likes: 6,
    isLiked: false,
    comments: [],
    createdAt: '2025-11-09T20:00:00',
  },
  // ========== 金梦young dreamer - 拖延症蜕变者 ==========
  {
    id: '7',
    userId: 'young_dreamer',
    userName: '金梦young dreamer',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
    category: 'fitness',
    checkInType: 'photo',
    emoji: '💪',
    note: '终于来健身房了！虽然拖了一小时但还是来了 😤',
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    likes: 24,
    isLiked: false,
    comments: [
      {
        id: 'c4',
        userId: 'kanelogger',
        userName: '华亢KaneLogger',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kanelogger&size=80',
        content: '来了就是胜利 💪',
        createdAt: '2025-11-10T19:15:00',
      },
      {
        id: 'c5',
        userId: 'stars',
        userName: '星宇stars',
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80',
        content: '明天继续！',
        createdAt: '2025-11-10T19:20:00',
      },
    ],
    createdAt: '2025-11-10T18:00:00',
  },
  {
    id: '8',
    userId: 'young_dreamer',
    userName: '金梦young dreamer',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
    category: 'study',
    checkInType: 'timer',
    emoji: '📚',
    note: 'UI设计课程学习，今天没有拖延！专注45分钟',
    timerDuration: 45,
    likes: 8,
    isLiked: false,
    comments: [],
    createdAt: '2025-11-10T21:00:00',
  },
  {
    id: '9',
    userId: 'young_dreamer',
    userName: '金梦young dreamer',
    userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
    category: 'fitness',
    checkInType: 'quantity',
    emoji: '😊',
    note: '夜跑3公里，虽然跑得慢但至少动了 🏃',
    quantityValue: 3,
    quantityUnit: 'km',
    likes: 5,
    isLiked: false,
    comments: [],
    createdAt: '2025-11-09T21:30:00',
  },
];

export const FRIEND_RANKINGS: FriendRanking[] = [
  { id: 'stars', name: '星宇stars', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=stars&size=80', streak: 12, totalDays: 156, rank: 1 },
  { id: 'kanelogger', name: '华亢KaneLogger', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=kanelogger&size=80', streak: 8, totalDays: 134, rank: 2 },
  { id: 'young_dreamer', name: '金梦young dreamer', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80', streak: 5, totalDays: 98, rank: 3 },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch1',
    title: '21天早起挑战',
    description: '每天早上6点前起床打卡，养成早起好习惯',
    coverEmoji: '🌅',
    participants: 128,
    durationDays: 21,
    category: 'mixed',
    isJoined: true,
    progress: 62,
  },
  {
    id: 'ch2',
    title: '7天健身打卡',
    description: '连续7天健身运动，每天不少于30分钟',
    coverEmoji: '💪',
    participants: 86,
    durationDays: 7,
    category: 'fitness',
    isJoined: false,
    progress: 0,
  },
  {
    id: 'ch3',
    title: '30天阅读计划',
    description: '每天阅读至少30分钟，读完一本书',
    coverEmoji: '📖',
    participants: 256,
    durationDays: 30,
    category: 'study',
    isJoined: true,
    progress: 40,
  },
  {
    id: 'ch4',
    title: '14天冥想挑战',
    description: '每天冥想10分钟，提升专注力',
    coverEmoji: '🧘',
    participants: 64,
    durationDays: 14,
    category: 'mixed',
    isJoined: false,
    progress: 0,
  },
];

export const BADGES: Badge[] = [
  { id: 'b1', name: '初出茅庐', description: '完成第1次打卡', emoji: '🌱', isUnlocked: true, unlockedAt: '2025-10-01', color: '#A8E6CF' },
  { id: 'b2', name: '坚持一周', description: '连续打卡7天', emoji: '🔥', isUnlocked: true, unlockedAt: '2025-10-08', color: '#FF8A80' },
  { id: 'b3', name: '健身达人', description: '健身打卡30次', emoji: '🏋️', isUnlocked: true, unlockedAt: '2025-10-20', color: '#4ECDC4' },
  { id: 'b4', name: '学霸之路', description: '学习打卡30次', emoji: '📚', isUnlocked: true, unlockedAt: '2025-11-01', color: '#FFD54F' },
  { id: 'b5', name: '社交达人', description: '获得50个赞', emoji: '❤️', isUnlocked: false, color: '#FF8A80' },
  { id: 'b6', name: '坚持不懈', description: '连续打卡30天', emoji: '💎', isUnlocked: false, color: '#4ECDC4' },
  { id: 'b7', name: '挑战者', description: '完成3个挑战', emoji: '🏆', isUnlocked: false, color: '#FFD54F' },
  { id: 'b8', name: '早起鸟', description: '连续7天6点前打卡', emoji: '🐦', isUnlocked: false, color: '#A8E6CF' },
];

export function getWeeklyDays(): WeeklyDay[] {
  const today = new Date(2025, 10, 11);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  const days: WeeklyDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    days.push({
      dayName: dayNames[i],
      dayOfMonth: d.getDate(),
      isToday,
      isChecked: isToday ? false : Math.random() > 0.3,
    });
  }
  return days;
}

export function getCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: CalendarDay[] = [];

  const startPadding = (firstDay.getDay() + 6) % 7;
  const prevMonth = new Date(year, month, 0);
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push({
      date: '',
      dayOfMonth: prevMonth.getDate() - i,
      isCurrentMonth: false,
      hasCheckIn: false,
      checkInCategory: null,
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasCheckIn = Math.random() > 0.45;
    let cat: 'fitness' | 'study' | null = null;
    if (hasCheckIn) {
      cat = Math.random() > 0.4 ? 'fitness' : 'study';
    }
    const isToday = d === 11;
    days.push({
      date: dateStr,
      dayOfMonth: d,
      isCurrentMonth: true,
      hasCheckIn: isToday ? true : hasCheckIn,
      checkInCategory: isToday ? 'fitness' : cat,
    });
  }

  return days;
}

export const MY_AVATAR = 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80';

export const CHECKIN_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  text: { label: '文字', emoji: '📝' },
  photo: { label: '图文', emoji: '📸' },
  timer: { label: '专注', emoji: '⏱️' },
  quantity: { label: '量化', emoji: '📊' },
  voice: { label: '语音', emoji: '🎙️' },
};
