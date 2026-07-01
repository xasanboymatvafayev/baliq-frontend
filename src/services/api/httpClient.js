import axios from 'axios'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 35000,  // Railway cold start uchun 35 sekund
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  try {
    // localStorage yoki sessionStorage dan token olish
    const local   = localStorage.getItem('baliq-auth-session')
    const session2 = sessionStorage.getItem('baliq-auth-session')
    const raw     = local || session2
    if (raw) {
      const parsed = JSON.parse(raw)
      const token  = parsed?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch { /* ignore */ }
  return config
})

const STATUS_MESSAGES = {
  400: "So'rov noto'g'ri. Ma'lumotlarni tekshiring.",
  401: "Tizimga kirish talab qilinadi.",
  403: "Bu amalni bajarish uchun ruxsat yo'q.",
  404: "Ma'lumot topilmadi.",
  408: "So'rov vaqti tugadi.",
  409: "Bu ma'lumot allaqachon mavjud.",
  422: "Ma'lumotlar noto'g'ri formatda.",
  429: "Juda ko'p so'rov. Bir oz kuting.",
  500: "Server xatosi. Keyinroq urinib ko'ring.",
  502: "Server vaqtincha ishlamayapti.",
  503: "Xizmat vaqtincha mavjud emas.",
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password', '/auth/send-otp', '/auth/firebase']
const isAuthEndpoint = (config) => AUTH_PATHS.some(p => (config?.url || '').includes(p))

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
let isRedirecting = false

httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail || error.response?.data?.message

    if (detail) return Promise.reject(new Error(detail))

    if (status === 401 && !isRedirecting && !isAuthEndpoint(error.config)) {
      isRedirecting = true
      localStorage.removeItem('baliq-auth-session')
      sessionStorage.removeItem('baliq-auth-session')
      window.location.href = '/login'
      setTimeout(() => { isRedirecting = false }, 5000)
      return Promise.reject(new Error("Sessiya tugagan. Qayta kiring."))
    }

    // Network xatosi — Railway cold start uchun 2 marta urinib ko'ramiz
    if (!error.response && error.config && !error.config._retryCount) {
      error.config._retryCount = (error.config._retryCount || 0) + 1
      if (error.config._retryCount <= 2) {
        await sleep(error.config._retryCount * 4000) // 4s, 8s
        try {
          return await httpClient(error.config)
        } catch { /* fall through */ }
      }
    }

    if (status && STATUS_MESSAGES[status]) return Promise.reject(new Error(STATUS_MESSAGES[status]))
    if (!error.response) return Promise.reject(new Error("Internet aloqasi yo'q yoki server ishlamayapti."))
    return Promise.reject(new Error("Noma'lum xatolik yuz berdi."))
  }
)
