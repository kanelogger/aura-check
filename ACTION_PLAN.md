# Aura Check 小程序上线行动清单

> 基于现有 Web 项目迁移至微信小程序 + 微信云开发
> 目标：完成开发 → 提交审核 → 商用上线

---

## Phase 0：账号与资质（必须先做，1-3 天）

| # | 任务 | 操作路径 | 产出物 | 预计耗时 |
|---|------|----------|--------|----------|
| 0.1 | 注册小程序账号 | [微信公众平台](https://mp.weixin.qq.com/) → 立即注册 → 小程序 | 小程序账号 + 邮箱绑定 | 30 分钟 |
| 0.2 | 企业主体认证 | 微信公众平台 → 设置 → 基本设置 → 主体信息 → 认证 | 企业认证小程序（商用必需） | 1-3 个工作日 |
| 0.3 | 开通微信云开发 | 微信公众平台 → 开发 → 云开发 → 开通 → 免费版 | 云开发环境 ID | 5 分钟 |
| 0.4 | 绑定开发者 | 微信公众平台 → 成员管理 → 添加项目成员 | 开发/体验权限 | 10 分钟 |
| 0.5 | 准备隐私政策页面 | 可用 [腾讯云隐私政策生成工具](https://cloud.tencent.com/product/privacypolicy) 生成 | 隐私政策 URL | 1 小时 |

> **阻塞项**：0.2 企业认证未完成前，无法提交审核和商用收款。

---

## Phase 1：Taro 项目骨架（1 天）

| # | 任务 | 命令/操作 | 验证方式 |
|---|------|-----------|----------|
| 1.1 | 全局安装 Taro CLI | `npm install -g @tarojs/cli` | `taro --version` |
| 1.2 | 初始化项目 | `taro init kimi-agent-wx` → React + TypeScript + Webpack + Sass | 项目目录生成 |
| 1.3 | 安装依赖 | `cd kimi-agent-wx && npm install` | `node_modules` 存在 |
| 1.4 | 安装 weapp-tailwindcss | `npm install -D weapp-tailwindcss` + 配置 `config/index.js` | 能写 `className="bg-red-500"` |
| 1.5 | 安装 Zustand | `npm install zustand` | - |
| 1.6 | 配置云开发环境 | `src/utils/cloud.ts` 写入环境 ID | 编译无报错 |
| 1.7 | 配置 app.config.ts | 写入 5 个页面路由 + tabBar | 微信开发者工具能预览 |
| 1.8 | 首次编译测试 | `npm run dev:weapp` | 微信开发者工具正常显示 |

---

## Phase 2：数据库与云函数（1-2 天）

### 2.1 创建数据库集合

在云开发控制台 → 数据库 → 创建以下 4 个集合：

- `users` — 用户信息
- `checkins` — 打卡记录
- `friends` — 好友关系
- `likes` — 点赞记录

### 2.2 创建索引（性能关键）

| 集合 | 索引字段 | 类型 |
|------|----------|------|
| users | `openid` | 唯一索引 |
| checkins | `userId` + `date` | 复合索引 |
| friends | `userId` + `friendId` | 复合唯一索引 |
| likes | `checkInId` + `userId` | 复合唯一索引 |

### 2.3 部署 7 个云函数

在 `cloud/functions/` 下创建以下云函数，并逐个部署：

| 云函数 | 功能 | 测试方式 |
|--------|------|----------|
| `login` | 自动获取 OpenID，自动注册用户 | 云开发控制台 → 云函数 → 测试 |
| `addCheckIn` | 打卡，防重复，更新连续天数 | 传入 category/mood/note 测试 |
| `getHomeData` | 返回今日状态 + 周打卡条 + 连续天数 | 直接调用，看返回值 |
| `getFeed` | 好友动态列表，分页 | 传入 page/pageSize 测试 |
| `toggleLike` | 点赞/取消点赞，原子更新计数 | 传入 checkInId 测试 |
| `getRanking` | 排行榜 Top 50 | 直接调用 |
| `addFriend` | 添加好友，生成邀请码 | 传入 friendId 测试 |

**部署命令**：在微信开发者工具中，右键云函数目录 → "创建并部署：云端安装依赖"

---

## Phase 3：页面迁移（2-3 天）

按优先级逐个迁移页面，每个页面包含：JSX → Taro 组件替换 → API 接入 → 真机调试

| # | 页面 | 核心组件 | 复杂度 |
|---|------|----------|--------|
| 3.1 | **Home（首页）** | DateGreeting, WeeklyStrip, TodayCheckInCard, FriendFeed | ⭐⭐⭐⭐⭐ |
| 3.2 | **CheckIn（打卡页）** | CategoryPicker, MoodPicker, NoteInput, CheckInButton | ⭐⭐⭐⭐ |
| 3.3 | **Friends（好友）** | FriendFeed, FriendRankingList | ⭐⭐⭐ |
| 3.4 | **Stats（统计）** | CalendarArchive, MonthlyStatsBento | ⭐⭐⭐⭐ |
| 3.5 | **Profile（我的）** | UserInfoCard, SettingsList | ⭐⭐ |

### Web → Taro 组件替换速查

| Web | Taro | 注意点 |
|-----|------|--------|
| `<div>` | `<View>` | 最外层布局 |
| `<span>` / `<p>` | `<Text>` | 文本必须包在 Text 里 |
| `<img>` | `<Image>` | 必须加 `mode="aspectFill"` |
| `<button>` | `<Button>` | 微信默认样式需覆盖 |
| `<input>` | `<Input>` | 受控组件写法有差异 |
| `<scroll>` | `<ScrollView>` | 弹性滚动用 `scroll-y` |

---

## Phase 4：视觉与动画降级（1-2 天）

### 4.1 玻璃拟态适配

小程序支持 `backdrop-filter`，但低端机可能不支持，需加降级：

```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
}

/* 降级 */
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255, 255, 255, 0.85);
  }
}
```

### 4.2 动画降级映射

| 原 Web 动画 | 小程序替代方案 |
|-------------|----------------|
| Framer Motion 页面转场 | Taro 原生页面切换 + CSS 淡入 |
| 卡片 stagger 入场 | CSS `@keyframes` + `animation-delay` |
| Card hover / tap | `:active` + `transform: scale(0.97)` |
| Jelly Spring Modal | 底部弹出 + `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 点赞弹簧效果 | CSS `@keyframes heart-beat` |
| Toast 入场/离场 | CSS `transition: opacity 0.25s` |

---

## Phase 5：联调与上线（1 天 + 审核 1-7 天）

### 5.1 联调测试清单

- [ ] 新用户首次打开，自动注册并登录
- [ ] 完成一次打卡，验证数据库有记录
- [ ] 查看首页，周打卡条显示正确
- [ ] 添加好友，双方都能看到对方动态
- [ ] 点赞/取消点赞，计数正确更新
- [ ] 排行榜显示正常，当前用户排名正确
- [ ] 断网重连，数据能恢复
- [ ] 低端机（Android 千元机）动画不卡顿

### 5.2 提交审核前检查项

- [ ] 隐私政策页面已配置且可访问
- [ ] 用户协议页面已配置
- [ ] 所有用户输入点已接入微信内容安全接口
- [ ] 小程序信息（名称、图标、简介）已完善
- [ ] 体验版已发给 3+ 人测试通过

### 5.3 提审流程

1. 微信开发者工具 → 上传代码 → 填写版本号
2. 微信公众平台 → 版本管理 → 提交审核
3. 填写功能页面 + 测试账号（如有登录）
4. 等待审核（通常 1-3 个工作日）
5. 审核通过后 → 发布上线

---

## 关键决策速查

| 决策 | 当前选择 | 理由 |
|------|----------|------|
| 前端框架 | Taro 3.x (React) | 复用现有 React 代码 |
| 后端方案 | 微信云开发 | 零运维，原生集成 |
| 数据库 | 云数据库 (MongoDB-like) | 文档型，契合 JS 生态 |
| 状态管理 | Zustand | 轻量，支持持久化 |
| 样式方案 | Sass + weapp-tailwindcss | 保留 Tailwind 体验 |
| 用户鉴权 | 微信 OpenID | 云函数自动获取 |

---

## 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 云开发免费额度不够 | 服务中断 | 按量付费很便宜，初期月成本 < 10 元 |
| 低端机动画卡顿 | 体验差 | 减少同时动画元素；提供"关闭动画"设置 |
| 微信审核不通过 | 无法上线 | 避免敏感功能；确保隐私政策完整 |
| 数据被云开发锁定 | 后期迁移难 | 定期导出 JSON 备份 |

---

## 今日可立即启动的任务

如果你现在有时间，建议按这个顺序做：

1. **注册小程序账号**（30 分钟）
2. **开通云开发**，记录环境 ID（5 分钟）
3. **全局安装 Taro CLI**，初始化项目（30 分钟）
4. **安装依赖**：Zustand、weapp-tailwindcss（15 分钟）

做完这 4 步，你就有了可编译运行的小程序骨架，后面可以专注写业务代码。

---

> **预计总工期**：6-9 天开发 + 1-3 天审核 = **最快 1 周上线**
> 
> **阻塞项**：企业认证（1-3 个工作日），建议今天就提交。
