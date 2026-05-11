export interface User {
  id: string;
  name: string;
  avatar: string;
  totalDays: number;
  streak: number;
  todayStatus: 'checked' | 'pending';
}

export type CheckInType = 'text' | 'photo' | 'timer' | 'quantity' | 'voice';

export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  category: 'fitness' | 'study';
  checkInType: CheckInType;
  emoji: string;
  note: string;
  photoUrl?: string;
  timerDuration?: number; // minutes
  quantityValue?: number;
  quantityUnit?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface FriendRanking {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  totalDays: number;
  rank: number;
}

export interface EmojiMood {
  emoji: string;
  label: string;
}

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  hasCheckIn: boolean;
  checkInCategory: 'fitness' | 'study' | null;
}

export interface WeeklyDay {
  dayName: string;
  dayOfMonth: number;
  isToday: boolean;
  isChecked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  coverEmoji: string;
  participants: number;
  durationDays: number;
  category: 'fitness' | 'study' | 'mixed';
  isJoined: boolean;
  progress: number; // 0-100
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  color: string;
}

export interface AppState {
  todayStatus: 'checked' | 'pending';
  selectedCategory: 'fitness' | 'study';
  selectedMood: EmojiMood;
  checkInNote: string;
  checkInType: CheckInType;
  timerDuration: number;
  quantityValue: number;
  quantityUnit: string;
  checkIns: CheckIn[];
  likes: Record<string, boolean>;
  toast: { message: string; visible: boolean } | null;
}
