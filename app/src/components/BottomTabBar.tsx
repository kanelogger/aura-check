import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  UsersThree,
  Compass,
  ChartBar,
  User,
} from 'phosphor-react';

const TABS = [
  { path: '/', label: '首页', Icon: House },
  { path: '/friends', label: '好友', Icon: UsersThree },
  { path: '/discover', label: '发现', Icon: Compass },
  { path: '/stats', label: '统计', Icon: ChartBar },
  { path: '/profile', label: '我的', Icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -2px 16px rgba(26, 60, 52, 0.04)',
      }}
    >
      {TABS.map(({ path, label, Icon }) => {
        const isActive = currentPath === path;
        return (
          <button
            key={path}
            className="flex flex-col items-center justify-center gap-0.5 relative select-none"
            style={{
              width: 56,
              height: 48,
              color: isActive ? 'var(--accent-mint-deep)' : 'var(--text-tertiary)',
            }}
            onClick={() => {
              if (currentPath !== path) {
                navigate(path);
              }
            }}
          >
            <Icon
              size={isActive ? 24 : 22}
              weight={isActive ? 'fill' : 'regular'}
            />
            <span
              className="text-[10px] font-medium leading-none"
              style={{
                fontFamily: 'var(--font-chinese)',
              }}
            >
              {label}
            </span>
            {isActive && (
              <motion.div
                className="absolute -bottom-0.5 rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: 'var(--accent-mint-deep)',
                }}
                layoutId="tabIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
