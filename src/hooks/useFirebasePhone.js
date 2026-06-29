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
  "auth/operation-not-allowed": "SMS autentifikatsiya yoqilmagan. Admin bilan bog'laning.",
  "auth/invalid-verification-code": "Kiritilgan kod noto'g'ri.",
  "auth/code-expired": "Kod muddati tugagan. Qayta SMS so'rang.",
  "auth/error-code:-39": "Firebase xizmati vaqtincha ishlamayapti. Sahifani yangilang va qayta urinib ko'ring.",
};

function friendlyError(err) {
  const code = err?.code || "";
  return ERROR_MESSAGES[code] || err?.message || "Noma'lum xato. Qayta urinib ko'ring.";
}

let globalContainer = null;

function ensureRecaptchaContainer() {
  if (globalContainer && document.body.contains(globalContainer)) {
    return globalContainer;
  }
  const existing = document.getElementById("firebase-recaptcha-global");
  if (existing) { globalContainer = existing; return existing; }
  const div = document.createElement("div");
  div.id = "firebase-recaptcha-global";
  div.style.cssText = "position:fixed;bottom:0;right:0;z-index:9999;";
  document.body.appendChild(div);
  globalContainer = div;
  return div;
}

function destroyVerifier(ref) {
  try { ref.current?.clear(); } catch (_) {}
  ref.current = null;
}

export function useFirebasePhone() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const confirmRef = useRef(null);
  const verifierRef = useRef(null);

  const clearError = () => setError("");

  useEffect(() => {
    return () => { destroyVerifier(verifierRef); };
  }, []);

  const sendSms = useCallback(async (phone) => {
    setStatus("sending");
    setError("");

    destroyVerifier(verifierRef);

    try {
      const container = ensureRecaptchaContainer();

      const verifier = new RecaptchaVerifier(firebaseAuth, container, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => { destroyVerifier(verifierRef); },
      });

      verifierRef.current = verifier;
      await verifier.render();

      const confirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
      confirmRef.current = confirmation;

      setStatus("code_sent");
      return true;
    } catch (err) {
      console.error("[Firebase SMS error]", err);
      destroyVerifier(verifierRef);
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
      destroyVerifier(verifierRef);

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
