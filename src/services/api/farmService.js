import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const farmService = {
  list: (params) => httpClient.get(endpoints.farms.base, { params }),
  detail: (id) => httpClient.get(`${endpoints.farms.base}/${id}`),
  create: (payload) => httpClient.post(endpoints.farms.base, payload),
  update: (id, payload) => httpClient.put(`${endpoints.farms.base}/${id}`, payload),
  remove: (id) => httpClient.delete(`${endpoints.farms.base}/${id}`),
  requests: (params) => httpClient.get(endpoints.farms.requests, { params }),
  approve: (id) => httpClient.post(endpoints.farms.approve(id)),
  reject: (id, payload) => httpClient.post(endpoints.farms.reject(id), payload),
}
