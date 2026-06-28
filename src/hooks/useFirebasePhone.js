import { useState, useCallback, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../services/firebase.js";

export function useFirebasePhone() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const confirmRef = useRef(null);
  const verifierRef = useRef(null);

  const clearError = () => setError("");

  const getVerifier = async () => {
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      await verifierRef.current.render();
    }

    return verifierRef.current;
  };

  const sendSms = useCallback(async (phone) => {
    setStatus("sending");
    setError("");

    try {
      const verifier = await getVerifier();

      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        phone,
        verifier
      );

      confirmRef.current = confirmation;

      setStatus("code_sent");
      return true;
    } catch (err) {
      console.error(err);

      verifierRef.current?.clear();
      verifierRef.current = null;

      setStatus("error");
      setError(err.code || err.message);

      return false;
    }
  }, []);

  const confirmCode = useCallback(async (code) => {
    if (!confirmRef.current) return null;

    setStatus("confirming");

    try {
      const result = await confirmRef.current.confirm(code);

      const idToken = await result.user.getIdToken();

      setStatus("done");

      return {
        idToken,
        phone: result.user.phoneNumber,
      };
    } catch (err) {
      console.error(err);

      setStatus("code_sent");
      setError(err.code || err.message);

      return null;
    }
  }, []);

  return {
    sendSms,
    confirmCode,
    status,
    error,
    clearError,
  };
}
