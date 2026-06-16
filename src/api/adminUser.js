import request from '../utils/request'

export const listAdminUsers = (params) => request.get('/api/admin/users', { params })
export const getAdminUser = (id) => request.get(`/api/admin/users/${id}`)
export const listUserItems = (id, params) => request.get(`/api/admin/users/${id}/items`, { params })
export const listUserClaims = (id, params) => request.get(`/api/admin/users/${id}/claims`, { params })
export const enableUser = (id) => request.post(`/api/admin/users/${id}/enable`)
export const disableUser = (id, data = {}) => request.post(`/api/admin/users/${id}/disable`, data)
export const updateUserRole = (id, data) => request.post(`/api/admin/users/${id}/role/update`, data)
export const resetUserPassword = (id, data = {}) => request.post(`/api/admin/users/${id}/password/reset`, data)
