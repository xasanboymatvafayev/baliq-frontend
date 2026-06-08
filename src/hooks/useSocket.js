import { useEffect, useCallback } from 'react'
import { getSocket } from '../services/socketClient.js'
import { useAuthStore } from '../store/authStore.js'

export function useSocket(eventName, handler) {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const socket = getSocket(token)
    socket.connect()
    socket.on(eventName, handler)

    return () => {
      socket.off(eventName, handler)
    }
  }, [eventName, handler, token])
}

// Socket orqali event emit qilish uchun hook
export function useSocketEmit() {
  const token = useAuthStore((state) => state.token)

  const emit = useCallback((event, data) => {
    const socket = getSocket(token)
    if (socket.connected) {
      socket.emit(event, data)
    }
  }, [token])

  return emit
}
