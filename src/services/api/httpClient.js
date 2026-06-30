import axios from 'axios'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const session = localStorage.getItem('baliq-auth-session')
  if (session) {
    const parsed = JSON.parse(session)
    const token = parsed?.state?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// HTTP status kodlari bo'yicha o'zbek tilida xato xabarlar
const STATUS_MESSAGES = {
  400: "So'rov noto'g'ri. Kiritilgan ma'lumotlarni tekshiring.",
  401: "Tizimga kirish talab qilinadi yoki sessiya tugagan. Qayta kiring.",
  403: "Bu amalni bajarish uchun ruxsat yo'q.",
  404: "So'ralgan ma'lumot topilmadi.",
  408: "So'rov vaqti tugadi. Internet aloqasini tekshiring.",
  409: "Bu ma'lumot allaqachon mavjud.",
  422: "Ma'lumotlar noto'g'ri formatda kiritilgan.",
  429: "Juda ko'p so'rov yuborildi. Bir oz kuting.",
  500: "Server xatosi yuz berdi. Keyinroq urinib ko'ring.",
  502: "Server vaqtincha ishlamayapti.",
  503: "Xizmat vaqtincha mavjud emas.",
}

let isRedirectingToLogin = false

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status

    // 401 — token tugagan yoki noto'g'ri: avtomatik chiqarib login sahifasiga yo'naltiramiz
    if (status === 401 && !isRedirectingToLogin) {
      isRedirectingToLogin = true
      localStorage.removeItem('baliq-auth-session')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(new Error("Sessiya muddati tugagan. Qayta kiring."))
    }

    // Network xatosi — bir marta avtomatik qayta urinib ko'ramiz (Railway cold start uchun)
    if (!error.response && error.config && !error.config._retried) {
      error.config._retried = true
      await sleep(3000)
      try {
        return await httpClient(error.config)
      } catch {
        return Promise.reject(new Error("Internet aloqasi yo'q yoki server ishlamayapti."))
      }
    }

    // Backend tomonidan kelgan o'zbek tilidagi xabar (detail field)
    const backendDetail = error.response?.data?.detail
    if (backendDetail) {
      return Promise.reject(new Error(backendDetail))
    }
    // Backend message field
    const backendMessage = error.response?.data?.message
    if (backendMessage) {
      return Promise.reject(new Error(backendMessage))
    }
    // Status kodiga qarab xabar
    if (status && STATUS_MESSAGES[status]) {
      return Promise.reject(new Error(STATUS_MESSAGES[status]))
    }
    // Network xatosi (retry ham muvaffaqiyatsiz bo'lsa)
    if (!error.response) {
      return Promise.reject(new Error("Internet aloqasi yo'q yoki server ishlamayapti."))
    }
    return Promise.reject(new Error("Noma'lum xatolik yuz berdi. Qayta urinib ko'ring."))
  },
)
