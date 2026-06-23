"use client";

import Link from "next/link";
import { ArrowRight, Code2, MessagesSquare, Sparkles, Brain, Terminal, ListTodo, GraduationCap, Trophy, CalendarDays, BrainCircuit, Phone, Mail } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { StarsBackground } from "@/components/StarsBackground";
import { ShootingStars } from "@/components/ShootingStars";
import { TiltCard } from "@/components/3d-card";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col items-center w-full bg-[#FAFAFA] dark:bg-[#050505] overflow-hidden transition-colors duration-500">

      {/* Ambient Background */}
      <StarsBackground starDensity={0.00018} />
      <ShootingStars />

      {/* Massive Neon Glowing Orbs Removed by User Request */}

      {/* SECTION 1: CINEMATIC HERO (100vh) */}
      <div className="relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
        {/* Elite Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold mb-10 backdrop-blur-3xl transition-all hover:scale-105 hover:border-amber-500/30 hover:bg-amber-500/5"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span className="uppercase tracking-widest text-[10px] text-zinc-400">Titanium Protocol Active</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-7xl md:text-[140px] font-display font-black tracking-tighter leading-[0.9]">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              NexPrep
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
        >
          An immersive, edge-to-edge coding environment. Real-time Socratic feedback. Comprehensive metric tracking. Stop memorizing algorithms, start understanding them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto"
        >
          <Link href="/arena" className="group relative bg-zinc-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(245,158,11,0.2)] dark:hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Enter Arena
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/tutor" className="group bg-transparent border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-white px-10 py-5 rounded-full font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center backdrop-blur-md">
            Query AI Tutor
          </Link>
        </motion.div>
      </div>

      {/* DESCRIPTIVE FEATURE SECTIONS */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-24 px-6 space-y-40">

        {/* Feature 1: Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-8">
              <Terminal size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
              The Execution <span className="text-amber-500">Arena.</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-6">
              A fully integrated Monaco editor with VS Code keybinds and a secure sandbox for executing your algorithms in real time. We support multiple languages including Python, JavaScript, and C++.
            </p>
            <ul className="space-y-4 text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Real-time code execution</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Integrated test cases and standard output</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Save your submissions instantly</li>
            </ul>
          </motion.div>
          <div className="order-1 md:order-2">
            <TiltCard rotationIntensity={10} className="w-full rounded-[2rem]">
              <div className="w-full h-80 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-900/50 border-b border-zinc-300 dark:border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 p-6 font-mono text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed opacity-80">
                  <span className="text-amber-600 dark:text-amber-400">def</span> two_sum(nums, target):<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;seen = {"{}"}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-600 dark:text-amber-400">for</span> i, num <span className="text-amber-600 dark:text-amber-400">in</span> enumerate(nums):<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diff = target - num<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-600 dark:text-amber-400">if</span> diff <span className="text-amber-600 dark:text-amber-400">in</span> seen:<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-600 dark:text-amber-400">return</span> [seen[diff], i]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Feature 2: Tutor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-1 md:order-1">
            <TiltCard rotationIntensity={10} className="w-full rounded-[2rem]">
              <div className="w-full h-80 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 flex flex-col gap-4">
                <div className="self-end bg-amber-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] text-sm">
                  I am stuck on calculating the time complexity of this recursive function.
                </div>
                <div className="self-start bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm flex items-start gap-3">
                  <BrainCircuit className="text-amber-500 shrink-0 mt-0.5" size={16} />
                  <span>Let's break it down. What is the base case of your recursion, and how many branches does each recursive call create?</span>
                </div>
              </div>
            </TiltCard>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-2"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.2)] mb-8">
              <MessagesSquare size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
              Socratic <span className="text-orange-500">AI Tutor.</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-6">
              We don't give you the answers. Our AI guides you through your logic using targeted questions, mimicking a real technical interview.
            </p>
            <ul className="space-y-4 text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> Stateful chat history</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> Upload a resume for tailored, stateless context</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> Deep theory and algorithm explanations</li>
            </ul>
          </motion.div>
        </div>

        {/* Feature 3: Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-8">
              <ListTodo size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
              Telemetry <span className="text-amber-500">Tracker.</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-6">
              Visually monitor your progress across curated lists like Blind 75 and Striver's A2Z. Identify knowledge gaps instantly.
            </p>
            <ul className="space-y-4 text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Track hundreds of premium problems</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Filter by difficulty, topic, and playlist</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Massive radial progress indicators</li>
            </ul>
          </motion.div>
          <div className="order-1 md:order-2">
            <TiltCard rotationIntensity={10} className="w-full rounded-[2rem]">
              <div className="w-full h-80 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-zinc-200 dark:text-zinc-800" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-orange-600 transition-all duration-1000 ease-out" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * 68) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-black text-zinc-900 dark:text-white">68%</span>
                    <span className="text-xs font-bold text-zinc-500">COMPLETED</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Feature 4: Quiz & Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-1 md:order-1">
            <TiltCard rotationIntensity={10} className="w-full rounded-[2rem]">
              <div className="w-full h-80 bg-zinc-100 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 flex flex-col justify-center gap-4">
                <div className="w-full p-4 rounded-xl border bg-amber-50/60 dark:bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-300 font-medium flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-amber-500 bg-amber-500 text-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-sm">O(N log N) - Merge Sort Time Complexity</span>
                </div>
                <div className="w-full p-4 rounded-xl border bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/20" />
                  <span className="text-sm">O(N^2) - Bubble Sort Time Complexity</span>
                </div>
              </div>
            </TiltCard>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-2"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.2)] mb-8">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
              Custom <span className="text-orange-500">Assessments.</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-6">
              Generate dynamic multiple choice questions tailored to any software engineering topic. Track your accuracy and mastery in the Command Center Dashboard.
            </p>
            <ul className="space-y-4 text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> AI-generated dynamic MCQs</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> Optional timed assessments</li>
              <li className="flex items-center gap-3"><Sparkles size={18} className="text-amber-500" /> Advanced data visualizations and streak tracking</li>
            </ul>
          </motion.div>
        </div>

      </div>

      {/* SECTION 5: FINAL CTA */}
      <div className="relative z-10 w-full max-w-4xl mx-auto py-40 px-6 text-center mt-20">
        <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <h2 className="relative z-10 text-5xl md:text-7xl font-display font-black tracking-tighter text-zinc-900 dark:text-white mb-8">
          Ready to <span className="text-amber-500">Level Up?</span>
        </h2>
        <p className="relative z-10 text-xl text-zinc-500 max-w-2xl mx-auto mb-12">
          Join the elite protocol. Stop memorizing, start understanding.
        </p>
        <Link href="/arena" className="relative z-10 inline-flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black px-12 py-6 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          Launch Sandbox <ArrowRight size={24} />
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-zinc-200 dark:border-white/[0.05] py-12 px-6 bg-zinc-50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
              <Brain size={24} className="text-amber-500" />
              NEXPREP
            </div>
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
              Engineered by <span className="text-zinc-800 dark:text-zinc-300 font-semibold">Rohit Nama</span>
            </p>
          </div>
          
          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-y-3 gap-x-6 text-sm text-zinc-600 dark:text-zinc-400">
            <a href="tel:+918233937872" className="flex items-center gap-2 hover:text-amber-500 dark:hover:text-amber-400 transition-colors font-medium">
              <Phone size={14} className="text-amber-500" />
              <span>+91-8233937872</span>
            </a>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-800">|</span>
            <a href="mailto:rohitnama101@gmail.com" className="flex items-center gap-2 hover:text-amber-500 dark:hover:text-amber-400 transition-colors font-medium">
              <Mail size={14} className="text-amber-500" />
              <span>rohitnama101@gmail.com</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/rohitnama12" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
              title="GitHub Profile"
            >
              <FaGithub size={18} />
            </a>
            <a 
              href="https://linkedin.com/in/rohitnama" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
              title="LinkedIn Profile"
            >
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
