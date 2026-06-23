import { create } from 'zustand';

export interface TestCase {
  input: string;
  expected_output: string;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error_message?: string;
}

export interface ExecutionResultPayload {
  success: boolean;
  results: TestCaseResult[];
  fallback_used: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  constraints: string[];
  examples: Example[];
  boilerplate_code: string;
  hidden_test_cases: TestCase[];
  playlists: string[];
  solution_article: string;
}

export interface ArenaPreferences {
  category: string;
  topic: string;
  difficulty: string;
  language: string;
  playlist: string;
}

interface ArenaState {
  currentProblem: Problem | null;
  userCode: string;
  executionResults: ExecutionResultPayload | null;
  hintMessage: string | null;
  
  // Stored preferences for the session
  preferences: ArenaPreferences;

  setProblem: (problem: Problem | null) => void;
  setUserCode: (code: string) => void;
  setExecutionResults: (results: ExecutionResultPayload | null) => void;
  setHintMessage: (hint: string | null) => void;
  setPreferences: (prefs: Partial<ArenaPreferences>) => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
  currentProblem: null,
  userCode: "",
  executionResults: null,
  hintMessage: null,
  
  preferences: {
    category: 'DSA',
    topic: '',
    difficulty: 'Medium',
    language: 'python',
    playlist: 'all'
  },

  setProblem: (problem) => set({ currentProblem: problem, userCode: problem?.boilerplate_code || "", executionResults: null, hintMessage: null }),
  setUserCode: (code) => set({ userCode: code }),
  setExecutionResults: (results) => set({ executionResults: results }),
  setHintMessage: (hint) => set({ hintMessage: hint }),
  setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
}));
