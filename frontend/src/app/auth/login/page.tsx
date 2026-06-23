"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error("Please verify your email address before logging in.");
        } else {
          toast.error("Invalid email or password.");
        }
        return;
      }

      if (data.session) {
        toast.success("Successfully logged in!");
        await useAuthStore.getState().refreshSession();
        router.refresh();
        router.push('/arena');
      }

    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/[0.05] shadow-xl dark:shadow-none p-8 rounded-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 border border-orange-100 dark:border-orange-500/20 shadow-inner">
          <LogIn size={24} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome Back</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 text-center">
          Log in to continue your interview preparation
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm shadow-sm dark:shadow-none"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-semibold">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm shadow-sm dark:shadow-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex justify-center items-center gap-2 mt-6 cursor-pointer"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
          Log In
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-semibold">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
