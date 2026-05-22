export interface User {
  _id?: string
  _openid?: string
  openid?: string
  nickName: string
  avatarUrl: string
  streakDays: number
  totalCheckIns: number
  weeklyFitnessDone: number
  weeklyStudyDone: number
  monthDone: number
  mantra: string
  createdAt?: string
  updatedAt?: string
}

export type CheckInType = 'text' | 'photo'

export type Category = 'fitness' | 'study' | 'read' | 'meditation' | 'coding'

export interface CheckIn {
  _id?: string
  userId: string
  category: Category
  checkInType: CheckInType
  emoji: string
  note: string
  photoUrl?: string
  date: string
  createdAt?: string
}

export interface EmojiMood {
  emoji: string
  label: string
}

export interface WeeklyDay {
  date: string
  status: 'checked' | 'pending'
  category?: Category
}

export interface Goals {
  weeklyFitnessDone: number
  weeklyFitnessTarget: number
  weeklyStudyDone: number
  weeklyStudyTarget: number
  monthDone: number
  monthTarget: number
}

export interface FeedItem {
  checkIn: CheckIn
  user: Pick<User, 'nickName' | 'avatarUrl'>
}

export interface HomeDataResponse {
  todayStatus: 'checked' | 'pending'
  todayCheckIn?: CheckIn
  weeklyStrip: WeeklyDay[]
  streakDays: number
  goals: Goals
}

export interface AddCheckInRequest {
  category: Category
  emoji: string
  note: string
  checkInType: CheckInType
  photoUrl?: string
}

export interface AddCheckInResponse {
  success: boolean
  checkIn?: CheckIn
  streakDays: number
  message?: string
}

export interface GetFeedRequest {
  page: number
  pageSize: number
}

export interface GetFeedResponse {
  list: FeedItem[]
  hasMore: boolean
}

export interface DeleteCheckInResponse {
  success: boolean
  deletedId?: string
  deletedDate?: string
  isToday?: boolean
  streakDays?: number
  category?: Category
  message?: string
}
