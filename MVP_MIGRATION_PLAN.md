# Aura Check 小程序 MVP 迁移与开发计划

> **约束条件**：3 人小圈子 · 动态全公开（Healthy Public）· 保留图片打卡 · 保留视觉动效 · 保留统计页  
> **目标**：基于现有 Web 项目，最小成本迁移至微信小程序 + 微信云开发  
> **预计工期**：**6-8 天开发** + 1-3 天审核 = 最快 **1.5 周上线**

---

## 一、功能裁剪决策（必读）

### 保留的功能

| 模块 | 说明 |
|-----|------|
| **用户登录** | 微信 OpenID 自动登录注册 |
| **打卡（文字 + 图片）** | 核心闭环，支持 `text` 和 `photo` 两种类型 |
| **首页（Home）** | 今日状态、周打卡条、连续天数、目标进度 |
| **动态广场（Feed）** | 所有人公开打卡流（原 Friends 页改造，无需好友关系） |
| **统计页（Stats）** | 日历热力图 + 基础月度统计 |
| **个人资料（Profile）** | 头像昵称、个人宣言、设置 |
| **视觉动效** | 玻璃拟态、页面转场、卡片入场、Toast、打卡庆祝动画 |

### 去掉的功能（V2 再做）

| 去掉的模块 | 涉及内容 | 理由 |
|-----------|---------|------|
| **好友关系系统** | `friends` 集合、`addFriend` 云函数、邀请码 | 全公开动态，无需关系链 |
| **点赞 & 评论** | `likes` / `comments` 集合、`toggleLike` / `addComment` | 3 人圈子先保证"可见"，互动延后 |
| **排行榜** | `getRanking` 云函数 | 3 人无竞争意义 |
| **挑战系统** | `challenges` / `userChallenges` 集合、Discover 页面 | 游戏化非核心 |
| **徽章系统** | `badges` / `userBadges` 集合 | 游戏化非核心 |
| **AI Chat（翻一翻）** | `aiChat` 云函数、AIChat 页面、FlipCard 组件 | 最大开发成本，延后 |
| **计时/量化/语音打卡** | `timer` / `quantity` / `voice` 类型及相关 UI | 只保留文字 + 图片 |

### 架构变化

- **数据库集合**：9 个 → **2 个**（`users` + `checkins`）
- **云函数**：12 个 → **4 个**（`login` + `addCheckIn` + `getHomeData` + `getFeed`）
- **页面**：7 个 → **5 个**（4 个 Tab + 1 个次级页面）
- **TabBar**：5 个 → **4 个**（首页 · 动态 · 统计 · 我的）

---

## 二、技术栈

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 前端框架 | Taro 3.x (React + TypeScript) | 复用现有 React 代码 |
| 构建工具 | Webpack | Taro 默认 |
| 状态管理 | Zustand + persist | 轻量，支持本地缓存兜底 |
| 样式方案 | Sass + weapp-tailwindcss | 保留 Tailwind 开发体验 |
| 图标方案 | Taro 内置图标 + 自定义 SVG | 替换 phosphor-react |
| 后端服务 | 微信云开发 | 零运维，原生集成 |
| 数据库 | 云数据库 (MongoDB-like) | `users` + `checkins` |
| 存储 | 云存储 | 用户打卡图片 |
| 用户鉴权 | 微信 OpenID | 云函数自动获取 |

---

## 三、数据库设计

### 3.1 集合清单

| 集合 | 说明 | 核心索引 |
|------|------|----------|
| `users` | 用户基础信息 | `openid` (唯一) |
| `checkins` | 打卡记录（文字/图片） | `userId + date` (复合), `createdAt` (单字段) |

### 3.2 数据 Schema

#### users

```typescript
interface User {
  _id: string
  _openid: string
  nickName: string
  avatarUrl: string          // dicebear 头像 URL
  streakDays: number         // 连续打卡天数（冗余）
  totalCheckIns: number      // 总打卡次数（冗余）
  weeklyFitnessDone: number  // 本周健身已完成天数
  weeklyStudyDone: number    // 本周学习已完成天数
  monthDone: number          // 本月已打卡天数
  mantra: string             // 个人宣言
  createdAt: Date
  updatedAt: Date
}
```

#### checkins

```typescript
interface CheckIn {
  _id: string
  userId: string            // 对应 users._openid
  category: 'fitness' | 'study' | 'read' | 'meditation' | 'coding'
  checkInType: 'text' | 'photo'
  emoji: string             // 心情 emoji，如 "💪" "📚"
  note: string              // 打卡备注
  photoUrl?: string         // 图片云存储 fileID，如 "cloud://xxx.jpg"
  date: string              // '2026-05-14' 格式，方便按天查询
  createdAt: Date
}
```

### 3.3 索引创建命令

在云开发控制台 → 数据库 → 对应集合 → 索引管理 中创建：

```json
// users 集合
{ "openid": 1 }          // 唯一索引

// checkins 集合
{ "userId": 1, "date": -1 }   // 复合索引，查今日是否已打卡
{ "createdAt": -1 }            // 单字段索引，Feed 倒序分页
```

---

## 四、云函数 API 设计

### 4.1 登录 / 自动注册：`login`

- **调用**：`wx.cloud.callFunction({ name: 'login' })`
- **请求**：空（自动从 wxContext 取 openid）

**响应：**

```typescript
interface LoginResponse {
  success: true
  user: User
  isNewUser: boolean
}
```

**业务逻辑：**
1. `cloud.getWXContext()` 获取 `OPENID`
2. 查询 `users` 集合，存在则返回用户信息
3. 不存在则创建新用户（nickName 默认 "微信用户"，头像默认 dicebear seed，mantra 默认空）

---

### 4.2 打卡：`addCheckIn`

**请求：**

```typescript
interface AddCheckInRequest {
  category: string
  emoji: string
  note: string
  checkInType: 'text' | 'photo'
  photoUrl?: string         // 云存储 fileID
}
```

**响应：**

```typescript
interface AddCheckInResponse {
  success: boolean
  checkIn?: CheckIn
  streakDays: number
  message?: string
}
```

**业务逻辑：**
1. 调用 `msgSecCheck` 校验 `note` 文本内容（审核必需）
2. 查询 `checkins` 今日是否已打卡（`userId + date` 复合查询，同一 category 限制一天一次）
3. 已打卡 → 返回 `success: false, message: "今日已打卡"`
4. 未打卡 → 写入 `checkins`
5. 更新 `users` 的 `streakDays`（连续天数）、`totalCheckIns`、`weeklyFitnessDone` / `weeklyStudyDone`、`monthDone`
6. 返回新记录 + 更新后的连续天数

> **图片安全**：若 `photoUrl` 存在，调用 `imgSecCheck` 审核图片（fileID 需先下载为 Buffer 再传入）。

---

### 4.3 获取首页数据：`getHomeData`

**响应：**

```typescript
interface HomeDataResponse {
  todayStatus: 'checked' | 'pending'
  todayCheckIn?: CheckIn
  weeklyStrip: Array<{
    date: string
    status: 'checked' | 'pending'
    category?: string
  }>
  streakDays: number
  goals: {
    weeklyFitnessDone: number
    weeklyFitnessTarget: number
    weeklyStudyDone: number
    weeklyStudyTarget: number
    monthDone: number
    monthTarget: number
  }
}
```

**业务逻辑：**
1. 查询今日是否有 `checkins` 记录
2. 查询过去 7 天的打卡记录，生成 `weeklyStrip`
3. 返回用户连续打卡天数 + 目标进度数据（目标值写死：每周健身 4 次、学习 5 次、每月 20 次）

---

### 4.4 获取公开动态：`getFeed`

**请求：**

```typescript
interface GetFeedRequest {
  page: number
  pageSize: number
}
```

**响应：**

```typescript
interface GetFeedResponse {
  list: Array<{
    checkIn: CheckIn
    user: Pick<User, 'nickName' | 'avatarUrl'>
  }>
  hasMore: boolean
}
```

**业务逻辑：**
1. 直接查询 `checkins` 集合，`orderBy('createdAt', 'desc')`，分页 `skip + limit`
2. 关联查询 `users` 表获取 `nickName` 和 `avatarUrl`
3. 返回列表 + `hasMore` 标记

> **关键简化**：无需 `friends` 关系链，全公开广场直接查全表。

---

## 五、小程序端架构

### 5.1 项目结构

```
kimi-agent-wx/
├── config/
│   └── index.js              # weapp-tailwindcss 配置
├── src/
│   ├── app.config.ts         # 页面路由 + tabBar（4 个 Tab）
│   ├── app.tsx               # 入口，初始化云开发
│   ├── pages/
│   │   ├── index/            # 首页 Home
│   │   ├── checkin/          # 打卡页 CheckIn（次级页面）
│   │   ├── feed/             # 动态广场 Feed
│   │   ├── stats/            # 统计 Stats
│   │   └── profile/          # 我的 Profile
│   ├── components/
│   │   ├── GlassCard.tsx     # 玻璃卡片容器
│   │   ├── Avatar.tsx        # 头像组件（dicebear）
│   │   ├── Toast.tsx         # 全局 Toast
│   │   ├── DateGreeting.tsx  # 日期问候
│   │   ├── WeeklyStrip.tsx   # 周打卡条
│   │   ├── TodayCheckInCard.tsx
│   │   ├── GoalProgress.tsx  # 目标进度环
│   │   ├── FeedCard.tsx      # 动态卡片（含图片展示）
│   │   ├── CalendarArchive.tsx
│   │   ├── MonthlyStats.tsx  # 基础月度统计
│   │   ├── UserInfoCard.tsx
│   │   ├── PhotoUploader.tsx # 图片选择 + 上传云存储
│   │   ├── CategoryPicker.tsx
│   │   ├── MoodPicker.tsx
│   │   └── NoteInput.tsx
│   ├── hooks/
│   │   └── useAppStore.ts    # Zustand 全局状态
│   ├── api/
│   │   ├── login.ts
│   │   ├── checkIn.ts
│   │   ├── home.ts
│   │   └── feed.ts
│   ├── types/
│   │   └── index.ts          # User, CheckIn 等 TS 类型
│   └── utils/
│       └── cloud.ts          # 云开发初始化
├── cloud/
│   └── functions/
│       ├── login/
│       │   └── index.ts
│       ├── addCheckIn/
│       │   └── index.ts
│       ├── getHomeData/
│       │   └── index.ts
│       └── getFeed/
│           └── index.ts
└── package.json
```

### 5.2 页面路由（app.config.ts）

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/feed/index',
    'pages/stats/index',
    'pages/profile/index',
    'pages/checkin/index',    // 次级页面，不在 tabBar
  ],
  tabBar: {
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/feed/index', text: '动态' },
      { pagePath: 'pages/stats/index', text: '统计' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
})
```

### 5.3 状态管理（Zustand）

```typescript
// src/hooks/useAppStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

interface AppState {
  user: User | null
  todayStatus: 'checked' | 'pending'
  todayCheckIn: CheckIn | null
  streakDays: number
  feed: FeedItem[]
  goals: Goals | null

  init: () => Promise<void>
  checkIn: (data: AddCheckInRequest) => Promise<void>
  loadFeed: (page?: number) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      todayStatus: 'pending',
      todayCheckIn: null,
      streakDays: 0,
      feed: [],
      goals: null,

      init: async () => {
        const { result } = await Taro.cloud.callFunction({ name: 'login' })
        set({ user: result.user })

        const { result: homeRes } = await Taro.cloud.callFunction({
          name: 'getHomeData'
        })
        set({
          todayStatus: homeRes.todayStatus,
          todayCheckIn: homeRes.todayCheckIn,
          streakDays: homeRes.streakDays,
          goals: homeRes.goals
        })
      },

      checkIn: async (data) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'addCheckIn',
          data
        })
        if (result.success) {
          set({
            todayStatus: 'checked',
            todayCheckIn: result.checkIn,
            streakDays: result.streakDays
          })
        }
      },

      loadFeed: async (page = 1) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'getFeed',
          data: { page, pageSize: 10 }
        })
        set({
          feed: page === 1 ? result.list : [...get().feed, ...result.list]
        })
      }
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Taro.getStorageSync(name),
        setItem: (name, value) => Taro.setStorageSync(name, value),
        removeItem: (name) => Taro.removeStorageSync(name)
      }))
    }
  )
)
```

---

## 六、详细实施计划

---

### Phase 0：账号与资质（1-3 天，部分阻塞）

| # | 任务 | 操作路径 | 产出物 | 预计耗时 |
|---|------|----------|--------|----------|
| 0.1 | 注册小程序账号 | [微信公众平台](https://mp.weixin.qq.com/) → 立即注册 → 小程序 | 小程序账号 + 邮箱绑定 | 30 分钟 |
| 0.2 | 企业主体认证 | 微信公众平台 → 设置 → 基本设置 → 主体信息 → 认证 | 企业认证（商用必需） | **1-3 个工作日（阻塞项）** |
| 0.3 | 开通微信云开发 | 微信公众平台 → 开发 → 云开发 → 开通 → 免费版 | 云开发环境 ID | 5 分钟 |
| 0.4 | 绑定开发者 | 微信公众平台 → 成员管理 → 添加项目成员 | 开发/体验权限 | 10 分钟 |
| 0.5 | 准备隐私政策页面 | [腾讯云隐私政策生成工具](https://cloud.tencent.com/product/privacypolicy) | 隐私政策 URL | 1 小时 |
| 0.6 | 配置服务器域名白名单 | 微信公众平台 → 开发 → 开发管理 → 服务器域名 | `dicebear.com`（头像） | 10 分钟 |

> **阻塞项**：0.2 企业认证未完成前，无法提交审核和商用收款。建议**今天就提交认证**。  
> **注意**：0.6 配置 `dicebear.com` 域名白名单，否则头像无法加载。图片使用云存储，无需配置外部图片域名。

---

### Phase 1：Taro 项目骨架（1 天）

| # | 任务 | 命令/操作 | 验证方式 |
|---|------|-----------|----------|
| 1.1 | 全局安装 Taro CLI | `npm install -g @tarojs/cli@3.6.35` | `taro --version` |
| 1.2 | 初始化项目 | `taro init kimi-agent-wx` → React + TypeScript + Webpack + Sass + 微信 | 项目目录生成 |
| 1.3 | 安装依赖 | `cd kimi-agent-wx && npm install` | `node_modules` 存在 |
| 1.4 | 安装 weapp-tailwindcss | `npm install -D weapp-tailwindcss@3` + 配置 `config/index.js` | 能写 `className="bg-red-500"` |
| 1.5 | 安装 Zustand | `npm install zustand` | - |
| 1.6 | 配置云开发环境 | `src/utils/cloud.ts` 写入环境 ID（见下方代码） | 编译无报错 |
| 1.7 | 配置 `app.config.ts` | 写入 5 个页面路由 + 4 个 tabBar | 微信开发者工具能预览 |
| 1.8 | 首次编译测试 | `npm run dev:weapp` | 微信开发者工具正常显示 |
| 1.9 | 替换图标库 | 将 `phosphor-react` 替换为 Taro 内置图标或自定义 SVG | 图标正常显示 |
| 1.10 | 配置外部域名 | 开发者工具 → 详情 → 本地设置 → 不校验域名（开发期） | dicebear 头像正常加载 |

**1.6 云开发初始化代码（`src/utils/cloud.ts`）：**

```typescript
import Taro from '@tarojs/taro'

const CLOUD_ENV = '你的云开发环境ID'  // 从微信公众平台获取

export function initCloud() {
  Taro.cloud.init({
    env: CLOUD_ENV,
    traceUser: true,
  })
}
```

**1.7 app.config.ts 模板：**

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/feed/index',
    'pages/stats/index',
    'pages/profile/index',
    'pages/checkin/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Aura Check',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#333',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/feed/index', text: '动态' },
      { pagePath: 'pages/stats/index', text: '统计' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
})
```

---

### Phase 2：数据库与云函数（2 天）

#### 2.1 创建数据库集合

在云开发控制台 → 数据库 → 添加集合：
1. `users`
2. `checkins`

#### 2.2 创建索引

在对应集合的「索引管理」中创建：

| 集合 | 索引字段 | 类型 |
|------|----------|------|
| users | `openid` | 唯一索引 |
| checkins | `userId` + `date` | 复合索引 |
| checkins | `createdAt` | 单字段索引 |

#### 2.3 创建并部署 4 个云函数

在 `cloud/functions/` 下创建目录，每个云函数目录结构：

```
cloud/functions/login/
├── config.json
├── index.ts
└── package.json
```

**通用 `config.json`：**

```json
{
  "permissions": {
    "openapi": ["security.msgSecCheck", "security.imgSecCheck"]
  }
}
```

**通用 `package.json`：**

```json
{
  "name": "login",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

**云函数 1：`login`**

```typescript
import cloud from 'wx-server-sdk'
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

export async function main(event: any, context: any) {
  const { OPENID } = cloud.getWXContext()

  const { data } = await db.collection('users').where({ openid: OPENID }).get()

  if (data.length > 0) {
    return { success: true, user: data[0], isNewUser: false }
  }

  const newUser = {
    openid: OPENID,
    nickName: '微信用户',
    avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${OPENID}&size=80`,
    streakDays: 0,
    totalCheckIns: 0,
    weeklyFitnessDone: 0,
    weeklyStudyDone: 0,
    monthDone: 0,
    mantra: '',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  }

  const { _id } = await db.collection('users').add({ data: newUser })
  return { success: true, user: { ...newUser, _id }, isNewUser: true }
}
```

**云函数 2：`addCheckIn`**

```typescript
import cloud from 'wx-server-sdk'
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function main(event: any) {
  const { OPENID } = cloud.getWXContext()
  const { category, emoji, note, checkInType, photoUrl } = event

  // 1. 文本安全校验
  if (note) {
    try {
      const secRes = await cloud.openapi.security.msgSecCheck({ content: note })
      if (secRes.result.suggest !== 'pass') {
        return { success: false, message: '内容包含敏感信息' }
      }
    } catch (e) {
      // 继续执行，不阻塞
    }
  }

  const today = getTodayStr()

  // 2. 查今日是否已打卡（同一 category）
  const exist = await db.collection('checkins').where({
    userId: OPENID,
    date: today,
    category
  }).get()

  if (exist.data.length > 0) {
    return { success: false, message: '今日该类别已打卡' }
  }

  // 3. 写入打卡记录
  const checkInData = {
    userId: OPENID,
    category,
    checkInType,
    emoji,
    note,
    photoUrl: photoUrl || '',
    date: today,
    createdAt: db.serverDate(),
  }
  const { _id } = await db.collection('checkins').add({ data: checkInData })

  // 4. 更新用户统计
  const user = await db.collection('users').where({ openid: OPENID }).get()
  const u = user.data[0]

  // 计算连续天数（简化版：只要昨天有打卡就+1，否则重置为1）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  const yCheck = await db.collection('checkins').where({ userId: OPENID, date: yStr }).get()
  const newStreak = yCheck.data.length > 0 ? (u.streakDays || 0) + 1 : 1

  // 周/月统计（简化版，实际应计算本周/本月）
  const weeklyKey = category === 'fitness' ? 'weeklyFitnessDone' : 'weeklyStudyDone'
  const weeklyUpdate = category === 'fitness' || category === 'study'
    ? { [weeklyKey]: _.inc(1) }
    : {}

  await db.collection('users').doc(u._id).update({
    data: {
      streakDays: newStreak,
      totalCheckIns: _.inc(1),
      monthDone: _.inc(1),
      ...weeklyUpdate,
      updatedAt: db.serverDate(),
    }
  })

  return {
    success: true,
    checkIn: { ...checkInData, _id, createdAt: new Date() },
    streakDays: newStreak
  }
}
```

**云函数 3：`getHomeData`**

```typescript
import cloud from 'wx-server-sdk'
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getPast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return days
}

export async function main() {
  const { OPENID } = cloud.getWXContext()

  const today = getTodayStr()
  const days = getPast7Days()

  // 1. 今日打卡状态
  const todayRes = await db.collection('checkins').where({
    userId: OPENID,
    date: today
  }).get()

  // 2. 过去 7 天打卡
  const weekRes = await db.collection('checkins').where({
    userId: OPENID,
    date: db.command.in(days)
  }).get()

  const weekMap = new Map(weekRes.data.map(d => [d.date, d]))
  const weeklyStrip = days.map(date => ({
    date,
    status: weekMap.has(date) ? 'checked' as const : 'pending' as const,
    category: weekMap.get(date)?.category
  }))

  // 3. 用户信息
  const userRes = await db.collection('users').where({ openid: OPENID }).get()
  const u = userRes.data[0] || {}

  return {
    todayStatus: todayRes.data.length > 0 ? 'checked' : 'pending',
    todayCheckIn: todayRes.data[0] || null,
    weeklyStrip,
    streakDays: u.streakDays || 0,
    goals: {
      weeklyFitnessDone: u.weeklyFitnessDone || 0,
      weeklyFitnessTarget: 4,
      weeklyStudyDone: u.weeklyStudyDone || 0,
      weeklyStudyTarget: 5,
      monthDone: u.monthDone || 0,
      monthTarget: 20,
    }
  }
}
```

**云函数 4：`getFeed`**

```typescript
import cloud from 'wx-server-sdk'
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

export async function main(event: any) {
  const { page = 1, pageSize = 10 } = event

  const { data: checkins } = await db.collection('checkins')
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  // 关联查询用户信息
  const openIds = [...new Set(checkins.map(c => c.userId))]
  const { data: users } = await db.collection('users')
    .where({ openid: _.in(openIds) })
    .get()

  const userMap = new Map(users.map(u => [u.openid, u]))

  const list = checkins.map(c => ({
    checkIn: c,
    user: {
      nickName: userMap.get(c.userId)?.nickName || '微信用户',
      avatarUrl: userMap.get(c.userId)?.avatarUrl || '',
    }
  }))

  return {
    list,
    hasMore: checkins.length === pageSize
  }
}
```

**部署命令**：

在微信开发者工具中，右键每个云函数目录 → **"创建并部署：云端安装依赖"**。

---

### Phase 3：页面迁移（3-4 天）

按优先级逐个迁移，每个页面包含：JSX → Taro 组件替换 → API 接入 → 真机调试。

#### 3.1 Tab 页面（4 个）

| # | 页面 | 核心组件 | 复杂度 | 备注 |
|---|------|----------|--------|------|
| 3.1 | **Home（首页）** | DateGreeting, WeeklyStrip, TodayCheckInCard, GoalProgress, StreakPreview | ⭐⭐⭐⭐⭐ | 最复杂，先验证数据流 |
| 3.2 | **Feed（动态广场）** | FeedCard（含图片展示）, ScrollView | ⭐⭐⭐ | 原 Friends 页改造，无点赞评论 |
| 3.3 | **Stats（统计）** | CalendarArchive, MonthlyStats | ⭐⭐⭐⭐ | 保留，但先做基础版 |
| 3.4 | **Profile（我的）** | UserInfoCard, SettingsList | ⭐⭐ | 去掉 BadgePreview |

#### 3.2 次级页面（1 个）

| # | 页面 | 核心组件 | 复杂度 | 备注 |
|---|------|----------|--------|------|
| 3.5 | **CheckIn（打卡页）** | CategoryPicker, MoodPicker, NoteInput, PhotoUploader, CheckInButton | ⭐⭐⭐⭐ | 只支持 text/photo，去掉 TypeSelector |

#### 3.3 Web → Taro 组件替换速查

| Web | Taro | 注意点 |
|-----|------|--------|
| `<div>` | `<View>` | 最外层布局 |
| `<span>` / `<p>` | `<Text>` | 文本必须包在 Text 里 |
| `<img>` | `<Image>` | 必须加 `mode="aspectFill"`，`cloud://` 文件需配置 |
| `<button>` | `<Button>` | 微信默认样式需覆盖 |
| `<input>` / `<textarea>` | `<Input>` / `<Textarea>` | 受控组件写法有差异 |
| `<scroll>` | `<ScrollView>` | 弹性滚动用 `scroll-y` |
| `phosphor-react` | Taro 图标 / 自定义 SVG | 全项目替换 |

#### 3.4 图片上传组件（PhotoUploader）

```typescript
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

export default function PhotoUploader({ value, onChange }: Props) {
  const handleChoose = async () => {
    const res = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })

    const tempPath = res.tempFiles[0].tempFilePath

    // 上传到云存储
    const uploadRes = await Taro.cloud.uploadFile({
      cloudPath: `checkins/${Date.now()}.jpg`,
      filePath: tempPath,
    })

    onChange(uploadRes.fileID)
  }

  return (
    <View onClick={handleChoose}>
      {value ? (
        <Image src={value} mode="aspectFill" />
      ) : (
        <View>+ 添加图片</View>
      )}
    </View>
  )
}
```

> **图片显示**：云存储 fileID 可直接用于 `<Image src="cloud://xxx" />`，或在需要时调用 `Taro.cloud.getTempFileURL()` 换取 HTTPS 链接。

---

### Phase 4：视觉与动画保留（1-2 天）

用户明确要求**保留视觉动效**，以下是小程序实现方案。

#### 4.1 玻璃拟态（完整保留 + 降级）

```scss
// src/styles/glass.scss
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

// 低端机降级
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
}

// 暗色玻璃变体
.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
```

#### 4.2 动态背景（Liquid Glass Background）

```scss
.liquid-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d4 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,..."); // noise texture
    opacity: 0.04;
    pointer-events: none;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float-glass 20s infinite alternate;

    &.blob-a {
      width: 400px; height: 400px;
      background: rgba(255, 200, 180, 0.4);
      top: -10%; left: -10%;
      animation-name: float-glass-a;
    }
    &.blob-b {
      width: 300px; height: 300px;
      background: rgba(180, 220, 255, 0.35);
      bottom: 10%; right: -5%;
      animation-name: float-glass-b;
      animation-delay: -7s;
    }
    &.blob-c {
      width: 250px; height: 250px;
      background: rgba(200, 255, 220, 0.3);
      top: 40%; left: 30%;
      animation-name: float-glass-c;
      animation-delay: -14s;
    }
  }
}

@keyframes float-glass-a {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 60px); }
}
@keyframes float-glass-b {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-30px, -40px); }
}
@keyframes float-glass-c {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, -30px); }
}
```

#### 4.3 动画保留方案

| 原 Web 动画 | 小程序实现方案 | 代码片段 |
|-------------|---------------|----------|
| **页面转场（jelly scale）** | Taro 原生页面切换 + CSS 淡入 | `.page-enter { animation: fadeIn 0.3s ease; }` |
| **卡片 stagger 入场** | CSS `@keyframes` + `animation-delay` | 见下方 |
| **Card tap 反馈** | `:active` + `transform: scale(0.97)` | `.card:active { transform: scale(0.97); transition: transform 0.15s; }` |
| **Jelly Spring Modal** | 底部弹出 + `cubic-bezier(0.34, 1.56, 0.64, 1)` | `transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);` |
| **Toast 入场/离场** | CSS `transition: opacity 0.25s` + `translateY` | 见下方 |
| **打卡成功庆祝** | Confetti 用 CSS 粒子或简化庆祝动画 | 见下方 |
| **周打卡条滚动** | CSS `overflow-x: auto` + `scroll-snap-type: x mandatory` | 保留 |

**Stagger 入场动画：**

```scss
.stagger-container {
  .stagger-item {
    opacity: 0;
    transform: translateY(16px);
    animation: stagger-in 0.5s ease forwards;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.08}s;
      }
    }
  }
}

@keyframes stagger-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Toast 组件：**

```scss
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
  z-index: 9999;

  &.visible {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
```

**打卡成功庆祝（简化 Confetti）：**

```scss
.celebrate {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;

  .particle {
    position: absolute;
    width: 8px; height: 8px;
    border-radius: 50%;
    top: 50%; left: 50%;
    animation: confetti-pop 0.8s ease-out forwards;

    @for $i from 1 through 12 {
      &:nth-child(#{$i}) {
        background: hsl($i * 30, 80%, 60%);
        transform: rotate($i * 30deg);
        animation-delay: #{$i * 0.02}s;
      }
    }
  }
}

@keyframes confetti-pop {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}
```

#### 4.4 减少动画偏好适配

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 七、联调与上线

### 7.1 联调测试清单

- [ ] 新用户首次打开，自动注册并登录
- [ ] 完成一次**文字打卡**，验证数据库有记录，首页今日状态更新
- [ ] 完成一次**图片打卡**，选择相册/拍照，图片上传云存储正常，Feed 中图片正常显示
- [ ] 查看首页，周打卡条显示正确，连续天数计算正确，目标进度环正常
- [ ] 进入**动态广场**，能看到所有人（包括自己）的公开打卡，图片正常加载
- [ ] 进入**统计页**，日历热力图显示打卡分布，基础数据正确
- [ ] 进入**个人资料页**，头像、昵称、连续天数、总打卡数显示正确
- [ ] 打卡文字输入敏感词，触发 `msgSecCheck` 拦截提示
- [ ] 断网后重新联网，刷新数据正常恢复
- [ ] 低端机（Android 千元机）页面滑动流畅，动画不卡顿

### 7.2 提交审核前检查项

- [ ] 隐私政策页面已配置且可访问（小程序设置中填写）
- [ ] 用户协议页面已配置
- [ ] 打卡备注已接入 `msgSecCheck`（已在 `addCheckIn` 云函数中接入）
- [ ] 小程序信息（名称、图标、简介）已完善
- [ ] 体验版已发给 3 人测试通过
- [ ] `dicebear.com` 已在服务器域名白名单中配置
- [ ] 云存储图片无需域名白名单（微信原生支持）

### 7.3 提审流程

1. 微信开发者工具 → 上传代码 → 填写版本号（如 `1.0.0`）
2. 微信公众平台 → 版本管理 → 提交审核
3. 填写功能页面（首页、打卡页、动态页）
4. 等待审核（通常 1-3 个工作日）
5. 审核通过后 → 发布上线

---

## 八、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 企业认证阻塞 | 无法提审 | 优先完成 Phase 0.2，今天提交 |
| 低端机动画卡顿 | 体验差 | 保留 `@supports not (backdrop-filter)` 降级；`prefers-reduced-motion` 尊重系统设置 |
| 云开发免费额度不够 | 服务中断 | 按量付费很便宜，初期月成本 < 10 元 |
| 微信审核不通过 | 无法上线 | 避免敏感功能；隐私政策完整；msgSecCheck 已接入 |
| dicebear 头像加载失败 | 用户无头像 | 准备默认头像本地 base64 兜底 |
| 图片审核风险 | 用户上传违规图 | addCheckIn 已接入 imgSecCheck（fileID 需先下载为 Buffer） |
| 数据被云开发锁定 | 后期迁移难 | 云开发控制台支持导出 JSON 备份 |

---

## 九、V2 迭代清单（上线后再做）

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P1 | 点赞系统 | `likes` 集合 + toggleLike 云函数 + LikeButton 弹簧动画 |
| P1 | 评论系统 | `comments` 集合 + addComment 云函数 |
| P2 | 好友关系 | `friends` 集合 + addFriend，动态改为"仅好友可见"开关 |
| P2 | AI Chat | `aiChat` 云函数 + 大模型 API（Kimi/通义/DeepSeek） |
| P2 | 排行榜 | `getRanking` 云函数，基于连续天数 |
| P3 | 挑战系统 | `challenges` + `userChallenges` + Discover 页面 |
| P3 | 徽章系统 | `badges` + `userBadges` + BadgeGrid 组件 |
| P3 | 更多打卡类型 | timer（计时器）、quantity（量化）、voice（语音） |
| P3 | 统计增强 | 趋势图表、分类对比、年度回顾、数据导出 |

---

## 十、今日可立即启动的任务

1. **注册小程序账号**（30 分钟）
2. **提交企业主体认证**（阻塞项，今天必须做）
3. **开通云开发**，记录环境 ID（5 分钟）
4. **全局安装 Taro CLI**，初始化项目（30 分钟）
5. **安装依赖**：Zustand、weapp-tailwindcss（15 分钟）

做完这 5 步，就有了可编译运行的小程序骨架。
