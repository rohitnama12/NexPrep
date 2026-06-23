"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Activity, BrainCircuit, Code2, Trophy, Target, Zap, ArrowRight, Sparkles, Flame, CalendarDays, CheckCircle2, XCircle, Search, Filter, X, Copy, Check, Layers } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/utils/apiClient";

const DSATopicsChart = dynamic(() => import("@/components/DashboardCharts").then(mod => mod.DSATopicsChart), { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" /> });
const MCQPerformanceChart = dynamic(() => import("@/components/DashboardCharts").then(mod => mod.MCQPerformanceChart), { ssr: false, loading: () => <div className="h-[250px] w-full animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full scale-75" /> });
const ConsistencyHeatmap = dynamic(() => import("@/components/DashboardCharts").then(mod => mod.ConsistencyHeatmap), { ssr: false, loading: () => <div className="h-[150px] w-full animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" /> });

export default function DashboardPage() {
  const [overview, setOverview] = useState({
    total_solved: 0,
    problem_accuracy: 0,
    mcq_participation: 0,
    current_streak: 0,
    max_streak: 0
  });
  const [dsaDistribution, setDsaDistribution] = useState<any[]>([]);
  const [dsaDifficulty, setDsaDifficulty] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [mcqDistribution, setMcqDistribution] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [topicSearch, setTopicSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<{code_snippet: string, topic: string, difficulty: string, description?: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, dsaDistRes, dsaDiffRes, mcqDistRes, heatmapRes, subsRes] = await Promise.all([
          fetchApi('/analytics/overview'),
          fetchApi('/analytics/dsa-distribution'),
          fetchApi('/analytics/dsa-difficulty'),
          fetchApi('/analytics/mcq-distribution'),
          fetchApi('/analytics/activity-heatmap'),
          fetchApi('/analytics/recent-submissions')
        ]);
        
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (dsaDistRes.ok) setDsaDistribution(await dsaDistRes.json());
        if (dsaDiffRes.ok) setDsaDifficulty(await dsaDiffRes.json());
        if (mcqDistRes.ok) setMcqDistribution(await mcqDistRes.json());
        if (heatmapRes.ok) setHeatmapData(await heatmapRes.json());
        if (subsRes.ok) setSubmissions(await subsRes.json());
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalDsa = dsaDifficulty.Easy + dsaDifficulty.Medium + dsaDifficulty.Hard;
  const safeTotalDsa = totalDsa === 0 ? 1 : totalDsa; // to prevent divide by zero

  const filteredSubmissions = submissions.filter(sub => {
    if (statusFilter !== "All") {
      const isPassed = statusFilter === "Passed";
      if (sub.passed !== isPassed) return false;
    }
    if (difficultyFilter !== "All" && sub.difficulty !== difficultyFilter) return false;
    if (topicSearch && sub.topic && !sub.topic.toLowerCase().includes(topicSearch.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)] bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center pb-20 px-4 lg:px-8 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-300">
      
      {/* Abstract Radial Mesh Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-4 bg-orange-500/10 shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              <span>Dashboard Telemetry</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Command Center
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl">
              Welcome back. Monitor your algorithmic growth, accuracy metrics, and interview readiness all in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/arena" className="group bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] flex items-center gap-2">
              <Code2 size={18} />
              Enter Arena
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Top Row: Animated Glassmorphism Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl dark:hover:shadow-[0_0_40px_-15px_rgba(139,92,246,0.3)]">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Total Solved</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{overview.total_solved}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Trophy size={20} />
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Coding challenges conquered
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl dark:hover:shadow-[0_0_40px_-15px_rgba(79,70,229,0.3)]">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Overall Accuracy</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{overview.problem_accuracy}<span className="text-xl text-zinc-400">%</span></h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner">
                <Target size={20} />
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Pass rate in Arena
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl dark:hover:shadow-[0_0_40px_-15px_rgba(249,115,22,0.3)]">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Current Streak</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{overview.current_streak} <span className="text-xl text-zinc-400">days</span></h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner">
                <Flame size={20} />
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Keep the fire alive
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl dark:hover:shadow-[0_0_40px_-15px_rgba(6,182,212,0.3)]">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Longest Streak</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{overview.max_streak} <span className="text-xl text-zinc-400">days</span></h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner">
                <CalendarDays size={20} />
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Your personal best
            </div>
          </div>
        </div>

        {/* Row 2: DSA Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Chart: DSA Topics Conquered */}
          <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-3xl p-8 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-amber-500" size={24} />
                  DSA Topics Conquered
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                  Your progress across core algorithmic patterns visualized.
                </p>
              </div>
              <Link href="/tracker" className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-sm font-semibold transition-colors border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                View Tracker
              </Link>
            </div>
            <div className="flex-1 min-h-[300px] w-full relative z-10">
              <DSATopicsChart data={dsaDistribution} />
            </div>
          </div>

          {/* Right Panel: DSA Difficulty Breakdown (LeetCode Style) */}
          <div className="relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-3xl p-8 flex flex-col transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg">
            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Trophy className="text-amber-500" size={24} />
                Solved by Difficulty
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                Challenge distribution breakdown.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Easy</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{dsaDifficulty.Easy}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(dsaDifficulty.Easy / safeTotalDsa) * 100}%` }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-amber-500 dark:text-amber-400">Medium</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{dsaDifficulty.Medium}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${(dsaDifficulty.Medium / safeTotalDsa) * 100}%` }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-red-500 dark:text-red-400">Hard</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{dsaDifficulty.Hard}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${(dsaDifficulty.Hard / safeTotalDsa) * 100}%` }}></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Row 3: Consistency & MCQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: MCQ Mastery */}
          <div className="relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-3xl p-8 flex flex-col transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg">
            <div className="mb-6 relative z-10">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="text-orange-500" size={24} />
                MCQ Mastery
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                Correct answers by difficulty.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center relative z-10 -mt-4">
              <MCQPerformanceChart data={mcqDistribution} />
            </div>
            <div className="mt-2 space-y-3 relative z-10">
              {mcqDistribution.map((item, i) => {
                let color = "bg-amber-500";
                if (item.name === "Medium") color = "bg-amber-500";
                if (item.name === "Hard") color = "bg-red-500";

                return (
                  <div key={i} className="flex justify-between items-center text-sm p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white bg-white dark:bg-black/20 px-2.5 py-1 rounded-md shadow-sm border border-zinc-100 dark:border-transparent">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Heatmap Panel */}
          <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-3xl p-8 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="text-amber-500" size={24} />
                  Consistency Tracker
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                  Your daily contributions across Arena and MCQs.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full relative z-10 flex items-center justify-center overflow-hidden">
              <ConsistencyHeatmap data={heatmapData} />
            </div>
          </div>

        </div>

        {/* Row 4: Submission History Table */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-3xl flex flex-col transition-all duration-300">
          
          <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Code2 className="text-orange-500" size={24} />
                Recent Submissions
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                Review your latest algorithmic attempts.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex items-center gap-2">
                <Search size={14} className="absolute left-3 text-zinc-500 dark:text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search topic..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors w-40"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto relative z-10 w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-white/[0.05]">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Topic</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Difficulty</th>
                  <th className="py-4 px-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.05]">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedSubmission({
                          code_snippet: sub.code_snippet || "No code snippet available.",
                          topic: sub.topic || "General Challenge",
                          difficulty: sub.difficulty || "Easy",
                          description: sub.problem_payload?.description || "No description provided."
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          sub.passed 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' 
                            : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                        }`}>
                          {sub.passed ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                          {sub.passed ? 'Accepted' : 'Failed'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-zinc-900 dark:text-zinc-200">
                        {sub.topic || 'General Challenge'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          sub.difficulty === 'Easy' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' :
                          sub.difficulty === 'Medium' ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10' :
                          'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10'
                        }`}>
                          {sub.difficulty || 'Easy'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400 text-right font-medium">
                        {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                      <Filter size={24} className="mx-auto mb-2 opacity-30" />
                      No submissions found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Code Viewer Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                  <Code2 size={18} className="text-orange-500" />
                  Submission: {selectedSubmission.topic}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedSubmission.difficulty === 'Easy' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' :
                    selectedSubmission.difficulty === 'Medium' ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' :
                    'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                  }`}>
                    {selectedSubmission.difficulty}
                  </span>
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* SECTION 1: Problem Statement */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-y-auto">
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={14} /> Problem Statement
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 prose-pre:bg-white dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedSubmission.description || "No description provided."}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* SECTION 2: Submitted Code */}
                <div className="flex-1 relative p-4 bg-zinc-50 dark:bg-[#0d0d0d] overflow-y-auto group">
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                      Your Code
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code_snippet);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 flex items-center shadow-sm"
                      title="Copy code"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap break-all pt-10">
                    <code>{selectedSubmission.code_snippet}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
