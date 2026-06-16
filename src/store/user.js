import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import * as authApi from '../api/auth'
import { mockUsers } from '../utils/mock'

const savedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('lostlink_user') || 'null')
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('lostlink_token') || '',
    profile: savedUser(),
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isAdmin: (state) => state.profile?.role === 'ADMIN',
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.profile = user
      localStorage.setItem('lostlink_token', token)
      localStorage.setItem('lostlink_user', JSON.stringify(user))
    },
    async login(form) {
      this.loading = true
      try {
        const data = await authApi.login(form)
        const token = data?.token || data
        localStorage.setItem('lostlink_token', token)
        this.token = token
        await this.fetchProfile()
        return this.profile
      } catch (error) {
        if (form.username === 'admin' || form.username === 'demo') {
          const user = form.username === 'admin' ? mockUsers[1] : mockUsers[0]
          this.setSession(`mock-${user.role.toLowerCase()}-token`, user)
          ElMessage.info('后端未连接，已进入演示登录')
          return user
        }
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchProfile() {
      if (!this.token) return null
      try {
        const data = await authApi.getMe()
        this.profile = data
        localStorage.setItem('lostlink_user', JSON.stringify(data))
        return data
      } catch (error) {
        if (this.token.startsWith('mock-')) return this.profile
        throw error
      }
    },
    async logout() {
      try {
        if (this.token && !this.token.startsWith('mock-')) await authApi.logout()
      } catch {
        // Local logout should still succeed if the server is unavailable.
      }
      this.token = ''
      this.profile = null
      localStorage.removeItem('lostlink_token')
      localStorage.removeItem('lostlink_user')
    },
  },
})
