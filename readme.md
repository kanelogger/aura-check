# Aura Check

一个基于 Taro + 微信云开发的自律打卡小程序，支持文字/图片打卡、公开动态流、统计日历与连续天数追踪。

---

## 功能

- **微信一键登录** — OpenID 自动鉴权，自动注册新用户
- **文字/图片打卡** — 选择分类（健身/学习/阅读/冥想/编程）+ 心情 + 备注 + 可选图片上传
- **首页** — 今日状态、周打卡条、连续天数、本周/本月目标进度
- **动态广场** — 全公开打卡流，支持分页加载
- **统计页** — 日历热力图 + 本月概览（健身/学习/总打卡/连续天数）
- **个人资料** — 头像、昵称、个人宣言编辑，退出登录
- **内容安全** — 文本 `msgSecCheck` + 图片 `imgSecCheck` 双审核

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Taro 3.6.35 + React 18 + TypeScript |
| 构建工具 | Webpack 5 |
| 状态管理 | Zustand + persist（Taro Storage 适配） |
| 样式 | Sass + inline style |
| 后端 | 微信云开发（云数据库 + 云函数） |
| 数据库 | 云数据库 MongoDB-like（`users` + `checkins`） |
| 存储 | 微信云存储（打卡图片） |

---

## 项目结构

```
wxapp/
├── cloud/functions/          # 云函数
│   ├── login/                # 登录/自动注册
│   ├── addCheckIn/           # 打卡 + 内容安全审核
│   ├── getHomeData/          # 首页数据
│   ├── getFeed/              # 动态广场分页
│   ├── getUserCheckIns/      # 用户历史打卡记录
│   └── updateUser/           # 更新用户资料
├── src/
│   ├── pages/                # 页面
│   │   ├── index/            # 首页
│   │   ├── checkin/          # 打卡页
│   │   ├── feed/             # 动态广场
│   │   ├── stats/            # 统计页
│   │   ├── profile/          # 我的
│   │   ├── profile/edit/     # 编辑资料
│   │   └── login/            # 登录页
│   ├── components/           # 组件
│   ├── hooks/
│   │   ├── useAppStore.ts    # Zustand 全局状态
│   │   └── useRequireAuth.ts # 登录鉴权
│   ├── api/                  # 云函数 API 封装
│   ├── types/                # TypeScript 类型
│   ├── styles/               # 全局 SCSS（玻璃拟态 + 动画）
│   └── utils/
│       └── cloud.ts          # 云开发初始化
├── config/
│   └── index.js              # Taro 配置（含 CLOUD_ENV 注入）
├── dist/                     # 编译输出（微信开发者工具指向此处）
├── .env.local                # 本地环境变量（云开发环境 ID）
└── package.json
```

---

## 快速开始

### 1. 安装依赖

```bash
cd wxapp
npm install
```

### 2. 配置云开发环境 ID

创建 `wxapp/.env.local`：

```
CLOUD_ENV=your-cloud-env-id
```

> `your-cloud-env-id` 从微信公众平台 → 云开发控制台获取。
> CI 构建时无需此文件，直接设置环境变量 `CLOUD_ENV=xxx` 即可。

### 3. 本地开发编译

```bash
npm run dev:weapp
```

用**微信开发者工具**打开 `wxapp/dist` 目录进行预览。

### 4. 生产构建

```bash
npm run build
```

---

## 云函数部署

在微信开发者工具中，右键以下云函数目录 → **"创建并部署：云端安装依赖"**：

- `cloud/functions/login`
- `cloud/functions/addCheckIn`
- `cloud/functions/getHomeData`
- `cloud/functions/getFeed`
- `cloud/functions/getUserCheckIns`
- `cloud/functions/updateUser`

---

## 数据库索引

在云开发控制台 → 数据库 → 索引管理中创建：

| 集合 | 索引 | 类型 |
|------|------|------|
| `users` | `openid` | 唯一 |
| `checkins` | `userId` + `date` | 复合 |
| `checkins` | `createdAt` | 单字段（倒序） |

---

## 换电脑 / 协作

需手动创建以下本地文件（不加入版本控制）：

- `wxapp/.env.local` — 云开发环境 ID
- `wxapp/project.private.config.json` — 微信开发者工具私有配置

---

## 开发约定

- 页面级组件放在 `src/pages/`，可复用组件放在 `src/components/`
- 云函数调用统一封装在 `src/api/`
- 全局状态通过 `useAppStore` 管理，持久化 key 为 `app-storage`
- 样式以 inline style 为主，公共视觉（玻璃拟态、动画）放在 `src/styles/`
- 所有需要登录的页面使用 `useRequireAuth()` 守卫
