import { endpoints } from './endpoints.js'
import { httpClient } from './httpClient.js'

export const fishService = {
  list: (params) => httpClient.get(endpoints.fish.base, { params }),
  detail: (id) => httpClient.get(endpoints.fish.detail(id)),
  create: (payload) => httpClient.post(endpoints.fish.base, payload),
  update: (id, payload) => httpClient.put(endpoints.fish.detail(id), payload),
  remove: (id) => httpClient.delete(endpoints.fish.detail(id)),
}
