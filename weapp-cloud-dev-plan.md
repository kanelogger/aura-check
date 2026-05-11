# 微信小程序云开发技术方案

> 项目：hdhd 自律打卡 —— Web → 微信小程序迁移方案
> 方案选择：**微信云开发（Serverless）**
> 目标：最小成本、最快速度完成小程序化

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        微信小程序端 (Taro)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   页面层     │  │   状态层     │  │      API 层          │ │
│  │ Home/CheckIn│  │ useAppStore │  │   cloud.functions   │ │
│  │ Friends/etc │  │  (Zustand)  │  │   cloud.database    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      微信云开发环境                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   云函数     │  │   云数据库   │  │      云存储         │ │
│  │  login      │  │   users     │  │   头像/图片         │ │
│  │  checkIn    │  │   checkins  │  │                     │ │
│  │  getFeed    │  │   friends   │  │                     │ │
│  │  like       │  │   likes     │  │                     │ │
│  │  ranking    │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 前端框架 | Taro 3.x (React) | 复用 React JSX 语法，小程序原生兼容 |
| 状态管理 | Zustand + Persist | 轻量，支持本地缓存兜底 |
| 样式方案 | Sass + weapp-tailwindcss | 保留 Tailwind 开发体验，降级时兼容 |
| 后端服务 | 微信云开发 | 零运维，原生集成 |
| 数据库 | 云数据库 (MongoDB-like) | 文档型，契合 JavaScript 生态 |
| 存储 | 云存储 | 用户头像、打卡图片 |

---

## 二、数据库设计

### 2.1 集合清单

| 集合 | 说明 | 核心索引 |
|------|------|----------|
| `users` | 用户基础信息 | `openid` (唯一), `createdAt` |
| `checkins` | 打卡记录 | `userId + date` (复合), `createdAt` |
| `friends` | 好友关系 | `userId + friendId` (复合, 唯一) |
| `likes` | 点赞记录 | `checkInId + userId` (复合, 唯一) |

### 2.2 数据 Schema

#### users

```typescript
interface User {
  _id: string
  _openid: string           // 微信自动注入，或手动存储
  nickName: string
  avatarUrl: string
  streakDays: number        // 连续打卡天数（冗余，减少查询）
  totalCheckIns: number     // 总打卡次数（冗余）
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
  mood: string              // emoji 或 mood key
  note: string
  date: string              // '2026-05-11' 格式，方便按天查询
  likes: number             // 点赞数（冗余）
  createdAt: Date
}
```

#### friends

```typescript
interface Friend {
  _id: string
  userId: string            // 发起者 openid
  friendId: string          // 好友 openid
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: Date
}
```

#### likes

```typescript
interface Like {
  _id: string
  checkInId: string         // 对应 checkins._id
  userId: string            // 点赞者 openid
  createdAt: Date
}
```

### 2.3 冗余设计说明

- `checkins.likes`：点赞数冗余，避免频繁聚合查询
- `users.streakDays` / `totalCheckIns`：用户统计冗余，首页直接读用户表

> **注意**：冗余字段需要业务层保证一致性，云函数中更新 checkins 时同步更新 users。

---

## 三、云函数 API 设计

### 3.1 登录 / 自动注册：`login`

- **调用方式**：`wx.cloud.callFunction({ name: 'login' })`
- **请求**：空（自动从 wxContext 取 openid）

**响应：**

```typescript
interface LoginResponse {
  success: true
  user: User                 // 用户完整信息
  isNewUser: boolean
}
```

**业务逻辑：**
1. 通过 `cloud.getWXContext()` 获取 `OPENID`
2. 查询 `users` 集合，存在则返回用户信息
3. 不存在则创建新用户（nickName 默认 "微信用户"，前端可后续调用 `updateUser` 更新）

---

### 3.2 打卡：`addCheckIn`

**请求：**

```typescript
interface AddCheckInRequest {
  category: string
  mood: string
  note?: string
}
```

**响应：**

```typescript
interface AddCheckInResponse {
  success: boolean
  checkIn?: CheckIn
  streakDays: number        // 更新后的连续天数
  message?: string          // 失败原因：如 "今日已打卡"
}
```

**业务逻辑：**
1. 校验今日是否已打卡（`userId + date` 复合查询）
2. 已打卡 → 返回 `success: false, message: "今日已打卡"`
3. 未打卡 → 写入 `checkins`，更新 `users.streakDays` 和 `totalCheckIns`
4. 返回新记录 + 更新后的连续天数

---

### 3.3 获取首页数据：`getHomeData`

**响应：**

```typescript
interface HomeDataResponse {
  todayStatus: 'checked' | 'pending'
  todayCheckIn?: CheckIn    // 今日打卡详情（如果已打卡）
  weeklyStrip: Array<{
    date: string
    status: 'checked' | 'pending'
    category?: string
  }>
  streakDays: number
}
```

**业务逻辑：**
1. 查询今日是否有打卡记录
2. 查询过去 7 天的打卡记录，生成 weeklyStrip
3. 返回用户连续打卡天数

---

### 3.4 获取好友动态：`getFeed`

**请求：**

```typescript
interface GetFeedRequest {
  page: number              // 分页，默认 1
  pageSize: number          // 默认 10
}
```

**响应：**

```typescript
interface GetFeedResponse {
  list: Array<{
    checkIn: CheckIn
    user: Pick<User, 'nickName' | 'avatarUrl'>
    isLiked: boolean        // 当前用户是否点过赞
  }>
  hasMore: boolean
}
```

**业务逻辑：**
1. 从 `friends` 查询 `accepted` 状态的好友 `friendId` 列表
2. 从 `checkins` 查询这些 `userId` 的记录，按时间倒序
3. 关联查询 `users` 表获取用户信息
4. 查询 `likes` 表标记当前用户是否点赞

---

### 3.5 点赞 / 取消点赞：`toggleLike`

**请求：**

```typescript
interface ToggleLikeRequest {
  checkInId: string
}
```

**响应：**

```typescript
interface ToggleLikeResponse {
  success: boolean
  liked: boolean            // 操作后的状态
  likes: number             // 更新后的点赞数
}
```

**业务逻辑：**
1. 查询 `likes` 集合，存在则删除（取消赞），不存在则添加
2. 原子更新 `checkins.likes` 计数（+1 或 -1）
3. 返回最新状态

---

### 3.6 排行榜：`getRanking`

**响应：**

```typescript
interface GetRankingResponse {
  list: Array<{
    rank: number
    user: Pick<User, 'nickName' | 'avatarUrl' | 'streakDays' | 'totalCheckIns'>
  }>
  myRank?: number           // 当前用户排名
}
```

**业务逻辑：**
1. 按 `streakDays` 倒序、`totalCheckIns` 倒序查询 `users`
2. 限制 Top 50
3. 遍历计算当前用户排名

---

### 3.7 添加好友：`addFriend`

**请求：**

```typescript
interface AddFriendRequest {
  friendId: string          // 对方 openid 或临时邀请码
}
```

**响应：**

```typescript
interface AddFriendResponse {
  success: boolean
  status: 'pending' | 'accepted' | 'already_friend'
}
```

---

## 四、小程序端改造方案

### 4.1 项目结构

```
kimi-agent-wx/
├── config/                  # Taro 配置
├── src/
│   ├── app.config.ts        # 页面路由配置
│   ├── app.tsx              # 入口
│   ├── pages/               # 页面（复用现有页面逻辑）
│   │   ├── index/
│   │   ├── checkin/
│   │   ├── friends/
│   │   ├── stats/
│   │   └── profile/
│   ├── components/          # 公共组件
│   ├── hooks/
│   │   └── useAppStore.ts   # 状态管理（Zustand）
│   ├── api/                 # 云函数封装层
│   │   ├── login.ts
│   │   ├── checkIn.ts
│   │   ├── feed.ts
│   │   └── ...
│   ├── types/               # TypeScript 类型（复用现有）
│   └── utils/
│       └── cloud.ts         # 云开发初始化
├── cloud/                   # 云函数源码
│   └── functions/
│       ├── login/
│       ├── addCheckIn/
│       ├── getFeed/
│       └── ...
└── package.json
```

### 4.2 状态管理改造（Zustand）

用 Zustand 替换现有的 React Context，支持异步和本地持久化：

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

  // Actions
  init: () => Promise<void>
  checkIn: (data: AddCheckInRequest) => Promise<void>
  toggleLike: (checkInId: string) => Promise<void>
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

      init: async () => {
        const { result } = await Taro.cloud.callFunction({ name: 'login' })
        set({ user: result.user })

        const { result: homeRes } = await Taro.cloud.callFunction({
          name: 'getHomeData'
        })
        set({
          todayStatus: homeRes.todayStatus,
          todayCheckIn: homeRes.todayCheckIn,
          streakDays: homeRes.streakDays
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

      toggleLike: async (checkInId) => {
        const { result } = await Taro.cloud.callFunction({
          name: 'toggleLike',
          data: { checkInId }
        })
        // 更新本地 feed 状态
        const feed = get().feed.map(item =>
          item.checkIn._id === checkInId
            ? { ...item, isLiked: result.liked, checkIn: { ...item.checkIn, likes: result.likes } }
            : item
        )
        set({ feed })
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

### 4.3 UI 组件替换映射

| Web (React + shadcn) | 小程序 (Taro) | 备注 |
|----------------------|---------------|------|
| `div` | `View` | 最外层布局 |
| `span` / `p` | `Text` | 文本（小程序里 `View` 内不能直接放字符串） |
| `img` | `Image` | 需要指定 `mode`（aspectFill, widthFix 等） |
| `button` | `Button` | 微信小程序 Button 有特殊样式，需覆盖 |
| `input` | `Input` | 受控组件写法有差异 |
| `scroll` | `ScrollView` | 弹性滚动直接用 `scroll-y` |
| shadcn `Dialog` | 自定义 Mask + View | 小程序没有 portal |
| shadcn `Sheet` | 自定义底部弹出 | CSS `transform: translateY` |
| Framer Motion | CSS `transition` + `animation` | 动画降级（见下方） |

### 4.4 玻璃拟态（Glassmorphism）适配

小程序支持 CSS `backdrop-filter`，但部分低端机不支持。建议降级方案：

```css
/* 基础玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
}

/* 不支持 backdrop-filter 的降级 */
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.85);
  }
}
```

### 4.5 动画降级方案

| 原 Web 动画 | 小程序替代方案 | 实现方式 |
|-------------|----------------|----------|
| 页面转场（jelly scale） | 页面原生切换 + 简单淡入 | 利用 Taro 页面生命周期 + CSS `opacity` |
| 卡片 stagger 入场 | 逐个淡入上移 | CSS `@keyframes` + `animation-delay` |
| Card hover / tap | 点击缩放反馈 | `:active` 伪类 + `transform: scale(0.97)` |
| Jelly Spring Modal | 底部弹出 + 弹性缓动 | CSS `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 点赞弹簧效果 | 缩放动画 | CSS `@keyframes heart-beat` |
| Toast 入场/离场 | 淡入淡出 | CSS `transition: opacity 0.25s` |

---

## 五、迁移实施步骤

### Phase 1：搭建 Taro + 云开发骨架（1 天）

- [ ] 初始化 Taro 项目：`npx @tarojs/cli init`
  - 选择：React + TypeScript + Webpack + Sass
- [ ] 微信公众平台 → 开发 → 云开发 → 开通（免费）
- [ ] 配置 `project.config.json` 云开发环境 ID
- [ ] 初始化云开发：`Taro.cloud.init({ env: 'xxx' })`
- [ ] 部署第一个测试云函数，验证连通性

### Phase 2：数据库 + 核心云函数（1-2 天）

- [ ] 云开发控制台创建 4 个集合（users, checkins, friends, likes）
- [ ] 创建索引（特别是复合索引：userId+date, userId+friendId, checkInId+userId）
- [ ] 编写并部署 7 个核心云函数（login, addCheckIn, getHomeData, getFeed, toggleLike, getRanking, addFriend）
- [ ] 云开发控制台测试每个云函数

### Phase 3：小程序端页面迁移（2-3 天）

- [ ] 复制 `types/` 到 Taro 项目
- [ ] 搭建 Zustand Store + API 层
- [ ] 逐个页面迁移：
  - [ ] Home（最复杂，先验证数据流）
  - [ ] CheckIn（表单提交）
  - [ ] Friends（列表 + 点赞）
  - [ ] Stats（读取历史数据）
  - [ ] Profile（用户信息展示）
- [ ] 自定义组件重建：GlassCard、Avatar、BottomTabBar

### Phase 4：视觉还原 + 动画降级（1-2 天）

- [ ] Tailwind → 小程序 CSS（可用 `weapp-tailwindcss` 插件保留 Tailwind）
- [ ] Framer Motion → CSS transition
- [ ] 页面转场：利用 Taro 页面生命周期 + CSS
- [ ] 真机调试（重点测试低端机性能）

### Phase 5：联调 + 上线准备（1 天）

- [ ] 多人测试：好友关系、点赞、排行榜
- [ ] 性能优化：图片懒加载、列表虚拟滚动（如需要）
- [ ] 提交体验版 → 上传代码 → 提交审核

---

## 六、关键技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 前端框架 | **Taro 3.x (React)** | 复用现有 React 代码，JSX 语法一致 |
| 状态管理 | **Zustand** | 比 Redux 轻量，支持 persist，React 生态 |
| 样式方案 | **Sass + weapp-tailwindcss** | 保留 Tailwind 开发体验，复杂样式用 Sass |
| UI 组件库 | **自定义 + Taro UI** | Taro UI 提供基础组件，复杂视觉组件自己写 |
| 图片存储 | **云存储 + CDN** | 头像等走 `cloud.uploadFile`，长期图片走外部 CDN |
| 数据分页 | **skip + limit** | 简单实现，后期数据量大改用游标分页 |
| 用户鉴权 | **微信 OpenID** | 云函数自动获取，无需自建登录态 |

---

## 七、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 云开发免费额度不够 | 服务中断 | 按量付费很便宜，初期月成本 < 10 元 |
| 复杂查询性能差 | 列表加载慢 | 提前建好索引；排行榜用定时触发器预计算 |
| 低端机动画卡顿 | 体验差 | 减少同时动画元素；提供 "关闭动画" 设置 |
| 数据导出/迁移困难 | 后期被锁定 | 云开发支持导出 JSON；自建数据库时可用脚本迁移 |
| 微信审核不通过 | 无法上线 | 避免敏感功能；确保用户协议和隐私政策完整 |

---

## 八、云开发控制台操作速查

### 8.1 开通云开发

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「云开发」
3. 点击「开通」，选择「免费版」
4. 记录「环境 ID」，填入 `app.config.ts`

### 8.2 创建集合和索引

```javascript
// 云开发控制台 → 数据库 → 添加集合
// 然后在每个集合中创建索引：

// users 集合
{
  "openid": 1          // 唯一索引
}

// checkins 集合
{
  "userId": 1,
  "date": -1           // 复合索引
}

// friends 集合
{
  "userId": 1,
  "friendId": 1        // 复合唯一索引
}

// likes 集合
{
  "checkInId": 1,
  "userId": 1          // 复合唯一索引
}
```

### 8.3 云函数部署

```bash
# 在项目根目录
taro build --type weapp    # 编译小程序

# 使用微信开发者工具
# 1. 导入项目
# 2. 点击「云开发」→「云函数」→「新建云函数」
# 3. 将 cloud/functions/ 下的代码复制到对应云函数目录
# 4. 右键云函数目录 →「创建并部署：云端安装依赖」
```

---

## 九、参考资源

- [Taro 官方文档](https://docs.taro.zone/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [微信云开发数据库](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [weapp-tailwindcss](https://github.com/sonofmagic/weapp-tailwindcss)

---

> **最后更新**：2026-05-11
> **状态**：待实施
> **预计总工期**：6-9 天（含联调）
