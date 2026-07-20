// ─── Pul formatlash ───────────────────────────────────────────────
// 360000 → "360,000 so'm"
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return "0 so'm"
  try {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + " so'm"
  } catch {
    return String(Math.round(Number(value))) + " so'm"
  }
}

// 360000 → "360,000"
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '0'
  try {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
  } catch {
    return String(Math.round(Number(value)))
  }
}

// Sof foydani hisoblash: 12% soliq chegiriladi
// 360000 → { gross: 360000, tax: 43200, net: 316800 }
export function calcFarmRevenue(gross) {
  const g = Number(gross) || 0
  const tax = Math.round(g * 0.12)
  return { gross: g, tax, net: g - tax }
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(value))
}

export function initials(firstName = '', lastName = '') {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase() || 'BS'
}
