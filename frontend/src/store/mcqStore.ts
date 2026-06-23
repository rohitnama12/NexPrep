import { create } from 'zustand';

export interface MCQQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

type QuizStateStatus = 'idle' | 'loading' | 'active' | 'finished';

interface MCQState {
  quizState: QuizStateStatus;
  questions: MCQQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<number, number>; // index -> selected option index
  score: number;

  // Timer
  timerEnabled: boolean;
  timeRemaining: number; // in seconds
  timerInterval: ReturnType<typeof setInterval> | null;

  setQuizState: (state: QuizStateStatus) => void;
  setQuestions: (questions: MCQQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  answerQuestion: (questionIndex: number, optionIndex: number) => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  setTimerEnabled: (enabled: boolean) => void;
  startTimer: (totalSeconds: number, onExpire: () => void) => void;
  tick: () => void;
  clearTimer: () => void;
}

export const useMCQStore = create<MCQState>((set, get) => ({
  quizState: 'idle',
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  score: 0,
  timerEnabled: false,
  timeRemaining: 0,
  timerInterval: null,

  setQuizState: (state) => set({ quizState: state }),
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setTimerEnabled: (enabled) => set({ timerEnabled: enabled }),
  
  answerQuestion: (questionIndex, optionIndex) => set((state) => ({
    userAnswers: { ...state.userAnswers, [questionIndex]: optionIndex }
  })),

  finishQuiz: () => {
    const state = get();
    state.clearTimer();
    let score = 0;
    state.questions.forEach((q, idx) => {
      if (state.userAnswers[idx] === q.correct_answer_index) {
        score += 1;
      }
    });
    set({ quizState: 'finished', score: Math.round((score / state.questions.length) * 100) });
  },

  startTimer: (totalSeconds, onExpire) => {
    const state = get();
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    const interval = setInterval(() => {
      const current = get();
      if (current.timeRemaining <= 1) {
        clearInterval(interval);
        set({ timeRemaining: 0, timerInterval: null });
        onExpire();
        return;
      }
      set({ timeRemaining: current.timeRemaining - 1 });
    }, 1000);
    
    set({ timeRemaining: totalSeconds, timerInterval: interval });
  },

  tick: () => set((state) => ({ timeRemaining: state.timeRemaining - 1 })),

  clearTimer: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    set({ timerInterval: null });
  },

  resetQuiz: () => {
    const state = get();
    state.clearTimer();
    set({
      quizState: 'idle',
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      score: 0,
      timeRemaining: 0,
      timerInterval: null,
    });
  },
}));
