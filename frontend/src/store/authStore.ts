import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    const supabase = createClient();
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    set({ 
      session, 
      user: session?.user ?? null,
      isLoading: false,
      isInitialized: true
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        session, 
        user: session?.user ?? null,
        isLoading: false
      });
    });
  },

  refreshSession: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    set({ 
      session, 
      user: session?.user ?? null,
      isLoading: false,
      isInitialized: true
    });
  },

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
}));
