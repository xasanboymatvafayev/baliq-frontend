import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const fileService = {
  upload: (payload) =>
    httpClient.post(endpoints.files.upload, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
