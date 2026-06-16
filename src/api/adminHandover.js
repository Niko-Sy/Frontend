import request from '../utils/request'

export const listAdminHandovers = (params) => request.get('/api/admin/handovers', { params })
export const getAdminHandover = (id) => request.get(`/api/admin/handovers/${id}`)
export const adminConfirmHandover = (id) => request.post(`/api/admin/handovers/${id}/confirm`)
export const adminCompleteHandover = (id, data) => request.post(`/api/admin/handovers/${id}/complete`, data)
export const adminCancelHandover = (id, data) => request.post(`/api/admin/handovers/${id}/cancel`, data)
export const updateHandoverRemark = (id, data) => request.post(`/api/admin/handovers/${id}/remark/update`, data)
