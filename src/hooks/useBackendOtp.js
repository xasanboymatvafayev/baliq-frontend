import { useState, useCallback, useRef } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { firebaseAuth } from "../services/firebase.js";
import { httpClient } from "../services/api/httpClient.js";

export function useBackendOtp() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
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
      const data = res.data;

      if (data?.sent_via === "none") {
        setStatus("error");
        setError("OTP yuborib bo'lmadi. Telegram botni ulang va qayta urinib ko'ring.");
        setBotLink(data?.bot_link || null);
        return false;
      }

      setStatus("code_sent");
      return true;
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.detail ||
        "OTP yuborishda xato. Telegram botni ulang va qayta urinib ko'ring."
      );
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
      let idToken = null;
      if (res.data?.custom_token) {
        try {
          const cred = await signInWithCustomToken(firebaseAuth, res.data.custom_token);
          idToken = await cred.user.getIdToken();
        } catch (fbErr) {
          console.warn("[BackendOtp] signInWithCustomToken xato:", fbErr?.code);
        }
      }
      setStatus("done");
      return { idToken, phone };
    } catch (err) {
      setStatus("code_sent");
      setError(err?.response?.data?.detail || "Noto'g'ri kod. Qayta urinib ko'ring.");
      return null;
    }
  }, []);

  return { sendSms, confirmCode, status, error, botLink, clearError };
}
