<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '../../api/auth'
import { emailPattern, phonePattern } from '../../utils/validate'

const router = useRouter()
const loading = reactive({ submit: false })
const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const passwordStrength = computed(() => {
  let score = 0
  if (form.password.length >= 6) score += 1
  if (/[A-Z]/.test(form.password) || /\d/.test(form.password)) score += 1
  if (/[^A-Za-z0-9]/.test(form.password)) score += 1
  return ['弱', '中', '强'][Math.max(score - 1, 0)] || '弱'
})

const validate = () => {
  if (!/^\w{4,20}$/.test(form.username)) return '用户名需为 4-20 位字母、数字或下划线'
  if (form.nickname.trim().length < 2 || form.nickname.trim().length > 20) return '昵称需为 2-20 个字符'
  if (!phonePattern.test(form.phone)) return '手机号格式不正确'
  if (!emailPattern.test(form.email)) return '邮箱格式不正确'
  if (form.password.length < 6 || form.password.length > 20) return '密码需为 6-20 位'
  if (form.password !== form.confirmPassword) return '两次密码不一致'
  return ''
}

const submit = async () => {
  const error = validate()
  if (error) return ElMessage.warning(error)
  loading.submit = true
  try {
    await register(form)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.submit = false
  }
}
</script>

<template>
  <section class="auth-page">
    <RouterLink class="back-home" to="/">返回首页</RouterLink>
    <div class="auth-visual">
      <span class="brand-mark">拾</span>
      <h1>创建校园互助账号</h1>
      <p>用清晰的联系方式和可信资料，让招领流程更顺畅。</p>
    </div>
    <el-card class="auth-card" shadow="never">
      <h2>注册账号</h2>
      <el-form label-position="top">
        <el-form-item label="用户名"><el-input v-model="form.username" size="large" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" size="large" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" size="large" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" size="large" /></el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" show-password />
          <small>密码强度：{{ passwordStrength }}</small>
        </el-form-item>
        <el-form-item label="确认密码"><el-input v-model="form.confirmPassword" size="large" type="password" show-password /></el-form-item>
        <el-button class="full-button" type="primary" size="large" :loading="loading.submit" @click="submit">注册</el-button>
        <p class="auth-link">已有账号？<RouterLink to="/login">去登录</RouterLink></p>
      </el-form>
    </el-card>
  </section>
</template>
