import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppState, CheckIn, EmojiMood, Comment } from '../types';
import { EMOJI_MOODS, INITIAL_CHECKINS } from '../data/demo';

const initialState: AppState = {
  todayStatus: 'pending',
  selectedCategory: 'fitness',
  selectedMood: EMOJI_MOODS[0],
  checkInNote: '',
  checkInType: 'text',
  timerDuration: 25,
  quantityValue: 0,
  quantityUnit: '',
  checkIns: INITIAL_CHECKINS,
  likes: {},
  toast: null,
};

interface CheckInContextType {
  state: AppState;
  setTodayStatus: (status: 'checked' | 'pending') => void;
  setSelectedCategory: (cat: 'fitness' | 'study') => void;
  setSelectedMood: (mood: EmojiMood) => void;
  setCheckInNote: (note: string) => void;
  setCheckInType: (type: AppState['checkInType']) => void;
  setTimerDuration: (min: number) => void;
  setQuantityValue: (val: number) => void;
  setQuantityUnit: (unit: string) => void;
  addCheckIn: (checkIn: CheckIn) => void;
  toggleLike: (checkInId: string) => void;
  addComment: (checkInId: string, comment: Comment) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

const CheckInContext = createContext<CheckInContextType | null>(null);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const setTodayStatus = useCallback((todayStatus: 'checked' | 'pending') => {
    updateState({ todayStatus });
  }, [updateState]);

  const setSelectedCategory = useCallback((selectedCategory: 'fitness' | 'study') => {
    updateState({ selectedCategory });
  }, [updateState]);

  const setSelectedMood = useCallback((selectedMood: EmojiMood) => {
    updateState({ selectedMood });
  }, [updateState]);

  const setCheckInNote = useCallback((checkInNote: string) => {
    updateState({ checkInNote });
  }, [updateState]);

  const setCheckInType = useCallback((checkInType: AppState['checkInType']) => {
    updateState({ checkInType });
  }, [updateState]);

  const setTimerDuration = useCallback((timerDuration: number) => {
    updateState({ timerDuration });
  }, [updateState]);

  const setQuantityValue = useCallback((quantityValue: number) => {
    updateState({ quantityValue });
  }, [updateState]);

  const setQuantityUnit = useCallback((quantityUnit: string) => {
    updateState({ quantityUnit });
  }, [updateState]);

  const addCheckIn = useCallback((checkIn: CheckIn) => {
    setState(prev => ({
      ...prev,
      checkIns: [checkIn, ...prev.checkIns],
      todayStatus: 'checked',
      checkInNote: '',
      quantityValue: 0,
    }));
  }, []);

  const toggleLike = useCallback((checkInId: string) => {
    setState(prev => {
      const isLiked = !prev.likes[checkInId];
      const newLikes = { ...prev.likes, [checkInId]: isLiked };
      const newCheckIns = prev.checkIns.map(ci =>
        ci.id === checkInId
          ? { ...ci, likes: ci.likes + (isLiked ? 1 : -1), isLiked }
          : ci
      );
      return { ...prev, likes: newLikes, checkIns: newCheckIns };
    });
  }, []);

  const addComment = useCallback((checkInId: string, comment: Comment) => {
    setState(prev => ({
      ...prev,
      checkIns: prev.checkIns.map(ci =>
        ci.id === checkInId ? { ...ci, comments: [...ci.comments, comment] } : ci
      ),
    }));
  }, []);

  const showToast = useCallback((message: string) => {
    setState(prev => ({ ...prev, toast: { message, visible: true } }));
    setTimeout(() => {
      setState(prev => ({ ...prev, toast: null }));
    }, 2000);
  }, []);

  const hideToast = useCallback(() => {
    updateState({ toast: null });
  }, [updateState]);

  return (
    <CheckInContext.Provider
      value={{
        state,
        setTodayStatus,
        setSelectedCategory,
        setSelectedMood,
        setCheckInNote,
        setCheckInType,
        setTimerDuration,
        setQuantityValue,
        setQuantityUnit,
        addCheckIn,
        toggleLike,
        addComment,
        showToast,
        hideToast,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error('useCheckIn must be used within CheckInProvider');
  return ctx;
}
