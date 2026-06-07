export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    checkTelegram: '/auth/check-telegram',
  },
  farms: {
    base: '/farms',
    requests: '/farms/requests',
    approve: (id) => `/farms/${id}/approve`,
    reject: (id) => `/farms/${id}/reject`,
  },
  drivers: {
    base: '/drivers',
    requests: '/drivers/requests',
    approve: (id) => `/drivers/${id}/approve`,
    reject: (id) => `/drivers/${id}/reject`,
    locations: '/drivers/locations',
  },
  fish: {
    base: '/fish',
    detail: (id) => `/fish/${id}`,
  },
  orders: {
    base: '/orders',
    detail: (id) => `/orders/${id}`,
    timeline: (id) => `/orders/${id}/timeline`,
    assignDriver: (id) => `/orders/${id}/assign-driver`,
  },
  chat: {
    rooms: '/chat/rooms',
    messages: (roomId) => `/chat/rooms/${roomId}/messages`,
    upload: '/chat/upload',
  },
  users: {
    base: '/users',
    detail: (id) => `/users/${id}`,
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    sales: '/analytics/sales',
    kpi: '/analytics/kpi',
    system: '/analytics/system',
  },
  audit: {
    logs: '/audit/logs',
  },
  settings: {
    profile: '/settings/profile',
    system: '/settings/system',
  },
  files: {
    upload: '/files/upload',
  },
}
