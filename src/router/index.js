import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/user/Home.vue'), meta: { layout: 'user', title: '首页' } },
  { path: '/lost', name: 'lost', component: () => import('../views/user/ItemHall.vue'), props: { itemType: 'LOST' }, meta: { layout: 'user', title: '失物大厅' } },
  { path: '/found', name: 'found', component: () => import('../views/user/ItemHall.vue'), props: { itemType: 'FOUND' }, meta: { layout: 'user', title: '拾物大厅' } },
  { path: '/item/:id', name: 'item-detail', component: () => import('../views/user/ItemDetail.vue'), meta: { layout: 'user', title: '物品详情' } },
  { path: '/publish', name: 'publish', component: () => import('../views/user/Publish.vue'), meta: { layout: 'user', title: '发布信息', requiresAuth: true } },
  { path: '/my/items', name: 'my-items', component: () => import('../views/user/MyItems.vue'), meta: { layout: 'user', title: '我的发布', requiresAuth: true } },
  { path: '/my/claims', name: 'my-claims', component: () => import('../views/user/MyClaims.vue'), meta: { layout: 'user', title: '我的认领', requiresAuth: true } },
  { path: '/my/handovers', name: 'my-handovers', component: () => import('../views/user/MyHandovers.vue'), meta: { layout: 'user', title: '我的预约', requiresAuth: true } },
  { path: '/my/notices', name: 'my-notices', component: () => import('../views/user/MyNotices.vue'), meta: { layout: 'user', title: '消息通知', requiresAuth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/user/Profile.vue'), meta: { layout: 'user', title: '个人资料', requiresAuth: true } },
  { path: '/login', name: 'login', component: () => import('../views/auth/Login.vue'), meta: { layout: 'auth', title: '登录' } },
  { path: '/register', name: 'register', component: () => import('../views/auth/Register.vue'), meta: { layout: 'auth', title: '注册' } },
  { path: '/403', name: 'forbidden', component: () => import('../views/error/Forbidden.vue'), meta: { layout: 'plain', title: '无权限' } },
  { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { layout: 'admin', title: '数据看板', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/items/review', name: 'admin-items-review', component: () => import('../views/admin/ItemReview.vue'), meta: { layout: 'admin', title: '物品审核', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/claims/review', name: 'admin-claims-review', component: () => import('../views/admin/ClaimReview.vue'), meta: { layout: 'admin', title: '认领审核', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/handovers', name: 'admin-handovers', component: () => import('../views/admin/HandoverManage.vue'), meta: { layout: 'admin', title: '交接管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users', name: 'admin-users', component: () => import('../views/admin/UserManage.vue'), meta: { layout: 'admin', title: '用户管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/categories', name: 'admin-categories', component: () => import('../views/admin/CategoryManage.vue'), meta: { layout: 'admin', title: '分类管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/expired', name: 'admin-expired', component: () => import('../views/admin/ExpiredManage.vue'), meta: { layout: 'admin', title: '过期管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/statistics', name: 'admin-statistics', component: () => import('../views/admin/Statistics.vue'), meta: { layout: 'admin', title: '统计分析', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/logs', name: 'admin-logs', component: () => import('../views/admin/OperationLog.vue'), meta: { layout: 'admin', title: '操作日志', requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/error/NotFound.vue'), meta: { layout: 'plain', title: '页面不存在' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  document.title = `${to.meta.title || '校园失物招领'} - 拾光校园`
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (userStore.token && !userStore.profile) {
    await userStore.fetchProfile().catch(() => userStore.logout())
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) return '/403'
  return true
})

export default router
