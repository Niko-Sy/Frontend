import request from '../utils/request'

export const listMyClaims = (params) => request.get('/api/my/claims', { params })
export const getClaim = (id) => request.get(`/api/claims/${id}`)
export const createClaim = (itemId, data) => request.post(`/api/items/${itemId}/claims`, data)
export const supplementClaim = (id, data) => request.post(`/api/claims/${id}/supplement`, data)
export const cancelClaim = (id) => request.post(`/api/claims/${id}/cancel`)
