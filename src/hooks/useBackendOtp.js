import { useState, useCallback, useRef } from "react"
import { httpClient } from "../services/api/httpClient.js"

export function useBackendOtp() {
  const [status, setStatus]   = useState("idle")
  const [error, setError]     = useState("")
  const [botLink, setBotLink] = useState(null)
  const phoneRef = useRef(null)

  const clearError = () => { setError(""); setBotLink(null) }

  const sendSms = useCallback(async (phone) => {
    setStatus("sending"); setError(""); setBotLink(null)
    phoneRef.current = phone
    try {
      const res = await httpClient.post("/auth/send-otp-backend", { phone })
      if (res?.sent_via === "none") {
        setStatus("error")
        setError("OTP yuborib bo'lmadi. Telegram botni ulang.")
        setBotLink(res?.bot_link || null)
        return false
      }
      setStatus("code_sent")
      return true
    } catch (err) {
      setStatus("error")
      setError(err?.message || "OTP yuborishda xato.")
      return false
    }
  }, [])

  const confirmCode = useCallback(async (code) => {
    const phone = phoneRef.current
    if (!phone) { setError("Telefon yo'q. Qayta so'rang."); return null }
    setStatus("confirming")
    try {
      const res = await httpClient.post("/auth/verify-otp-backend", { phone, code })
      setStatus("done")
      return { idToken: null, custom_token: res?.custom_token, phone }
    } catch (err) {
      setStatus("code_sent")
      setError(err?.message || "Noto'g'ri kod.")
      return null
    }
  }, [])

  return { sendSms, confirmCode, status, error, botLink, clearError }
}
