<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UserLayout from './layouts/UserLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import PlainLayout from './layouts/PlainLayout.vue'
import { useAppStore } from './store/app'

const route = useRoute()
const appStore = useAppStore()
const layouts = {
  user: UserLayout,
  admin: AdminLayout,
  auth: AuthLayout,
  plain: PlainLayout,
}
const activeLayout = computed(() => layouts[route.meta.layout] || UserLayout)

onMounted(() => appStore.initTheme())
</script>

<template>
  <component :is="activeLayout">
    <RouterView />
  </component>
</template>
