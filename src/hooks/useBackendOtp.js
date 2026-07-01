import { useState, useCallback, useRef } from "react";
import { httpClient } from "../services/api/httpClient.js";

// Firebase/reCAPTCHA ishlatilmaydi - to'g'ridan-to'g'ri backend OTP
export function useBackendOtp() {
  const [status, setStatus]   = useState("idle");
  const [error, setError]     = useState("");
  const [botLink, setBotLink] = useState(null);
  const phoneRef = useRef(null);

  const clearError = () => { setError(""); setBotLink(null); };

  const sendSms = useCallback(async (phone) => {
    setStatus("sending");
    setError("");
    setBotLink(null);
    phoneRef.current = phone;
    try {
      const res = await httpClient.post("/auth/send-otp-backend", { phone });
      if (res?.sent_via === "none") {
        setStatus("error");
        setError("OTP yuborib bo'lmadi. Telegram botni ulang va qayta urinib ko'ring.");
        setBotLink(res?.bot_link || null);
        return false;
      }
      setStatus("code_sent");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err?.message || "OTP yuborishda xato.");
      return false;
    }
  }, []);

  const confirmCode = useCallback(async (code) => {
    const phone = phoneRef.current;
    if (!phone) {
      setError("Telefon raqam yo'q. Qayta SMS so'rang.");
      return null;
    }
    setStatus("confirming");
    try {
      const res = await httpClient.post("/auth/verify-otp-backend", { phone, code });
      // idToken yo'q — backend to'g'ridan-to'g'ri custom_token qaytaradi
      // FirebaseOtpPage.jsx da signInWithCustomToken chaqiriladi
      setStatus("done");
      return { custom_token: res?.custom_token, phone };
    } catch (err) {
      setStatus("code_sent");
      setError(err?.message || "Noto'g'ri kod.");
      return null;
    }
  }, []);

  return { sendSms, confirmCode, status, error, botLink, clearError };
}
