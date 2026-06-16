import request from '../utils/request'

export const dashboardSummary = () => request.get('/api/admin/dashboard/summary')
export const itemStatusStats = () => request.get('/api/admin/statistics/item-status')
export const categoryStats = () => request.get('/api/admin/statistics/category')
export const monthlyStats = () => request.get('/api/admin/statistics/monthly')
export const userRankStats = () => request.get('/api/admin/statistics/user-rank')
export const claimSuccessRate = () => request.get('/api/admin/statistics/claim-success-rate')
export const expireStats = () => request.get('/api/admin/statistics/expire')
export const recentPending = () => request.get('/api/admin/statistics/recent-pending')
