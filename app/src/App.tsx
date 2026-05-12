import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckInProvider } from './hooks/useCheckInState';
import LiquidGlassBg from './components/LiquidGlassBg';
import BottomTabBar from './components/BottomTabBar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Stats from './pages/Stats';
import CheckIn from './pages/CheckIn';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import AIChat from './pages/AIChat';


const pageTransition = {
  initial: { scale: 0.96, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    scale: 0.96,
    opacity: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 },
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="flex-1 overflow-y-auto"
        style={{
          overscrollBehaviorY: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/ai-chat" element={<AIChat />} />

        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <CheckInProvider>
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '100dvh',
          background: 'var(--bg-primary)',
        }}
      >
        <LiquidGlassBg />

        <div className="relative z-10 flex flex-col h-full">
          <AnimatedRoutes />
        </div>

        <BottomTabBar />
        <Toast />
      </div>
    </CheckInProvider>
  );
}
