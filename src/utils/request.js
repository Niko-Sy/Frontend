import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

const cleanParams = (params) => {
  if (!params || typeof params !== 'object') return params
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('lostlink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.params = cleanParams(config.params)
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (typeof payload === 'string') {
      return Promise.reject(new Error('接口未连接'))
    }
    if (payload && typeof payload === 'object' && 'code' in payload) {
      if (Number(payload.code) === 200) return payload.data
      const message = payload.message || '请求失败'
      return Promise.reject(new Error(message))
    }
    return payload
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('lostlink_token')
      localStorage.removeItem('lostlink_user')
      ElMessage.warning('登录已过期，请重新登录')
      if (location.pathname !== '/login') {
        location.href = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
      }
    }
    const message = error.response?.data?.message || error.message || '网络请求失败'
    return Promise.reject(new Error(message))
  },
)

export default request
