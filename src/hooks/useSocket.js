import { useEffect } from 'react'
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
