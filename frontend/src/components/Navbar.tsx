"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, Code2, MessagesSquare, LogOut, User as UserIcon, Activity, ListTodo } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    // Explicit refresh of session on signout
    await initialize();
    router.push('/');
  };

  const routes = [
    { name: "Theory Tutor", path: "/tutor", icon: <MessagesSquare size={16} /> },
    { name: "Coding Arena", path: "/arena", icon: <Code2 size={16} /> },
    { name: "DSA Tracker", path: "/tracker", icon: <ListTodo size={16} /> },
    { name: "MCQs", path: "/quiz", icon: <Brain size={16} /> },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none transition-all duration-300">
      <nav className="pointer-events-auto border border-zinc-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl px-4 py-3 flex items-center justify-between rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-colors duration-300 w-full">
        <Link href="/" className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 pl-4">
          <Brain size={20} className="text-amber-500" />
          <span className="hidden sm:inline">NEXPREP</span>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-5">
          {/* Navigation Links */}
          <div className="flex gap-2.5 md:gap-3.5">
            {routes.map((route) => {
              const isActive = pathname === route.path;
              return (
                <Link 
                  key={route.path} 
                  href={route.path}
                  className={`text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full ${
                    isActive 
                      ? 'bg-zinc-900 text-white dark:bg-white/10 dark:text-amber-400 shadow-sm' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="hidden md:inline">{route.icon}</span>
                  {route.name}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3 pl-3 md:pl-5 border-l border-zinc-200 dark:border-white/10">
            {!isInitialized ? (
              <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 pl-2 pr-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center">
                    <UserIcon size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[80px] sm:max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/5 mb-2">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-amber-500 transition-colors flex items-center gap-2 mx-2 rounded-lg"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Activity size={16} /> Dashboard
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 mt-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 mx-2 rounded-lg"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} 
                  className="hidden sm:flex text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 transition-colors items-center"
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }} 
                  className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}
