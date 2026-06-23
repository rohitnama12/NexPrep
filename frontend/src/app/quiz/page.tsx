"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Loader2, BrainCircuit, CheckCircle2, XCircle, ChevronRight, RotateCcw, Timer, Clock } from 'lucide-react';
import { useMCQStore } from '@/store/mcqStore';
import { fetchApi } from '@/utils/apiClient';

export default function QuizPage() {
  const { 
    quizState, questions, currentQuestionIndex, userAnswers, score,
    timerEnabled, timeRemaining,
    setQuizState, setQuestions, setCurrentQuestionIndex, answerQuestion, finishQuiz, resetQuiz,
    setTimerEnabled, startTimer
  } = useMCQStore();

  const [topic, setTopic] = useState('Python Data Types');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = useCallback(async () => {
    let rawScore = 0;
    const qs = useMCQStore.getState().questions;
    const answers = useMCQStore.getState().userAnswers;
    qs.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer_index) rawScore += 1;
    });
    
    finishQuiz();

    try {
      await fetchApi('/history/mcq', {
        method: 'POST',
        body: JSON.stringify({
          topic: topic,
          difficulty: difficulty,
          score: rawScore,
          total_questions: qs.length
        })
      });
    } catch (e) {
      console.error("Failed to save MCQ history", e);
    }
  }, [topic, difficulty, finishQuiz]);

  const generateQuiz = async () => {
    setQuizState('loading');
    try {
      const res = await fetchApi('/mcq/generate', {
        method: 'POST',
        body: JSON.stringify({ topic, difficulty, question_count: questionCount })
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      setQuestions(data.questions);
      setQuizState('active');

      // Start timer if enabled
      if (timerEnabled) {
        const totalSeconds = data.questions.length * 60; // 1 minute per question
        startTimer(totalSeconds, () => {
          toast.error("⏰ Time's up! Auto-submitting your assessment.");
          handleFinish();
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate quiz. You might be rate-limited.');
      setQuizState('idle');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };  if (quizState === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none max-w-md w-full p-8 rounded-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 border border-orange-100 dark:border-orange-500/20 shadow-inner">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Custom MCQ Engine</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8 text-sm">Generate a hyper-targeted assessment on any topic you want.</p>
          
          <div className="w-full space-y-5 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Topic (Custom)</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python Data Types, React Hooks, SQL Joins"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm shadow-sm dark:shadow-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Difficulty</label>
              <div className="relative">
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm appearance-none cursor-pointer shadow-sm dark:shadow-none pr-10"
                >
                  <option value="Easy" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Easy</option>
                  <option value="Medium" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Medium</option>
                  <option value="Hard" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Hard</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 dark:text-zinc-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex justify-between">
                <span>Number of Questions</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{questionCount}</span>
              </label>
              <div className="px-1">
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-zinc-450 dark:text-zinc-500 mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Timer size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Enable Timer</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500">1 minute per question</p>
                </div>
              </div>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${timerEnabled ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${timerEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <button 
            onClick={generateQuiz}
            disabled={!topic.trim()}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            Generate Assessment
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Generating Assessment...</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-sm text-sm">
          Our AI is crafting {questionCount} high-quality questions on &quot;{topic}&quot; at {difficulty} difficulty.
        </p>
      </div>
    );
  }

  if (quizState === 'active') {
    const question = questions[currentQuestionIndex];
    const selectedAnswer = userAnswers[currentQuestionIndex];

    return (
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-3xl mx-auto w-full p-4 flex flex-col">
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-4">
                {timerEnabled && (
                  <div className={`flex items-center gap-2 text-sm font-mono font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    timeRemaining <= 60 
                      ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 animate-pulse' 
                      : 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    <Clock size={14} />
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <span className="text-xs font-bold text-amber-650 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3 py-1.5 rounded-lg">
                  {topic} • {difficulty}
                </span>
              </div>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-600 transition-all duration-300 ease-out"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none p-8 rounded-2xl flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-8 leading-relaxed">
              {question.question}
            </h2>

            <div className="space-y-3.5 flex-1">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answerQuestion(currentQuestionIndex, idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedAnswer === idx 
                      ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-300 font-medium' 
                      : 'bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${
                      selectedAnswer === idx ? 'border-amber-500 bg-amber-500 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/20'
                    }`}>
                      {selectedAnswer === idx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedAnswer === undefined}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex items-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Assessment'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'finished') {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 min-h-screen py-8 overflow-y-auto transition-colors duration-300">
        <div className="max-w-4xl mx-auto w-full p-4">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none p-8 rounded-2xl mb-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border-[4px] border-orange-500 flex items-center justify-center mb-6 relative shadow-inner">
               <span className="text-3xl font-bold text-zinc-900 dark:text-white">{score}%</span>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Assessment Complete!</h2>
            <p className="text-zinc-650 dark:text-zinc-400 mb-8 max-w-lg text-sm">
              You scored {score}% on the &quot;{topic}&quot; ({difficulty}) assessment. Review the detailed explanations below to learn from any mistakes.
            </p>
            <button 
              onClick={resetQuiz}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-zinc-200 dark:border-transparent shadow-sm dark:shadow-none"
            >
              <RotateCcw size={18} /> Take Another Quiz
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns === q.correct_answer_index;

              return (
                <div key={idx} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.05] shadow-sm dark:shadow-none p-6 rounded-2xl">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="text-emerald-500" size={24} />
                      ) : (
                        <XCircle className="text-red-500" size={24} />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-1 block">Question {idx + 1}</span>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{q.question}</h3>
                    </div>
                  </div>

                  <div className="pl-10 space-y-2 mb-6">
                    {q.options.map((opt, optIdx) => {
                      let optStyle = "bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/5 text-zinc-650 dark:text-zinc-400";
                      if (optIdx === q.correct_answer_index) {
                        optStyle = "bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-medium";
                      } else if (optIdx === userAns && !isCorrect) {
                        optStyle = "bg-red-50/60 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-300 font-medium";
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border ${optStyle} flex items-center justify-between`}>
                          <span className="text-sm">{opt}</span>
                          {optIdx === q.correct_answer_index && <span className="text-xs uppercase font-bold text-emerald-650 dark:text-emerald-500">Correct Answer</span>}
                          {optIdx === userAns && !isCorrect && <span className="text-xs uppercase font-bold text-red-600 dark:text-red-500">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pl-10">
                    <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-5 border border-zinc-200 dark:border-white/10">
                      <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Explanation</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-650 dark:text-zinc-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
