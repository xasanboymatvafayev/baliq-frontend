import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set({
          items: [...get().items.filter((existing) => existing.id !== item.id), item],
        }),
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clearCart: () => set({ items: [] }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }),
    }),
    { name: 'baliq-cart' },
  ),
)
