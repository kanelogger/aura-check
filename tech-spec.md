# Technical Specification: Aura Check ✨

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.0 | UI framework |
| react-dom | ^18.3.0 | DOM renderer |
| react-router-dom | ^6.26.0 | HashRouter for SPA routing |
| framer-motion | ^11.5.0 | All animations (springs, page transitions, modals, scroll, stagger) |
| phosphor-react | ^1.4.1 | Icon library (ph-heart, ph-barbell, ph-book-open, etc.) |
| tailwindcss | ^3.4.0 | Utility-first CSS |
| typescript | ^5.5.0 | Type safety |
| vite | ^5.4.0 | Build tool |
| @types/react | ^18.3.0 | React type definitions |
| @types/react-dom | ^18.3.0 | ReactDOM type definitions |

## Component Inventory

### Layout (shared across all pages)

| Component | Source | Reuse |
|-----------|--------|-------|
| AppShell | Custom | Once — root layout with Liquid Glass Background, sticky header, scroll area, bottom tab bar |
| LiquidGlassBg | Custom | Once — CSS+JS dynamic background with noise texture + 3 floating ellipses |
| StickyHeader | Custom | Once — sticky header with page title, adapts per route |
| BottomTabBar | Custom | Once — 5-tab navigation with glassmorphism backdrop |
| ScrollArea | Custom | Once — elastic-recoil scroll wrapper with hidden scrollbar |

### Page Sections (one per page, composed of reusable modules)

| Page | Sections |
|------|----------|
| Home (/) | DateGreeting, WeeklyStrip, TodayCheckInCard, FriendFeed, StreakAndRankPreview |
| Friends (/friends) | FriendFeed, FriendRankingList |
| Stats (/stats) | CalendarArchive, MonthlyStatsBento |
| CheckIn (/checkin) | CategoryPicker, MoodPicker, NoteInput, CheckInButton |
| Profile (/profile) | UserInfoCard, SettingsList |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| GlassCard | Custom | All cards — cream glass background, 20px radius, border, shadow, isometric ::before projection |
| Avatar | Custom | FriendFeed, TodayCheckInCard, FriendRankingList, UserInfoCard — Memoji with circular clip + optional border |
| CheckInSummaryCard | Custom | CheckIn modal — displays category icon, mood emoji, note |
| Toast | Custom | All pages — positioned fixed top, glassmorphism dark bg |
| LikeButton | Custom | FriendFeed — heart icon with spring scale animation + AnimatePresence count flip |

### Hooks

| Hook | Purpose |
|------|---------|
| useElasticScroll | Framer Motion useScroll + useSpring for elastic overscroll at boundaries |
| useCheckInState | Context provider for global check-in state (todayStatus, selectedCategory, selectedMood, checkInNote, checkIns, likes) |

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Liquid Glass Background (floating ellipses) | CSS keyframes | 3 absolute divs with blur(80px) + CSS @keyframes float-glass-a/b/c, 20s infinite alternate | Low |
| Noise texture overlay | SVG feTurbulence | 64x64 SVG pattern embedded as background-image, opacity 0.04 | Low |
| Page transitions (jelly scale) | Framer Motion | AnimatePresence wrapping routes, variants with spring(stiffness:300, damping:25), scale 0.96→1 | Medium |
| Staggered content entrance | Framer Motion | Parent `staggerChildren: 0.08`, children `y:16→0, opacity:0→1` | Low |
| Weekly strip horizontal scroll | CSS | overflow-x:auto, scroll-snap-type:x mandatory, -webkit-overflow-scrolling:touch | Low |
| Memories Archive (calendar layers) | Framer Motion AnimatePresence | Layer switch: exit y:-15/scale:0.97/opacity:0, enter y:25/scale:0.95→1, spring(250,22). Stagger by column 0.08s | High |
| Isometric Bento Grid entrance | Framer Motion | Sequential stagger 0.06s, scale:0.9→1, y:15→0, spring(220,22). ::before pseudo-element for projection | Medium |
| Card hover/tap feedback | Framer Motion | whileHover={{scale:1.02}} whileTap={{scale:0.97}}, spring(200,20) | Low |
| Jelly Spring Modal | Framer Motion | Bottom sheet: spring(stiffness:150, damping:12, mass:0.8) for enter, spring(300,25) for exit. Overshoot unclamped. | High |
| Elastic-Recoil Scroll | Framer Motion useScroll + useSpring | Spring(scrollY, stiffness:180, damping:22). Apply resistance at overscroll boundaries via transform | High |
| Like button spring | Framer Motion | scale:1→1.3→1, spring(300,15). Color transition regular→fill | Low |
| Toast entrance/exit | Framer Motion | Enter: y:-20→0, scale:0.95→1, spring(300,25). Exit: y:-10, opacity:0, 0.25s | Low |
| Tab indicator dot | Framer Motion | scale:0→1, spring(300,25) | Low |
| Confetti icon in modal | Framer Motion | scale:0→1.2→1, delay:0.1, spring(400,12) | Low |
| TodayCheckInCard state switch | Framer Motion AnimatePresence | Old: exit y:-8/scale:0.97/opacity:0, New: enter y:8/scale:0.97→1, spring(250,22) | Medium |

## State & Logic

### Global State (React Context)

All state managed via `useState` + `useContext` — no backend, no API calls.

```typescript
interface AppState {
  todayStatus: 'checked' | 'pending';
  selectedCategory: 'fitness' | 'study';
  selectedMood: EmojiMood;
  checkInNote: string;
  checkIns: CheckIn[];
  likes: Record<string, boolean>;
  showCheckInModal: boolean;
  showMoodSheet: boolean;
  toast: { message: string; visible: boolean } | null;
}
```

### Key Interactions

1. **CheckIn flow**: CategoryPicker selects category → MoodPicker selects emoji → NoteInput optional text → CheckInButton triggers → showCheckInModal (jelly spring) → "太棒了" closes modal → navigate to `/` with updated todayStatus and new checkIn appended
2. **Like toggle**: Click heart → flip `likes[checkInId]` → trigger spring scale animation → update `checkIns` likes count locally
3. **Settings actions**: Each settings row click → show Toast for 2s → no persistent state change
4. **Tab navigation**: Click tab → AnimatePresence page transition (jelly scale) → route changes

### Routing

HashRouter with 5 routes. `/checkin` accessible from both "打卡" tab and Home CTA button. All other pages map 1:1 to tabs.

## Other Key Decisions

1. **Memoji avatars**: Loaded from `https://api.dicebear.com/9.x/avataaars/svg?seed={seed}&size=80` as `<img>` tags. No local asset files needed.
2. **No shadcn/ui components**: All UI is custom-styled with Tailwind to match the Macaron aesthetic. Standard shadcn components would require heavy override.
3. **Font loading**: Space Grotesk and Inter loaded via Google Fonts `<link>`. LXGW WenKai as Chinese display font fallback. System fonts (-apple-system, PingFang SC) as final fallback.
4. **CSS Custom Properties**: All design tokens defined as CSS variables in `:root` for consistent theming.
5. **Safe area handling**: iOS safe area insets handled via `env(safe-area-inset-top/bottom)` in CSS. `100dvh` for viewport height.
6. ** prefers-reduced-motion**: Wrap all spring animations in a media query check — when `prefers-reduced-motion: reduce` is active, replace springs with simple opacity transitions.
