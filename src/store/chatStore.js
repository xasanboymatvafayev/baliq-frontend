import { create } from 'zustand'

export const useChatStore = create((set) => ({
  activeChatId: null,
  onlineUsers: [],
  typingUsers: [],
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setTypingUsers: (typingUsers) => set({ typingUsers }),
}))
