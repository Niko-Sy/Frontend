import request from '../utils/request'

export const listAdminClaims = (params) => request.get('/api/admin/claims', { params })
export const listPendingClaims = (params) => request.get('/api/admin/claims/pending', { params })
export const getAdminClaim = (id) => request.get(`/api/admin/claims/${id}`)
export const listItemClaims = (itemId, params) => request.get(`/api/admin/items/${itemId}/claims`, { params })
export const approveClaim = (id, data = {}) => request.post(`/api/admin/claims/${id}/approve`, data)
export const rejectClaim = (id, data) => request.post(`/api/admin/claims/${id}/reject`, data)
export const needMoreClaim = (id, data) => request.post(`/api/admin/claims/${id}/need-more`, data)
