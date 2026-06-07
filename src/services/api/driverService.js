import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const driverService = {
  list: (params) => httpClient.get(endpoints.drivers.base, { params }),
  create: (payload) => httpClient.post(endpoints.drivers.base, payload),
  update: (id, payload) => httpClient.put(`${endpoints.drivers.base}/${id}`, payload),
  requests: (params) => httpClient.get(endpoints.drivers.requests, { params }),
  approve: (id) => httpClient.post(endpoints.drivers.approve(id)),
  reject: (id, payload) => httpClient.post(endpoints.drivers.reject(id), payload),
  locations: () => httpClient.get(endpoints.drivers.locations),
}
