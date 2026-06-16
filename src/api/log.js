import request from '../utils/request'

export const operationLogs = (params) => request.get('/api/admin/logs/operation', { params })
export const statusLogs = (params) => request.get('/api/admin/logs/status', { params })
export const bizTimeline = (bizType, bizId) => request.get(`/api/admin/logs/status/${bizType}/${bizId}`)
export const itemTimeline = (itemId) => request.get(`/api/admin/logs/status/item/${itemId}`)
export const claimTimeline = (claimId) => request.get(`/api/admin/logs/status/claim/${claimId}`)
export const clearOperationLogs = (beforeTime) => request.post('/api/admin/logs/operation/clear', null, { params: { beforeTime } })
