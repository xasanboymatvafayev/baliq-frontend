import { create } from 'zustand'

// "Meni eslab qol" uchun:
// rememberMe=true  -> localStorage (brauzer yopilsa ham saqlanadi)
// rememberMe=false -> sessionStorage (tab yopilsa o'chadi)

const STORAGE_KEY = 'baliq-auth-session'

function loadState() {
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) return JSON.parse(local)
    const sess = sessionStorage.getItem(STORAGE_KEY)
    if (sess) return JSON.parse(sess)
  } catch {}
  return null
}

function saveState(state, rememberMe) {
  try {
    const data = JSON.stringify(state)
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, data)
      sessionStorage.removeItem(STORAGE_KEY)
    } else {
      sessionStorage.setItem(STORAGE_KEY, data)
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

const saved = loadState()

export const useAuthStore = create((set, get) => ({
  user:       saved?.user  || null,
  role:       saved?.role  || 'customer',
  token:      saved?.token || null,
  rememberMe: saved?.rememberMe ?? true,

  setSession: ({ user, role, token, rememberMe = true }) => {
    const state = { user, role, token, rememberMe }
    set(state)
    saveState(state, rememberMe)
  },

  setRole: (role) => {
    set({ role })
    const cur = get()
    saveState({ user: cur.user, role, token: cur.token, rememberMe: cur.rememberMe }, cur.rememberMe)
  },

  logout: () => {
    clearState()
    set({ user: null, token: null, role: 'customer', rememberMe: true })
  },
}))
