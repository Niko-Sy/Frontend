import request from '../utils/request'

export const listAdminCategories = (params) => request.get('/api/admin/categories', { params })
export const getAdminCategory = (id) => request.get(`/api/admin/categories/${id}`)
export const createCategory = (data) => request.post('/api/admin/categories', data)
export const updateCategory = (id, data) => request.post(`/api/admin/categories/${id}/update`, data)
export const enableCategory = (id) => request.post(`/api/admin/categories/${id}/enable`)
export const disableCategory = (id) => request.post(`/api/admin/categories/${id}/disable`)
export const deleteCategory = (id) => request.post(`/api/admin/categories/${id}/delete`)
