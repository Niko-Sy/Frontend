import request from '../utils/request'

export const listNotices = (params) => request.get('/api/notices', { params })
export const unreadCount = () => request.get('/api/notices/unread-count')
export const readNotice = (id) => request.post(`/api/notices/${id}/read`)
export const readAllNotices = () => request.post('/api/notices/read-all')
export const deleteNotice = (id) => request.post(`/api/notices/${id}/delete`)
