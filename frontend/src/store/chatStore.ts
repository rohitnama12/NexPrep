import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeSessionId: string | null;
  resumeContext: string | null;
  setActiveSessionId: (id: string | null) => void;
  setResumeContext: (context: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  appendChunkToLastMessage: (chunk: string) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  activeSessionId: null,
  resumeContext: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setResumeContext: (context) => set({ resumeContext: context }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  appendChunkToLastMessage: (chunk) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content += chunk;
      }
    }
    return { messages };
  }),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [] }),
}));
