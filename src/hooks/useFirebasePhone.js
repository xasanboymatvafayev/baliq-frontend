import { useState, useCallback, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { firebaseAuth } from '../services/firebase.js'

/**
 * Firebase Phone Auth hook
 * Returns: { sendSms, confirmCode, status, error, clearError }
 * status: idle | sending | code_sent | confirming | done | error
 */
export function useFirebasePhone() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const confirmRef = useRef(null)
  const recaptchaRef = useRef(null)

  const clearError = () => setError('')

  const initRecaptcha = useCallback((containerId = 'recaptcha-container') => {
    if (recaptchaRef.current) return
    recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        recaptchaRef.current = null
      },
    })
  }, [])

  /**
   * sendSms(phone: string, containerId?: string)
   * phone format: +998901234567
   */
  const sendSms = useCallback(async (phone, containerId = 'recaptcha-container') => {
    setStatus('sending')
    setError('')
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, containerId, {
          size: 'invisible',
          callback: () => {},
        })
      }
      const result = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaRef.current)
      confirmRef.current = result
      setStatus('code_sent')
      return true
    } catch (err) {
      recaptchaRef.current = null
      const MSGS = {
        'auth/invalid-phone-number': "Telefon raqam noto'g'ri. Masalan: +998901234567",
        'auth/too-many-requests': 'Juda ko\'p urinish. Keyinroq qayta urinib ko\'ring.',
        'auth/quota-exceeded': 'Firebase SMS limiti tugadi.',
        'auth/captcha-check-failed': 'reCAPTCHA xatoligi. Sahifani yangilang.',
        'auth/network-request-failed': 'Internet aloqasi yo\'q.',
        'auth/invalid-app-credential': 'Firebase konfiguratsiyasi noto\'g\'ri.',
      }
      const msg = MSGS[err.code] || err.message || 'SMS yuborishda xato'
      setError(msg)
      setStatus('error')
      return false
    }
  }, [])

  /**
   * confirmCode(code: string) → { idToken, phone }
   */
  const confirmCode = useCallback(async (code) => {
    if (!confirmRef.current) {
      setError('Avval SMS yuboring')
      setStatus('error')
      return null
    }
    setStatus('confirming')
    setError('')
    try {
      const result = await confirmRef.current.confirm(code)
      const idToken = await result.user.getIdToken()
      const phone = result.user.phoneNumber
      setStatus('done')
      return { idToken, phone }
    } catch (err) {
      const MSGS = {
        'auth/invalid-verification-code': "Kod noto'g'ri. Qayta tekshiring.",
        'auth/code-expired': 'Kod muddati tugadi. SMS ni qayta yuboring.',
        'auth/session-expired': 'Sessiya tugadi. SMS ni qayta yuboring.',
      }
      const msg = MSGS[err.code] || "Kod noto'g'ri"
      setError(msg)
      setStatus('code_sent')
      return null
    }
  }, [])

  return { sendSms, confirmCode, initRecaptcha, status, error, clearError }
}
