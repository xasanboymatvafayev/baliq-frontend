import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiw_A01SqvvuRcEr8YVPWGpF7xk4tRK_M",
  authDomain: "baliq-savdosi-2.firebaseapp.com",
  projectId: "baliq-savdosi-2",
  storageBucket: "baliq-savdosi-2.firebasestorage.app",
  messagingSenderId: "236733214562",
  appId: "1:236733214562:web:23a2a9bc1c6696c28b463b",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
// reCAPTCHA ishlatilmaydi — backend OTP orqali ishlaydi
