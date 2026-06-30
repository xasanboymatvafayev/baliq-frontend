import { useState, useCallback, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../services/firebase.js";

const ERROR_MESSAGES = {
  "auth/invalid-phone-number": "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)",
  "auth/too-many-requests": "Juda ko'p urinish. Bir oz kuting va qayta urinib ko'ring.",
  "auth/quota-exceeded": "SMS kvota tugadi. Keyinroq urinib ko'ring.",
  "auth/captcha-check-failed": "reCAPTCHA tekshiruvi muvaffaqiyatsiz. Sahifani yangilang.",
  "auth/missing-phone-number": "Telefon raqam kiritilmagan.",
  "auth/user-disabled": "Bu hisob bloklangan.",
  "auth/operation-not-allowed": "SMS autentifikatsiya yoqilmagan.",
  "auth/invalid-verification-code": "Kiritilgan kod noto'g'ri.",
  "auth/code-expired": "Kod muddati tugagan. Qayta SMS so'rang.",
  "auth/error-code:-39": "Firebase xizmati vaqtincha ishlamayapti. Qayta urinib ko'ring.",
  "auth/invalid-recaptcha-token": "reCAPTCHA xatosi. Sahifani yangilang va qayta urinib ko'ring.",
};

function friendlyError(err) {
  const code = err?.code || "";
  return ERROR_MESSAGES[code] || err?.message || "Noma'lum xato. Qayta urinib ko'ring.";
}

// reCAPTCHA container ID — DOM da doimiy turadi
const CONTAINER_ID = "firebase-recaptcha-global";

function ensureContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = CONTAINER_ID;
    // visible "normal" checkbox uchun joy
    el.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:99999;";
    document.body.appendChild(el);
  }
  return el;
}

function clearContainer() {
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.innerHTML = "";
}

export function useFirebasePhone() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const confirmRef = useRef(null);
  const verifierRef = useRef(null);

  const clearError = () => setError("");

  useEffect(() => {
    return () => {
      try { verifierRef.current?.clear(); } catch (_) {}
      clearContainer();
    };
  }, []);

  const sendSms = useCallback(async (phone) => {
    setStatus("sending");
    setError("");

    // Eski verifier ni tozalash
    try { verifierRef.current?.clear(); } catch (_) {}
    verifierRef.current = null;
    clearContainer();
    ensureContainer();

    try {
      const verifier = new RecaptchaVerifier(firebaseAuth, CONTAINER_ID, {
        size: "normal",          // invisible o'rniga normal — Enterprise bilan ishlaydi
        callback: () => {},
        "expired-callback": () => {
          try { verifierRef.current?.clear(); } catch (_) {}
          clearContainer();
          ensureContainer();
        },
      });

      verifierRef.current = verifier;
      await verifier.render();

      const confirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
      confirmRef.current = confirmation;
      clearContainer(); // checkbox ni yashirish
      setStatus("code_sent");
      return true;
    } catch (err) {
      console.error("[Firebase SMS error]", err);
      try { verifierRef.current?.clear(); } catch (_) {}
      clearContainer();
      setStatus("error");
      setError(friendlyError(err));
      return false;
    }
  }, []);

  const confirmCode = useCallback(async (code) => {
    if (!confirmRef.current) {
      setError("SMS sessiyasi yo'q. Qayta SMS so'rang.");
      return null;
    }
    setStatus("confirming");
    try {
      const result = await confirmRef.current.confirm(code);
      const idToken = await result.user.getIdToken();
      setStatus("done");
      return { idToken, phone: result.user.phoneNumber };
    } catch (err) {
      console.error("[Firebase confirm error]", err);
      setStatus("code_sent");
      setError(friendlyError(err));
      return null;
    }
  }, []);

  return { sendSms, confirmCode, status, error, clearError };
}
