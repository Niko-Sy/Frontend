import request from '../utils/request'

export const listAdminItems = (params) => request.get('/api/admin/items', { params })
export const listPendingItems = (params) => request.get('/api/admin/items/pending', { params })
export const getAdminItem = (id) => request.get(`/api/admin/items/${id}`)
export const getSimilarAdminItems = (id) => request.get(`/api/admin/items/${id}/similar`)
export const approveItem = (id, data = {}) => request.post(`/api/admin/items/${id}/approve`, data)
export const batchApproveItems = (ids) => request.post('/api/admin/items/batch/approve', { ids })
export const rejectItem = (id, data) => request.post(`/api/admin/items/${id}/reject`, data)
export const adminRemoveItem = (id, data) => request.post(`/api/admin/items/${id}/remove`, data)
export const batchRemoveItems = (ids, data = {}) => request.post('/api/admin/items/batch/remove', { ids, ...data })
