import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const chatService = {
  rooms: () => httpClient.get(endpoints.chat.rooms),
  messages: (roomId, params) => httpClient.get(endpoints.chat.messages(roomId), { params }),
  sendMessage: (roomId, payload) => httpClient.post(endpoints.chat.messages(roomId), payload),
  upload: (payload) =>
    httpClient.post(endpoints.chat.upload, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
