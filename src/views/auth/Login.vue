<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const form = reactive({ username: '', password: '', remember: true })

const submit = async () => {
  if (!form.username.trim()) return ElMessage.warning('用户名不能为空')
  if (!form.password.trim()) return ElMessage.warning('密码不能为空')
  try {
    const user = await userStore.login(form)
    const redirect = route.query.redirect || (user.role === 'ADMIN' ? '/admin/dashboard' : '/')
    router.replace(redirect)
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <section class="auth-page">
    <RouterLink class="back-home" to="/">返回首页</RouterLink>
    <div class="auth-visual">
      <span class="brand-mark">拾</span>
      <h1>让校园遗失物品更快回家</h1>
      <p>发布、查找、认领、交接，一站式完成。演示账号：普通用户 demo / 任意密码，管理员 admin / 任意密码。</p>
      <div class="flow-capsules">
        <span>发布信息</span>
        <span>管理员审核</span>
        <span>在线认领</span>
        <span>预约交接</span>
      </div>
    </div>
    <el-card class="auth-card" shadow="never">
      <h2>登录拾光校园</h2>
      <p>继续管理你的发布、认领和交接进度</p>
      <el-form label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="form.username" size="large" placeholder="请输入用户名" @keyup.enter="submit" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" @keyup.enter="submit" />
        </el-form-item>
        <div class="form-row">
          <el-checkbox v-model="form.remember">记住登录</el-checkbox>
          <RouterLink to="/register">注册账号</RouterLink>
        </div>
        <el-button class="full-button" type="primary" size="large" :loading="userStore.loading" @click="submit">登录</el-button>
      </el-form>
    </el-card>
  </section>
</template>
