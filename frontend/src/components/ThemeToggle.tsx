"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 bg-black/10 dark:bg-white/5 rounded-full" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-16 h-8 rounded-full p-1 bg-black/10 dark:bg-white/10 transition-colors focus:outline-none ring-2 ring-transparent focus-visible:ring-amber-500/50"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center z-10"
        initial={false}
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-amber-400" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </motion.div>
      <div className="flex w-full justify-between px-1.5 text-zinc-400">
        <Sun size={14} className={!isDark ? "opacity-0" : "opacity-100"} />
        <Moon size={14} className={isDark ? "opacity-0" : "opacity-100"} />
      </div>
    </button>
  );
}
