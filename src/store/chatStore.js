import { create } from 'zustand'

export const useChatStore = create((set) => ({
  activeChatId: null,
  onlineUsers: [],
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
}))
