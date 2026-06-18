import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const adminService = {
  users: (params) => httpClient.get(endpoints.users.base, { params }),
  updateUser: (id, payload) => httpClient.put(endpoints.users.detail(id), payload),
  auditLogs: (params) => httpClient.get(endpoints.audit.logs, { params }),
  updateSystemSettings: (payload) => httpClient.put(endpoints.settings.system, payload),
}
