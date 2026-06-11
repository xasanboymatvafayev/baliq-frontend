import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const orderService = {
  list: (params) => httpClient.get(endpoints.orders.base, { params }),
  detail: (id) => httpClient.get(endpoints.orders.detail(id)),
  create: (payload) => httpClient.post(endpoints.orders.base, payload),
  updateStatus: (id, payload) => httpClient.patch(endpoints.orders.detail(id), payload),
  timeline: (id) => httpClient.get(endpoints.orders.timeline(id)),
  assignDriver: (id, payload) => httpClient.post(endpoints.orders.assignDriver(id), payload),
  // Ko'p buyurtmani bitta driverga biriktirish
  batchAssignDriver: (payload) => httpClient.post(endpoints.orders.batchAssign, payload),
}
