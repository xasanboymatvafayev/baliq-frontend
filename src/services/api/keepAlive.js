const PING_INTERVAL = 14 * 60 * 1000
const HEALTH_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/health'

let intervalId = null

async function ping() {
  try {
    await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' })
  } catch {
    // Silent — bu faqat serverni uyg'otib turish uchun
  }
}

export function startKeepAlive() {
  if (intervalId !== null) return
  ping()
  intervalId = setInterval(ping, PING_INTERVAL)
}

export function stopKeepAlive() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}
