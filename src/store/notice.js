import { defineStore } from 'pinia'
import { unreadCount } from '../api/notice'
import { mockNotices } from '../utils/mock'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    unread: 0,
  }),
  actions: {
    async refreshUnread() {
      try {
        const data = await unreadCount()
        this.unread = Number(data?.count ?? data ?? 0)
      } catch {
        this.unread = mockNotices.filter((item) => !item.readFlag).length
      }
    },
  },
})
