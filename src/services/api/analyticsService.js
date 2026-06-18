import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const analyticsService = {
  dashboard: (params) => httpClient.get(endpoints.analytics.dashboard, { params }),
  sales: (params) => httpClient.get(endpoints.analytics.sales, { params }),
  kpi: (params) => httpClient.get(endpoints.analytics.kpi, { params }),
  system: () => httpClient.get(endpoints.analytics.system),
}
