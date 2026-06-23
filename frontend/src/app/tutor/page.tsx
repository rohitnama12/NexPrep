"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, User, Bot, Loader2, Upload, CheckCircle2, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { fetchApi, fetchApiFormData } from '@/utils/apiClient';

interface TutorSession {
  id: string;
  title: string;
  created_at: string;
}

export default function TutorPage() {
  const {
    messages, isTyping, activeSessionId, setActiveSessionId, setMessages,
    addMessage, appendChunkToLastMessage, setTyping, clearMessages,
    resumeContext, setResumeContext
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchSessionMessages(activeSessionId);
    } else {
      clearMessages();
    }
  }, [activeSessionId]);

  const fetchSessions = async () => {
    try {
      const res = await fetchApi('/tutor/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const res = await fetchApi(`/tutor/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content
        })));
      }
    } catch (err) {
      console.error('Failed to fetch session messages:', err);
      toast.error('Failed to load chat history.');
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    clearMessages();
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const res = await fetchApi(`/tutor/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          clearMessages();
        }
        toast.success('Session deleted.');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to delete session.');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete session.');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are accepted.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetchApiFormData('/tutor/parse-resume', formData);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }
      const data = await res.json();
      toast.success(`Resume parsed statelessly! Context is now active for the AI.`);
      setResumeContext(data.text);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse resume.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ id: Date.now().toString(), role: 'user', content: userMessage });
    setTyping(true);

    try {
      const response = await fetchApi('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({
          session_id: activeSessionId || 'new',
          resume_context: resumeContext,
          messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.body) throw new Error('No response body');

      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: '' });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.session_id) {
                setActiveSessionId(data.session_id);
                fetchSessions();
              } else if (data.content) {
                appendChunkToLastMessage(data.content);
              } else if (data.error) {
                appendChunkToLastMessage(`\n\n**Error:** ${data.error}`);
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Connection error or rate limit exceeded.');
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: '**Error:** Unable to connect to the AI Tutor.'
      });
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-96px)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col gap-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 justify-center py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md rounded-xl transition-all duration-300 font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>

          {/* Stateless Resume Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full flex items-center gap-2 justify-center py-2.5 transition-colors rounded-lg font-medium text-sm border ${resumeContext
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 dark:text-orange-400'
              : 'bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-white/10 text-zinc-700 dark:text-zinc-300'
              } disabled:opacity-50`}
            title="Upload a resume to provide stateless context to the AI for this session."
          >
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : resumeContext ? <CheckCircle2 size={16} /> : <Upload size={16} />}
            {isUploading ? 'Parsing...' : resumeContext ? 'Context Active' : 'Upload Resume'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
            Recent Sessions
          </p>
          {isSessionsLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-zinc-600 dark:text-zinc-500" size={24} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-zinc-600 dark:text-zinc-500 text-center">
              No recent sessions.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group w-full flex items-center gap-2 rounded-lg transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-orange-50 dark:bg-white/10'
                    : 'hover:bg-zinc-200 dark:hover:bg-white/5'
                }`}
              >
                <button
                  onClick={() => setActiveSessionId(session.id)}
                  className={`flex-1 text-left px-3 py-2.5 flex items-center gap-3 min-w-0 ${
                    activeSessionId === session.id
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <MessageSquare size={16} className={activeSessionId === session.id ? 'text-orange-600 dark:text-orange-400 shrink-0' : 'text-zinc-600 dark:text-zinc-500 shrink-0'} />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </button>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                  title="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div className="flex-1 flex flex-col p-4 min-w-0 bg-white dark:bg-[#030303]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-500 h-full">
              <Bot size={56} className="mb-4 text-orange-500" />
              <h2 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-200">AI Theory Tutor</h2>
              <p className="text-sm max-w-md text-center text-zinc-600 dark:text-zinc-400">
                Ask me anything about Software Engineering. I can explain complex data structures, system design, and algorithmic theory.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-[80%] px-5 py-4 ${m.role === 'user'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl rounded-tr-sm shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.05] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm prose dark:prose-invert max-w-full'
                }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md my-2 !bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-sm"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className="bg-orange-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm text-orange-700 dark:text-orange-300 font-mono">
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0 mt-1">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-1">
                <Bot size={18} />
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.05] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 h-[52px]">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 typing-dot"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 typing-dot"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="relative rounded-full p-2 flex items-end border border-zinc-200 dark:border-white/10 focus-within:border-orange-500/50 transition-colors shrink-0 shadow-lg backdrop-blur-md bg-white/50 dark:bg-zinc-900/50 mx-4 mb-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a technical question... (Shift+Enter for new line)"
            className="flex-1 max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none p-3 outline-none text-zinc-900 dark:text-white placeholder-zinc-500 font-sans"
            rows={1}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1 shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
