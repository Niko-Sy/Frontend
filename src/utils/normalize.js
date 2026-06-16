export const isFallbackableError = (error) => {
  const message = error?.message || ''
  return message.includes('接口未连接') || message.includes('Network Error') || message.includes('timeout')
}

export const normalizePageData = (data) => {
  if (!data) return { total: 0, pageNum: 1, pageSize: 10, records: [] }
  if (Array.isArray(data)) return { total: data.length, pageNum: 1, pageSize: data.length || 10, records: data }
  return {
    total: Number(data.total ?? data.records?.length ?? 0),
    pageNum: Number(data.pageNum ?? 1),
    pageSize: Number(data.pageSize ?? 10),
    records: Array.isArray(data.records) ? data.records : [],
  }
}

export const normalizeCategory = (category = {}) => ({
  ...category,
  name: category.name || category.categoryName || '',
  categoryName: category.categoryName || category.name || '',
  sortOrder: category.sortOrder ?? 0,
  itemCount: category.itemCount ?? category.itemTotal ?? 0,
})

export const normalizeCategories = (data) => {
  const page = normalizePageData(data)
  const records = (page.records.length ? page.records : Array.isArray(data) ? data : []).map(normalizeCategory)
  return records
}

export const normalizeHandover = (handover = {}) => ({
  ...handover,
  appointmentTime: handover.appointmentTime || handover.appointTime || '',
  appointmentLocation: handover.appointmentLocation || handover.appointLocation || '',
  appointTime: handover.appointTime || handover.appointmentTime || '',
  appointLocation: handover.appointLocation || handover.appointmentLocation || '',
})

export const normalizeHandovers = (data) => {
  const page = normalizePageData(data)
  return {
    ...page,
    records: page.records.map(normalizeHandover),
  }
}

export const toAppointmentPayload = (appointment = {}) => ({
  appointTime: appointment.appointTime || appointment.appointmentTime || '',
  appointLocation: appointment.appointLocation || appointment.appointmentLocation || '',
})

export const normalizeDashboardSummary = (data = {}) => ({
  totalItems: Number(data.totalItems ?? data.totalItemCount ?? 0),
  todayItems: Number(data.todayItems ?? data.todayNewCount ?? 0),
  pendingItems: Number(data.pendingItems ?? data.pendingItemCount ?? 0),
  availableItems: Number(data.availableItems ?? 0),
  claimingItems: Number(data.claimingItems ?? 0),
  waitHandoverItems: Number(data.waitHandoverItems ?? data.waitHandoverCount ?? 0),
  claimedItems: Number(data.claimedItems ?? data.claimedCount ?? 0),
  expiredItems: Number(data.expiredItems ?? data.expiredCount ?? 0),
  totalUsers: Number(data.totalUsers ?? 0),
  pendingClaims: Number(data.pendingClaims ?? data.pendingClaimCount ?? 0),
  claimSuccessRate: Number(data.claimSuccessRate ?? 0),
})
