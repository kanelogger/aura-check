import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircle, PaperPlaneRight } from 'phosphor-react';
import { useCheckIn } from '../hooks/useCheckInState';
import Avatar from './Avatar';
import type { Comment } from '../types';

interface CommentSectionProps {
  checkInId: string;
  comments: Comment[];
  compact?: boolean;
}

export default function CommentSection({ checkInId, comments, compact }: CommentSectionProps) {
  const { addComment } = useCheckIn();
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      userId: 'young_dreamer',
      userName: '金梦young dreamer',
      userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80',
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };
    addComment(checkInId, comment);
    setInputValue('');
  };

  const displayComments = compact && !expanded ? comments.slice(0, 1) : comments;

  return (
    <div className="mt-2">
      {/* Toggle comments */}
      {comments.length > 0 && (
        <button
          className="flex items-center gap-1.5 mb-2"
          onClick={() => setExpanded(!expanded)}
        >
          <ChatCircle size={14} color="var(--text-tertiary)" />
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-chinese)' }}>
            {comments.length}条评论{compact && !expanded ? ' · 展开' : ''}
          </span>
        </button>
      )}

      <AnimatePresence>
        {displayComments.map((c) => (
          <motion.div
            key={c.id}
            className="flex items-start gap-2 mb-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Avatar src={c.userAvatar} size={24} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-[11px] font-medium"
                  style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
                >
                  {c.userName}
                </span>
                <span
                  className="text-[11px] leading-relaxed"
                  style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-secondary)' }}
                >
                  {c.content}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Comment input */}
      <div className="flex items-center gap-2 mt-2">
        <Avatar src="https://api.dicebear.com/9.x/avataaars/svg?seed=young_dreamer&size=80" size={24} />
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--divider)' }}
        >
          <input
            type="text"
            className="flex-1 text-[12px] bg-transparent outline-none"
            style={{ fontFamily: 'var(--font-chinese)', color: 'var(--text-primary)' }}
            placeholder="写评论..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
          >
            <PaperPlaneRight
              size={16}
              color={inputValue.trim() ? 'var(--accent-mint-deep)' : 'var(--text-muted)'}
              weight="fill"
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
