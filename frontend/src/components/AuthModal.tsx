"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, UserPlus, Loader2, X } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const { initialize } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            toast.error("Account already exists. Please log in.");
            setMode('login');
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }
        if (data.user && !data.session) {
          toast.success("Registration successful! Please check your email to verify your account.");
          onClose();
        } else if (data.session) {
          toast.success("Registration successful!");
          await initialize();
          onClose();
          router.push('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            toast.error("Please verify your email address before logging in.");
          } else {
            toast.error("Invalid email or password.");
          }
          setIsLoading(false);
          return;
        }
        if (data.session) {
          toast.success("Successfully logged in!");
          await initialize();
          onClose();
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-500/20 shadow-inner">
                {mode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />}
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 text-center">
                {mode === 'login' ? 'Log in to continue your interview preparation' : 'Join the AI Interview Platform to track your progress'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                  {mode === 'login' && (
                    <a href="/auth/forgot-password" onClick={(e) => { e.preventDefault(); onClose(); router.push('/auth/forgot-password'); }} className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2 mt-6"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />)}
                {mode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <span className="w-1/5 border-b border-zinc-200 dark:border-zinc-800 lg:w-1/4"></span>
              <span className="text-xs text-center text-zinc-500 dark:text-zinc-400 uppercase">or continue with</span>
              <span className="w-1/5 border-b border-zinc-200 dark:border-zinc-800 lg:w-1/4"></span>
            </div>

            <div className="mt-6 flex gap-4">
              <button onClick={() => handleOAuth('google')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <FaGoogle className="text-red-500" size={16} /> Google
              </button>
              <button onClick={() => handleOAuth('github')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <FaGithub size={16} /> GitHub
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
