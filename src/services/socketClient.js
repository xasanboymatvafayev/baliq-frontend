import { io } from 'socket.io-client'

let socket

export function getSocket(token) {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
      autoConnect: false,
      transports: ['websocket'],
    })
  }

  socket.auth = token ? { token } : {}
  return socket
}
