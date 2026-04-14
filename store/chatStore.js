import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  appendToken: (token) => set(s => {
    const msgs = [...s.messages];
    if (msgs.length && msgs[msgs.length-1].role === 'assistant') {
      msgs[msgs.length-1] = { ...msgs[msgs.length-1], content: msgs[msgs.length-1].content + token };
    }
    return { messages: msgs };
  }),
  setStreaming: (v) => set({ isStreaming: v }),
  clearChat: () => set({ messages: [] }),
}));