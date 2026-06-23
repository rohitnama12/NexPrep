"use client";

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSubmitted(true);
      toast.success("Check your email for the reset link");

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
          <KeyRound size={24} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Reset Password</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 text-center">
          {isSubmitted 
            ? "We've sent you a secure reset link." 
            : "Enter your email to receive a password reset link."}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleReset} className="space-y-4">
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

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex justify-center items-center gap-2 mt-6 cursor-pointer"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={20} />}
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-orange-800 dark:text-orange-400 text-sm leading-relaxed">
            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly. Please check your spam folder if you don't see it.
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm">
        <Link href="/auth/login" className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center gap-2 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Log In
        </Link>
      </div>
    </div>
  );
}
