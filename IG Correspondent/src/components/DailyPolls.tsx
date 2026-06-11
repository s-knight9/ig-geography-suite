import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, BarChart2, Hash, ExternalLink, Tag } from 'lucide-react';
import { Poll, TAG_COLORS } from '../types';

export function DailyPolls({
  activeUserEmail,
  activeTeacherCode,
  onOpenTagModal,
  refreshTrigger
}: {
  activeUserEmail?: string;
  activeTeacherCode?: string;
  onOpenTagModal?: (poll: Poll) => void;
  refreshTrigger?: number;
}) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);

  const fetchPolls = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const emailParam = activeUserEmail ? `?email=${encodeURIComponent(activeUserEmail)}` : '';
      const response = await fetch(`/api/polls/today${emailParam}`);
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    
    // Short polling: fetch every 30 seconds to keep results live
    const interval = setInterval(() => fetchPolls(true), 30000);
    return () => clearInterval(interval);
  }, [activeUserEmail, refreshTrigger]);

  const handleVote = async (pollId: number, option: string) => {
    if (voting !== null) return;
    setVoting(pollId);
    
    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, option, email: activeUserEmail })
      });

      if (response.ok) {
        // Optimistic UI update or just re-fetch
        await fetchPolls(true);
      } else {
        const error = await response.json();
        console.error('Vote failed:', error.error);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-5 h-5 text-orange-600" />
        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Daily Geography Polls</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {polls.map((poll) => (
          <PollCard 
            key={poll.id} 
            poll={poll} 
            onVote={handleVote} 
            isVoting={voting === poll.id}
            activeTeacherCode={activeTeacherCode}
            onOpenTagModal={onOpenTagModal}
          />
        ))}
      </div>
    </div>
  );
}

interface PollCardProps {
  key?: React.Key;
  poll: Poll;
  onVote: (id: number, opt: string) => void | Promise<void>;
  isVoting: boolean;
  activeTeacherCode?: string;
  onOpenTagModal?: (poll: Poll) => void;
}

function PollCard({ poll, onVote, isVoting, activeTeacherCode, onOpenTagModal }: PollCardProps) {
  const options = [
    { key: 'A', label: poll.option_a },
    { key: 'B', label: poll.option_b },
    { key: 'C', label: poll.option_c },
    { key: 'D', label: poll.option_d },
  ].filter(opt => opt.label && opt.label.trim() !== '');

  const totalVotes = poll.results?.total || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3 w-full">
        <div className="flex flex-wrap items-center gap-1.5 max-w-[85%]">
          {poll.tags && poll.tags.length > 0 ? (
            poll.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-[10.5px] font-black tracking-wider border shadow-sm rounded-full cursor-default ${TAG_COLORS[tag] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className={`px-2 py-0.5 text-[10.5px] font-black tracking-wider border shadow-sm rounded-full cursor-default ${TAG_COLORS[poll.dp_tag || ''] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
              {poll.dp_tag || 'GEO'}
            </span>
          )}

          {activeTeacherCode && onOpenTagModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTagModal(poll);
              }}
              className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-[#2563eb] dark:hover:text-[#60a5fa] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider shadow-sm"
              title="Edit Poll Tags"
            >
              <Tag className="w-2.5 h-2.5" />
              Tag
            </button>
          )}
        </div>
        {poll.source_url && (
          <a href={poll.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 mt-0.5">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <h3 className="text-sm font-semibold text-slate-800 mb-6 leading-snug flex-grow">
        {poll.question}
      </h3>

      <div className="space-y-3">
        {options.map((opt) => {
          const voteCount = poll.results ? (poll.results[opt.key as keyof typeof poll.results] as number) : 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = poll.userSelection === opt.key;

          return (
            <div key={opt.key} className="relative">
              {poll.hasVoted ? (
                <div className="group">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium ${isSelected ? 'text-orange-600' : 'text-slate-600'}`}>
                      {opt.label}
                    </span>
                    <span className="text-slate-400 font-mono">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${isSelected ? 'bg-orange-600' : 'bg-slate-300'}`}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onVote(poll.id, opt.key)}
                  disabled={isVoting}
                  className="w-full text-left p-3 text-xs border border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-200 disabled:opacity-50"
                >
                  <span className="font-bold text-orange-600 mr-2">{opt.key}.</span>
                  <span className="text-slate-700">{opt.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {poll.hasVoted && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1 text-blue-600">
            <CheckCircle className="w-3 h-3" />
            VOTE RECORDED
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalVotes.toLocaleString()} PARTICIPANTS</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
