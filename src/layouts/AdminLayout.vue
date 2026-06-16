<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useAppStore } from '../store/app'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const collapsed = ref(false)

const menus = [
  { label: '数据看板', path: '/admin/dashboard', icon: 'DataAnalysis' },
  { label: '物品审核', path: '/admin/items/review', icon: 'Box' },
  { label: '认领审核', path: '/admin/claims/review', icon: 'Checked' },
  { label: '交接管理', path: '/admin/handovers', icon: 'Switch' },
  { label: '用户管理', path: '/admin/users', icon: 'User' },
  { label: '分类管理', path: '/admin/categories', icon: 'Collection' },
  { label: '过期管理', path: '/admin/expired', icon: 'Clock' },
  { label: '统计分析', path: '/admin/statistics', icon: 'TrendCharts' },
  { label: '操作日志', path: '/admin/logs', icon: 'Document' },
]
const themeOptions = [
  { label: '跟随系统', value: 'system', icon: 'Monitor' },
  { label: '浅色模式', value: 'light', icon: 'Sunny' },
  { label: '深色模式', value: 'dark', icon: 'Moon' },
]

const title = computed(() => route.meta.title || '后台管理')
</script>

<template>
  <div class="admin-shell" :class="{ collapsed }">
    <aside class="admin-sidebar">
      <button class="admin-brand" type="button" @click="router.push('/admin/dashboard')">
        <span class="brand-mark">拾</span>
        <span v-if="!collapsed">管理后台</span>
      </button>
      <nav>
        <RouterLink v-for="menu in menus" :key="menu.path" :to="menu.path" :class="{ active: route.path === menu.path }">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span v-if="!collapsed">{{ menu.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <section class="admin-workspace">
      <header class="admin-header">
        <div>
          <el-button circle text @click="collapsed = !collapsed">
            <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
          </el-button>
          <span class="breadcrumb">拾光校园 / {{ title }}</span>
        </div>
        <div class="admin-user">
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
          <el-button text @click="router.push('/')">前台首页</el-button>
          <el-avatar :size="34">{{ userStore.profile?.nickname?.slice(0, 1) || '管' }}</el-avatar>
          <span>{{ userStore.profile?.nickname || '管理员' }}</span>
        </div>
      </header>
      <main class="admin-main">
        <slot />
      </main>
    </section>
  </div>
</template>
