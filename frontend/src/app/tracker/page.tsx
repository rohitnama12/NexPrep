"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchTrackerProblems, fetchUserProgress, toggleProblemProgress, fetchTrackerMetadata, TrackerProblem } from '@/services/trackerApi';
import { toast } from 'sonner';
import { Check, ExternalLink, Loader2, ListTodo, Search, Database, Code, BookOpen, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const getDifficultyColor = (diff: string) => {
  if (diff === 'Easy') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/20';
  if (diff === 'Medium') return 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 border-amber-500/20';
  return 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/10 border-red-500/20';
};

const TrackerRow = React.memo(({
  problem,
  isCompleted,
  isToggling,
  onToggle
}: {
  problem: TrackerProblem,
  isCompleted: boolean,
  isToggling: boolean,
  onToggle: (id: string, currentStatus: boolean) => void
}) => {
  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-amber-500/[0.02] transition-colors group cursor-default">
      {/* Checkbox */}
      <td className="py-4 px-6">
        <button
          onClick={() => onToggle(problem.id!, isCompleted)}
          disabled={isToggling}
          className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-200 ${isCompleted
              ? 'bg-orange-600 border-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.4)]'
              : 'bg-white dark:bg-black/50 border-zinc-300 dark:border-white/20 text-transparent hover:border-orange-600/50'
            }`}
        >
          <Check size={14} strokeWidth={3} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
        </button>
      </td>

      {/* Title */}
      <td className="py-4 px-6">
        <span className={`font-medium text-sm transition-colors ${isCompleted ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 dark:group-hover:text-amber-400'}`}>
          {problem.title}
        </span>
      </td>

      {/* Topic */}
      <td className="py-4 px-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {problem.topic}
        </span>
      </td>

      {/* Difficulty */}
      <td className="py-4 px-6">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </td>

      {/* Actions / Links */}
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
          {problem.leetcode_url && (
            <a
              href={problem.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Solve on LeetCode"
            >
              <ExternalLink size={14} /> LeetCode
            </a>
          )}
          {problem.gfg_url && (
            <a
              href={problem.gfg_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Solve on GFG"
            >
              <ExternalLink size={14} /> GFG
            </a>
          )}
          {problem.article_url && (
            <a
              href={problem.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 dark:text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Read Article"
            >
              <BookOpen size={14} /> Article
            </a>
          )}
          {problem.video_url && (
            <a
              href={problem.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 dark:text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Watch Video Solution"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg> Video
            </a>
          )}
        </div>
      </td>
    </tr>
  );
});
TrackerRow.displayName = 'TrackerRow';

export default function TrackerPage() {
  const { user, isInitialized } = useAuthStore();
  const [problems, setProblems] = useState<TrackerProblem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(50);

  const [topics, setTopics] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [playlistCounts, setPlaylistCounts] = useState<Record<string, number>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedProblems, fetchedProgress] = await Promise.all([
        fetchTrackerProblems(
          selectedPlaylist,
          selectedTopic,
          selectedDifficulty
        ),
        user ? fetchUserProgress() : Promise.resolve({})
      ]);
      setProblems(fetchedProblems);
      setProgressMap(fetchedProgress || {});
    } catch (e) {
      console.error(e);
      toast.error('Failed to load tracker data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadData();
    }
  }, [isInitialized, user, selectedPlaylist, selectedTopic, selectedDifficulty]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (isInitialized && user) {
        try {
          const meta = await fetchTrackerMetadata();
          setTopics([...meta.topics].sort());
          setDifficulties([...meta.difficulties].sort());
          setPlaylistCounts(meta.playlist_counts || {});
        } catch (e) {
          console.error('[Tracker] Failed to load metadata:', e);
        }
      } else {
        setTopics([]);
        setDifficulties([]);
        setPlaylistCounts({});
      }
    };
    loadMetadata();
  }, [isInitialized, user]);

  const handleToggle = useCallback(async (id: string, currentStatus: boolean) => {
    if (!user) {
      toast.error('Please log in to save your progress');
      return;
    }

    const newStatus = !currentStatus;

    // Optimistic Update
    setProgressMap(prev => ({ ...prev, [id]: newStatus }));
    setTogglingId(id);

    try {
      await toggleProblemProgress(id, newStatus);
    } catch (e) {
      console.error(e);
      // Revert on failure
      setProgressMap(prev => ({ ...prev, [id]: currentStatus }));
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setTogglingId(null);
    }
  }, [user]);

  // Extract unique topics for the dropdown
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    problems.forEach(p => topics.add(p.topic));
    return Array.from(topics).sort();
  }, [problems]);

  // Client-side search filtering (since the API handles dropdowns, we just filter text here)
  const filteredProblems = useMemo(() => {
    let result = problems;
    if (selectedStatus === "completed") {
      result = result.filter(p => !!progressMap[p.id!]);
    } else if (selectedStatus === "uncompleted") {
      result = result.filter(p => !progressMap[p.id!]);
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.topic.toLowerCase().includes(lowerQ)
      );
    }
    return result;
  }, [problems, searchQuery, selectedStatus, progressMap]);

  useEffect(() => {
    setDisplayLimit(50);
  }, [searchQuery, selectedPlaylist, selectedTopic, selectedDifficulty, selectedStatus]);

  const visibleProblems = useMemo(() => {
    return filteredProblems.slice(0, displayLimit);
  }, [filteredProblems, displayLimit]);

  const solvedCount = problems.filter(p => progressMap[p.id]).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);



  return (
    <div className="flex-1 flex flex-col pb-6 w-full max-w-[1600px] mx-auto px-6 overflow-hidden gap-6 bg-[#FAFAFA] dark:bg-[#000000]">

      {/* ─── Header & Stats ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#000000] rounded-3xl p-8 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0 shadow-sm dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <ListTodo size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black text-zinc-900 dark:text-white tracking-tighter">Command Center</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base mt-2 font-light">Track your progress across curated technical interview sheets.</p>
          </div>
        </div>

        {/* Massive Progress Ring */}
        <div className="flex items-center gap-6 relative z-10 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 pr-8">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-200 dark:text-zinc-800" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-orange-600 transition-all duration-1000 ease-out" strokeDasharray="251.2" strokeDashoffset={loading ? 251.2 : 251.2 - (251.2 * progressPercentage) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {loading ? (
                <Loader2 size={24} className="animate-spin text-orange-600" />
              ) : (
                <span className="text-xl font-display font-black text-zinc-900 dark:text-white">{progressPercentage}%</span>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">Completion</span>
            <div className="text-2xl font-display font-black text-zinc-900 dark:text-white">
              {loading ? "-" : solvedCount} <span className="text-base text-zinc-400 font-medium">/ {totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters & Table Container ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#000000] flex-1 rounded-3xl border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden shadow-sm dark:shadow-none relative">

        {/* Filters Toolbar */}
        <div className="p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 flex flex-wrap gap-4 items-center justify-between">

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-orange-600 transition-colors"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 focus-within:border-orange-600 transition-colors">
              <Layers size={14} className="text-zinc-600 dark:text-zinc-500" />
              <select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 outline-none appearance-none min-w-[140px] cursor-pointer"
              >
                <option value="all">All Sheets ({playlistCounts.all ?? '...'})</option>
                <option value="blind_75">Blind 75 ({playlistCounts.blind_75 ?? '...'})</option>
                <option value="striver_a2z">Striver&apos;s A2Z ({playlistCounts.striver_a2z ?? '...'})</option>
                <option value="top_150">Top Interview 150 ({playlistCounts.top_150 ?? '...'})</option>
                <option value="all_leetcode">All LeetCode ({playlistCounts.all_leetcode ?? '...'})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 focus-within:border-orange-600 transition-colors">
              <Database size={14} className="text-zinc-600 dark:text-zinc-500" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 outline-none appearance-none min-w-[120px] cursor-pointer"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 focus-within:border-orange-600 transition-colors">
              <Code size={14} className="text-zinc-600 dark:text-zinc-500" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 outline-none appearance-none min-w-[100px] cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 focus-within:border-orange-600 transition-colors">
              <Check size={14} className="text-zinc-600 dark:text-zinc-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 outline-none appearance-none min-w-[100px] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="uncompleted">Incomplete</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Table ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500 gap-3">
              <Loader2 className="animate-spin text-orange-600" size={32} />
              <p>Syncing your tracker...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500 gap-3">
              <BookOpen size={48} className="opacity-20" />
              <p>No problems found matching your filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-white/70 dark:bg-[#000000]/70 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider w-20">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Problem Title</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Topic</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Difficulty</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-right">Practice Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleProblems.map((problem) => {
                  const isCompleted = !!progressMap[problem.id!];
                  return (
                    <TrackerRow
                      key={problem.id}
                      problem={problem}
                      isCompleted={isCompleted}
                      isToggling={togglingId === problem.id}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Load More Button */}
          {!loading && visibleProblems.length < filteredProblems.length && (
            <div className="p-6 flex justify-center">
              <button
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-colors"
              >
                Load More Problems
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
