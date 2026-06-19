/**
 * Telefon raqamni normallashtirish
 * +998901234567, 998901234567, 901234567, 0901234567 → +998901234567
 */
export function normalizePhone(raw) {
  if (!raw) return ''
  // faqat raqamlar qolsin
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length === 12) {
    return '+' + digits
  }
  if (digits.length === 9) {
    return '+998' + digits
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '+998' + digits.slice(1)
  }
  // Boshqa formatlar: + qo'shib qaytaramiz
  return digits.startsWith('998') ? '+' + digits : '+998' + digits.slice(-9)
}

/**
 * Telefon raqamni ko'rsatish uchun formatlash
 * +998901234567 → +998 90 123 45 67
 */
export function formatPhone(phone) {
  const n = normalizePhone(phone)
  if (n.length !== 13) return phone
  return `${n.slice(0, 4)} ${n.slice(4, 6)} ${n.slice(6, 9)} ${n.slice(9, 11)} ${n.slice(11)}`
}
