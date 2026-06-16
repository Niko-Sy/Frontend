export const formatDate = (value) => {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

export const maskContact = (value) => {
  if (!value) return '登录后查看'
  const text = String(value)
  if (text.includes('@')) return text.replace(/^(.{2}).*(@.*)$/, '$1***$2')
  if (text.length >= 7) return text.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
  return `${text.slice(0, 2)}***`
}

export const daysLeft = (expireTime) => {
  if (!expireTime) return '-'
  const end = new Date(String(expireTime).replace(/-/g, '/')).getTime()
  if (Number.isNaN(end)) return '-'
  const diff = Math.ceil((end - Date.now()) / 86400000)
  if (diff < 0) return '已过期'
  if (diff === 0) return '今日到期'
  return `${diff} 天后过期`
}

export const normalizePage = (data, fallback = []) => {
  if (!data) return { total: fallback.length, records: fallback, pageNum: 1, pageSize: fallback.length }
  if (Array.isArray(data)) return { total: data.length, records: data, pageNum: 1, pageSize: data.length }
  return {
    total: data.total ?? data.records?.length ?? fallback.length,
    records: data.records ?? fallback,
    pageNum: data.pageNum ?? 1,
    pageSize: data.pageSize ?? 10,
  }
}

export const imageUrl = (url) => {
  if (!url) return ''
  if (/^(https?:|blob:|data:)/.test(url)) return url
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return `${base}${url}`
}
