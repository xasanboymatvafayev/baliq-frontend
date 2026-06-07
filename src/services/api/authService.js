import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const authService = {
  login: (payload) => httpClient.post(endpoints.auth.login, payload),
  register: (payload) => httpClient.post(endpoints.auth.register, payload),
  forgotPassword: (payload) => httpClient.post(endpoints.auth.forgotPassword, payload),
  verifyOtp: (payload) => httpClient.post(endpoints.auth.verifyOtp, payload),
  resetPassword: (payload) => httpClient.post(endpoints.auth.resetPassword, payload),
  me: () => httpClient.get(endpoints.auth.me),
}
