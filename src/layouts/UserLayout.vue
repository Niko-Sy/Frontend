<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useNoticeStore } from '../store/notice'
import { useAppStore } from '../store/app'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const noticeStore = useNoticeStore()
const appStore = useAppStore()

const navs = [
  { label: '首页', path: '/' },
  { label: '失物大厅', path: '/lost' },
  { label: '拾物大厅', path: '/found' },
  { label: '发布信息', path: '/publish' },
]

const mobileTabs = [
  { label: '首页', path: '/', icon: 'House' },
  { label: '大厅', path: '/found', icon: 'Search' },
  { label: '发布', path: '/publish', icon: 'Plus' },
  { label: '消息', path: '/my/notices', icon: 'Bell' },
  { label: '我的', path: '/profile', icon: 'User' },
]

const themeOptions = [
  { label: '跟随系统', value: 'system', icon: 'Monitor' },
  { label: '浅色模式', value: 'light', icon: 'Sunny' },
  { label: '深色模式', value: 'dark', icon: 'Moon' },
]

const activePath = computed(() => {
  if (route.path.startsWith('/lost')) return '/lost'
  if (route.path.startsWith('/found')) return '/found'
  if (route.path.startsWith('/publish')) return '/publish'
  if (route.path.startsWith('/my/notices')) return '/my/notices'
  if (route.path.startsWith('/profile') || route.path.startsWith('/my/')) return '/profile'
  return route.path
})

onMounted(() => {
  if (userStore.token) noticeStore.refreshUnread()
})

const goLogin = () => router.push({ path: '/login', query: { redirect: route.fullPath } })
</script>

<template>
  <div class="user-shell">
    <header class="site-header">
      <button class="brand" type="button" @click="router.push('/')">
        <span class="brand-mark">拾</span>
        <span>
          <strong>拾光校园</strong>
          <small>LostLink Campus</small>
        </span>
      </button>
      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink v-for="nav in navs" :key="nav.path" :class="{ active: activePath === nav.path }" :to="nav.path">
          {{ nav.label }}
        </RouterLink>
      </nav>
      <div class="header-actions">
        <el-dropdown trigger="click" class="theme-menu" @command="appStore.setThemeMode">
          <button class="icon-action" type="button" :aria-label="`当前主题：${appStore.themeLabel}`">
            <el-icon><Moon v-if="appStore.resolvedTheme === 'dark'" /><Sunny v-else /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="theme in themeOptions" :key="theme.value" :command="theme.value">
                <el-icon><component :is="theme.icon" /></el-icon>
                <span>{{ theme.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <RouterLink class="notice-link" to="/my/notices" aria-label="消息通知">
          <el-badge :value="noticeStore.unread" :hidden="!noticeStore.unread">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </RouterLink>
        <el-dropdown v-if="userStore.profile" trigger="click">
          <button class="avatar-btn" type="button">
            <el-avatar :size="34">{{ userStore.profile.nickname?.slice(0, 1) || '我' }}</el-avatar>
            <span>{{ userStore.profile.nickname }}</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/profile')">个人资料</el-dropdown-item>
              <el-dropdown-item @click="router.push('/my/items')">我的发布</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAdmin" @click="router.push('/admin/dashboard')">管理后台</el-dropdown-item>
              <el-dropdown-item divided @click="userStore.logout().then(() => router.push('/'))">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else type="primary" round @click="goLogin">登录</el-button>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <span>校园失物招领智能互助平台</span>
      <span>发布、查找、认领、交接，一站式完成</span>
      <span>联系校内管理员处理争议与紧急下架</span>
    </footer>

    <nav class="bottom-tabbar" aria-label="移动端导航">
      <RouterLink v-for="tab in mobileTabs" :key="tab.path" :to="tab.path" :class="{ active: activePath === tab.path }" :aria-label="tab.label">
        <el-icon><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
