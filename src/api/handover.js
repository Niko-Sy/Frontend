import request from '../utils/request'
import { toAppointmentPayload } from '../utils/normalize'

export const listMyHandovers = (params) => request.get('/api/my/handovers', { params })
export const getHandover = (id) => request.get(`/api/handovers/${id}`)
export const updateAppointment = (id, data) => request.post(`/api/handovers/${id}/appointment/update`, toAppointmentPayload(data))
export const confirmHandover = (id) => request.post(`/api/handovers/${id}/confirm`)
export const completeHandover = (id, data) => request.post(`/api/handovers/${id}/complete`, data)
export const cancelHandover = (id, data = {}) => request.post(`/api/handovers/${id}/cancel`, data)
