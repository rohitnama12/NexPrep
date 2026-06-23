"use client";

import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTheme } from "next-themes";
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Lightbulb, RefreshCw, Loader2, CheckCircle, XCircle,
  FileText, BookOpen, History, Clock, ChevronDown, ChevronRight,
  Zap, Database, Terminal, ArrowRight, ArrowLeft, Sparkles, RotateCcw,
  Code2, Layers, Target, Command, X
} from 'lucide-react';
import {
  SiPython, SiCplusplus, SiJavascript, SiGo, SiRust, SiRuby, SiSwift, SiPhp, SiKotlin
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa6';
import { TbBrandCSharp } from 'react-icons/tb';

import { useArenaStore } from '@/store/arenaStore';
import { fetchApi } from '@/utils/apiClient';

type ActiveLeftTab = 'description' | 'solution';
type ActiveRightTab = 'console' | 'submissions';

interface Complexity {
  time_complexity: string;
  space_complexity: string;
}

interface SubmissionRecord {
  id: string;
  topic: string;
  category: string;
  difficulty: string;
  passed: boolean;
  code_snippet: string;
  created_at: string;
}

type SetupStep = 'language' | 'topic' | 'difficulty';
const STEPS: SetupStep[] = ['language', 'topic', 'difficulty'];

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: <SiPython size={24} /> },
  { value: 'javascript', label: 'JavaScript', icon: <SiJavascript size={24} /> },
  { value: 'cpp', label: 'C++', icon: <SiCplusplus size={24} /> },
  { value: 'java', label: 'Java', icon: <FaJava size={24} /> },
  { value: 'go', label: 'Go', icon: <SiGo size={24} /> },
  { value: 'rust', label: 'Rust', icon: <SiRust size={24} /> },
  { value: 'csharp', label: 'C#', icon: <TbBrandCSharp size={24} /> },
  { value: 'ruby', label: 'Ruby', icon: <SiRuby size={24} /> },
  { value: 'swift', label: 'Swift', icon: <SiSwift size={24} /> },
  { value: 'php', label: 'PHP', icon: <SiPhp size={24} /> },
  { value: 'kotlin', label: 'Kotlin', icon: <SiKotlin size={24} /> },
];

const DIFFICULTIES = [
  { value: 'Easy', color: 'emerald' },
  { value: 'Medium', color: 'amber' },
  { value: 'Hard', color: 'red' },
];

const modalMotion = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
};

function SkeletonLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 h-full">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">Generating your challenge...</h2>
        <p className="text-zinc-600 dark:text-zinc-500 text-sm">Our AI is crafting a unique problem for you</p>
      </div>
      <div className="w-full max-w-md space-y-3 mt-4">
        {["w-[90%]", "w-[75%]", "w-[85%]", "w-[70%]"].map((width, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className={`h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse ${width}`} style={{ animationDelay: `${i * 150}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArenaPageContent() {
  const { theme } = useTheme();
  const {
    currentProblem, userCode, executionResults, hintMessage,
    preferences,
    setProblem, setUserCode, setExecutionResults, setHintMessage, setPreferences
  } = useArenaStore();

  const { language, category, topic, difficulty, playlist } = preferences;

  const searchParams = useSearchParams();
  const replayId = searchParams.get('replay_id');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<ActiveLeftTab>('description');
  const [activeRightTab, setActiveRightTab] = useState<ActiveRightTab>('console');
  const [viewMode, setViewMode] = useState<'filters' | 'coding'>(replayId ? 'coding' : 'filters');
  const [isLoadingReplay, setIsLoadingReplay] = useState(!!replayId);

  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Command Palette State
  const [currentStep, setCurrentStep] = useState<SetupStep>('language');
  const [topicInput, setTopicInput] = useState(topic);

  // Load replay data if replay_id is present
  useEffect(() => {
    if (replayId) {
      const loadReplay = async () => {
        try {
          const rawEndpoint = `/arena/problem/${replayId}`;
          const cleanEndpoint = rawEndpoint.replace(/\/{2,}/g, '/');
          console.log(`[Replay Debug] Computed URL: ${cleanEndpoint}`);
          const res = await fetchApi(cleanEndpoint);
          if (!res.ok) throw new Error("Failed to load replay network response");
          const data = await res.json();
          if (data.status === 'success' && data.data.problem) {
            setProblem(data.data.problem);
            setUserCode(data.data.code_snippet || data.data.problem.boilerplate_code);
            setViewMode('coding');
            // Update preferences silently to match replay
            setPreferences({
              topic: data.data.problem.topic,
              difficulty: data.data.problem.difficulty
            });
          }
        } catch (e) {
          console.error("Replay load error:", e);
          toast.error("Failed to load historical problem");
          setViewMode('filters');
        } finally {
          setIsLoadingReplay(false);
        }
      };
      loadReplay();
    }
  }, [replayId, setProblem, setUserCode, setPreferences]);

  // Switch modes automatically
  useEffect(() => {
    if (isLoadingReplay) return;
    if (currentProblem && !isGenerating) {
      setViewMode('coding');
    } else if (!currentProblem && !isGenerating && !replayId) {
      setViewMode('filters');
      setCurrentStep('language');
    }
  }, [currentProblem, isGenerating, isLoadingReplay, replayId]);

  // Fetch submissions when tab switches
  const fetchSubmissions = useCallback(async () => {
    // If replayId is present, we should ideally fetch submissions by replay context
    // But since we want all submissions for the topic/difficulty of this problem:
    const fetchId = replayId || "none";
    const endpoint = replayId
      ? `/arena/submissions/${replayId}`
      : `/history/challenge/history/${encodeURIComponent(topic)}`;

    if (!topic && !replayId) return;
    setIsLoadingSubmissions(true);
    try {
      const res = await fetchApi(endpoint);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch (e) {
      console.error('Submissions fetch error:', e);
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [topic]);

  useEffect(() => {
    if (activeRightTab === 'submissions' && currentProblem && viewMode === 'coding') {
      fetchSubmissions();
    }
  }, [activeRightTab, currentProblem, fetchSubmissions, viewMode, replayId]);

  const generateProblem = async () => {
    setIsGenerating(true);
    setViewMode('coding');
    setActiveLeftTab('description');
    setActiveRightTab('console');
    setComplexity(null);
    try {
      const cat = "DSA"; // Default to DSA or based on topic logic if needed
      setPreferences({ category: cat });
      const res = await fetchApi('/arena/generate', {
        method: 'POST',
        body: JSON.stringify({ category: cat, difficulty, topic: preferences.topic || topicInput, language, playlist })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Generate] HTTP Error ${res.status}:`, errorText);
        throw new Error('Failed to generate problem');
      }
      const data = await res.json();
      setProblem(data);
    } catch (e) {
      console.error('Generation failed:', e);
      toast.error('Failed to generate problem. You might be rate-limited.');
      setViewMode('filters');
    } finally {
      setIsGenerating(false);
    }
  };

  const executeCode = async () => {
    if (!currentProblem) return;
    setIsExecuting(true);
    setExecutionResults(null);
    setComplexity(null);
    setActiveRightTab('console');
    try {
      const res = await fetchApi('/arena/execute', {
        method: 'POST',
        body: JSON.stringify({ code: userCode, language, test_cases: currentProblem.hidden_test_cases })
      });
      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();
      setExecutionResults(data);

      try {
        await fetchApi('/history/challenge', {
          method: 'POST',
          body: JSON.stringify({
            category,
            topic,
            difficulty,
            code_snippet: userCode,
            passed: data.success,
            problem_payload: currentProblem
          })
        });
      } catch (e) {
        console.error("Failed to save challenge history", e);
      }

      if (data.success && currentProblem) {
        setIsAnalyzing(true);
        try {
          const complexityRes = await fetchApi('/arena/analyze-complexity', {
            method: 'POST',
            body: JSON.stringify({ code_snippet: userCode, problem_description: currentProblem.description })
          });
          if (complexityRes.ok) {
            const complexityData = await complexityRes.json();
            setComplexity(complexityData);
          }
        } catch (e) {
          console.error("Complexity analysis failed:", e);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Execution encountered an error.');
    } finally {
      setIsExecuting(false);
    }
  };

  const getHint = async () => {
    if (!currentProblem) return;
    setIsHinting(true);
    setActiveLeftTab('description');
    try {
      const res = await fetchApi('/arena/hint', {
        method: 'POST',
        body: JSON.stringify({ code: userCode, problem_description: currentProblem.description })
      });
      if (!res.ok) throw new Error('Hint failed');
      const data = await res.json();
      setHintMessage(data.hint);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHinting(false);
    }
  };

  const handleNextQuestion = () => {
    // If we have a replayId in URL, we might want to clear it if possible, 
    // but a soft reset of the UI state works too since generateProblem overrides.
    setProblem(null);
    setExecutionResults(null);
    setHintMessage(null);
    setActiveLeftTab('description');
    setComplexity(null);
    setSubmissions([]);
    generateProblem();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Modal Command Palette ---
  const renderCommandPaletteModal = () => (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        {...modalMotion}
        className="w-full max-w-2xl bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50/50 dark:bg-[#050505]">
          <div className="flex items-center gap-2 text-amber-400">
            <Command size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Command Palette</h2>
          </div>
          {currentProblem && (
            <button onClick={() => setViewMode('coding')} className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 'language' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Choose Language</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-1">Select the language to code in</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => { setPreferences({ language: lang.value }); setCurrentStep('topic'); }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 ${language === lang.value
                      ? 'bg-amber-50/50 border-amber-500/30 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shadow-sm shadow-amber-500/20'
                      : 'bg-white dark:bg-[#111] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-orange-400/50 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md hover:shadow-orange-500/10'
                      }`}
                  >
                    {lang.icon}
                    <span className="text-xs font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'topic' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Select Topic</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-1">What do you want to practice?</p>
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <Command size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && topicInput.trim()) {
                        setPreferences({ topic: topicInput.trim() });
                        setCurrentStep('difficulty');
                      }
                    }}
                    placeholder="e.g., Arrays, Dynamic Programming..."
                    className="w-full bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 outline-none focus:border-amber-500 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Arrays', 'Binary Trees', 'Dynamic Programming', 'Graphs', 'Strings', 'Linked Lists'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setTopicInput(s); setPreferences({ topic: s }); setCurrentStep('difficulty'); }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-200/40 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'difficulty' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Choose Difficulty</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-1">Select how challenging it should be</p>
              </div>
              <div className="flex gap-4 max-w-md mx-auto">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setPreferences({ difficulty: d.value });
                      generateProblem();
                    }}
                    className={`flex-1 py-5 rounded-xl border text-sm font-semibold transition-all duration-200 hover:-translate-y-1 ${d.color === 'emerald'
                      ? 'bg-emerald-50/50 border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:border-emerald-500/40'
                      : d.color === 'amber'
                        ? 'bg-amber-50/50 border-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 hover:border-amber-500/40'
                        : 'bg-red-50/50 border-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:border-red-500/40'
                      }`}
                  >
                    {d.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-[#050505] flex justify-between">
          <button
            onClick={() => {
              if (currentStep === 'topic') setCurrentStep('language');
              if (currentStep === 'difficulty') setCurrentStep('topic');
            }}
            disabled={currentStep === 'language'}
            className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 disabled:opacity-30 flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex gap-2">
            {STEPS.map((step, idx) => (
              <div key={step} className={`w-2 h-2 rounded-full ${STEPS.indexOf(currentStep) >= idx ? 'bg-amber-500' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-96px)] overflow-hidden bg-white dark:bg-[#050505] text-zinc-800 dark:text-zinc-200">
      <AnimatePresence>
        {viewMode === 'filters' && !isLoadingReplay && renderCommandPaletteModal()}
      </AnimatePresence>

      {/* Main Split Layout */}
      <div className="flex-1 flex min-h-0 w-full border-t border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-white/10">
        <PanelGroup orientation="horizontal">
          {/* ─── Left Pane: Problem Panel ─── */}
          <Panel defaultSize={40} minSize={20} className="flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#0a0a0a] overflow-hidden">

            {isGenerating || isLoadingReplay ? (
              <SkeletonLoader />
            ) : currentProblem ? (
              <>
                {/* Header */}
                <div className="px-5 pt-5 pb-0 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0a0a0a]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h2 className="text-xl font-bold text-amber-400 truncate">{currentProblem.title}</h2>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">{difficulty}</span>
                        <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">{topic}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 mt-1">
                      <button
                        onClick={() => { setCurrentStep('language'); setViewMode('filters'); }}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-amber-400 p-2 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800"
                      >
                        <Command size={14} /> Filter
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-amber-400 p-2 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800"
                      >
                        <RotateCcw size={14} /> Next
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 -mb-px">
                    {[
                      { id: 'description', label: 'Description', icon: <FileText size={14} /> },
                      { id: 'solution', label: 'Solution', icon: <BookOpen size={14} /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveLeftTab(tab.id as ActiveLeftTab)}
                        className={`flex items-center gap-2 px-2 py-3 text-sm font-semibold border-b-2 transition-all ${activeLeftTab === tab.id
                          ? 'border-amber-400 text-amber-400'
                          : 'border-transparent text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
                          }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] dark:bg-[#050505]">
                  {activeLeftTab === 'description' && (
                    <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-code:text-zinc-800 dark:prose-code:text-zinc-300 prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentProblem.description}
                      </ReactMarkdown>

                      {currentProblem.constraints?.length > 0 && (
                        <div className="mt-8 not-prose bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                          <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} /> Constraints
                          </h3>
                          <ul className="space-y-2">
                            {currentProblem.constraints.map((c, i) => (
                              <li key={i} className="text-zinc-700 dark:text-zinc-300 text-sm flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                <code className="bg-zinc-100 text-zinc-800 dark:bg-white/[0.05] dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">{c}</code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentProblem.examples?.length > 0 && (
                        <div className="mt-8 not-prose">
                          <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={14} /> Examples
                          </h3>
                          <div className="space-y-4">
                            {currentProblem.examples.map((ex, i) => (
                              <div key={i} className="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                                <div className="text-zinc-700 dark:text-zinc-300 text-sm mb-2 flex flex-col items-start gap-1">
                                  <span className="font-semibold text-zinc-600 dark:text-zinc-500 text-xs uppercase tracking-wider">Input</span>
                                  <pre className="w-full bg-white dark:bg-zinc-950 p-3 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap font-mono break-all">{ex.input}</pre>
                                </div>
                                <div className="text-zinc-700 dark:text-zinc-300 text-sm mb-2 flex flex-col items-start gap-1">
                                  <span className="font-semibold text-zinc-600 dark:text-zinc-500 text-xs uppercase tracking-wider">Output</span>
                                  <pre className="w-full bg-white dark:bg-zinc-950 p-3 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap font-mono break-all">{ex.output}</pre>
                                </div>
                                {ex.explanation && (
                                  <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-3 bg-zinc-50/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Explanation</span>
                                    {ex.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hintMessage && (
                        <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 not-prose">
                          <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Lightbulb size={16} /> AI Hint
                          </h3>
                          <div className="prose dark:prose-invert prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
                            <ReactMarkdown>{hintMessage}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'solution' && (
                    <div>
                      {currentProblem.solution_article ? (
                        <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-code:text-zinc-800 dark:prose-code:text-zinc-300 prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentProblem.solution_article}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center opacity-70">
                          <BookOpen size={36} className="text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">No official solution available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500 gap-4">
                <Command size={48} className="opacity-20" />
                <p className="text-sm">Select preferences to generate a problem</p>
              </div>
            )}

          </Panel>

          <PanelResizeHandle className="w-[2px] bg-zinc-300 dark:bg-white/10 hover:bg-amber-400 dark:hover:bg-amber-500 transition-colors cursor-col-resize z-10" />

          {/* ─── Right Pane: Editor & Console ─── */}
          <Panel defaultSize={60} minSize={30} className="flex flex-col min-w-0 bg-zinc-200 dark:bg-white/10 gap-[1px]">
            <PanelGroup orientation="vertical">
              {/* Editor (Top Half) */}
              <Panel defaultSize={60} minSize={20} className="relative flex flex-col bg-[#FAFAFA] dark:bg-[#0a0a0a] overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center bg-zinc-50 dark:bg-[#0a0a0a]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Code2 size={16} />
                      <span className="text-sm font-semibold">Editor</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-2" />
                    <select
                      value={language}
                      onChange={(e) => setPreferences({ language: e.target.value })}
                      className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-amber-500 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={getHint}
                      disabled={!currentProblem || isHinting}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors disabled:opacity-50 border border-zinc-200 dark:border-white/5"
                    >
                      {isHinting ? <Loader2 className="animate-spin" size={14} /> : <Lightbulb size={14} />}
                      Hint
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative bg-[#FAFAFA] dark:bg-[#050505]">
                  <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={userCode}
                    onChange={(val) => setUserCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      padding: { top: 20 },
                      scrollBeyondLastLine: false,
                      lineHeight: 1.6,
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                    }}
                  />
                  {/* Floating Run Widget */}
                  <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                    <button
                      onClick={executeCode}
                      disabled={!currentProblem || isExecuting}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-full transition-all hover:scale-105 disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:hover:scale-100"
                    >
                      {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                      Run & Submit
                    </button>
                  </div>
                </div>

              </Panel>

              <PanelResizeHandle className="h-[2px] bg-zinc-300 dark:bg-white/10 hover:bg-amber-400 dark:hover:bg-amber-500 transition-colors cursor-row-resize z-10" />

              {/* Console / Submissions (Bottom Half) */}
              <Panel defaultSize={40} minSize={20} className="flex flex-col bg-[#FAFAFA] dark:bg-[#0a0a0a] overflow-hidden">
                <div className="px-4 py-0 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center bg-zinc-50 dark:bg-[#0a0a0a]">
                  <div className="flex gap-4">
                    {[
                      { id: 'console', label: 'Console', icon: <Terminal size={14} /> },
                      { id: 'submissions', label: 'Submissions', icon: <History size={14} /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveRightTab(tab.id as ActiveRightTab)}
                        className={`flex items-center gap-2 px-2 py-3 text-sm font-semibold border-b-2 transition-all ${activeRightTab === tab.id
                          ? 'border-amber-400 text-amber-400'
                          : 'border-transparent text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
                          }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Complexity Badges */}
                  {activeRightTab === 'console' && (
                    <div className="flex items-center">
                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500">
                          <Loader2 className="animate-spin" size={12} /> Analyzing...
                        </div>
                      )}
                      {complexity && !isAnalyzing && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                            <Zap size={12} className="text-amber-400" /> {complexity.time_complexity}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                            <Database size={12} className="text-blue-400" /> {complexity.space_complexity}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-zinc-50/30 dark:bg-zinc-950/30">
                  {activeRightTab === 'console' && (
                    <div className="h-full">
                      {!executionResults && !isExecuting && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                          <Terminal size={32} className="opacity-20" />
                          <p className="text-sm">Run your code to see results here.</p>
                        </div>
                      )}

                      {isExecuting && (
                        <div className="h-full flex flex-col items-center justify-center text-amber-500 gap-3">
                          <Loader2 className="animate-spin" size={28} />
                          <p className="text-sm font-medium">Executing against hidden test cases...</p>
                        </div>
                      )}

                      {executionResults && (
                        <div className="space-y-4">
                          {/* Pass/Fail Widget */}
                          <div className={`p-4 rounded-xl border ${executionResults.success ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-400' : 'bg-red-100 text-red-900 border-red-300 dark:bg-red-900/30 dark:border-red-500/30 dark:text-red-400'} flex items-center gap-4`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${executionResults.success ? 'bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-200 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                              {executionResults.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                              <h3 className={`font-bold text-lg ${executionResults.success ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                                {executionResults.success ? 'Accepted' : 'Wrong Answer'}
                              </h3>
                              {executionResults.fallback_used && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">Evaluated using AI Fallback.</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {executionResults.results.map((res, idx) => (
                              <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${res.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    Test Case {idx + 1}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm font-mono">
                                  <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                                    <span className="text-zinc-600 block text-[10px] uppercase mb-1">Input</span>
                                    <span className="text-zinc-700 dark:text-zinc-300 break-all">{res.input}</span>
                                  </div>
                                  <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                                    <span className="text-zinc-600 block text-[10px] uppercase mb-1">Expected</span>
                                    <span className="text-zinc-700 dark:text-zinc-300 break-all">{res.expected}</span>
                                  </div>
                                  <div className={`p-2 rounded-lg border ${res.passed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-900/30'}`}>
                                    <span className={`block text-[10px] uppercase mb-1 ${res.passed ? 'text-emerald-600' : 'text-red-600'}`}>Actual Output</span>
                                    <span className={`text-zinc-800 dark:text-zinc-200 break-all ${(res.actual || (res as any).actual_output || "No output").includes('No output') ? 'opacity-50 italic' : ''}`}>
                                      {res.actual || (res as any).actual_output || "No output returned"}
                                    </span>
                                  </div>
                                  {!res.passed && res.error_message && (
                                    <div className="text-red-800 dark:text-red-400 text-xs mt-3 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30 whitespace-pre-wrap">
                                      <strong>Feedback:</strong> {res.error_message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeRightTab === 'submissions' && (
                    <div className="h-full">
                      {isLoadingSubmissions ? (
                        <div className="flex items-center justify-center h-full gap-3 text-zinc-600 dark:text-zinc-500">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="text-sm">Loading history...</span>
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                          <History size={36} className="text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">No Submissions Yet</p>
                          <p className="text-zinc-600 text-xs mt-1">Submit your code to see history.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                              {submissions.length} Attempts
                            </h3>
                            <button onClick={fetchSubmissions} className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 transition-colors p-1" title="Refresh">
                              <RefreshCw size={14} />
                            </button>
                          </div>
                          {submissions.map((sub) => (
                            <div key={sub.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                              <button
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"
                                onClick={() => setExpandedSubmission(expandedSubmission === sub.id ? null : sub.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${sub.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {sub.passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    {sub.passed ? 'Accepted' : 'Failed'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-500 text-xs font-medium">
                                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(sub.created_at)}</span>
                                  {expandedSubmission === sub.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                              </button>
                              {expandedSubmission === sub.id && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 pb-4 pt-3 bg-zinc-950">
                                  <div className="text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-wider">Submitted Code</div>
                                  <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed max-h-60 overflow-y-auto border border-zinc-200 dark:border-zinc-800">
                                    {sub.code_snippet}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin" size={32} /></div>}>
      <ArenaPageContent />
    </Suspense>
  );
}
