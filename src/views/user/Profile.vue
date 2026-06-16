<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import { updatePassword, updateProfile } from '../../api/auth'
import { useUserStore } from '../../store/user'
import { emailPattern, phonePattern } from '../../utils/validate'

const router = useRouter()
const userStore = useUserStore()
const editOpen = ref(false)
const passwordOpen = ref(false)
const profileForm = reactive({ nickname: '', phone: '', email: '', avatar: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const openEdit = () => {
  Object.assign(profileForm, userStore.profile || {})
  editOpen.value = true
}

const saveProfile = async () => {
  if (!phonePattern.test(profileForm.phone)) return ElMessage.warning('手机号格式不正确')
  if (!emailPattern.test(profileForm.email)) return ElMessage.warning('邮箱格式不正确')
  try {
    await updateProfile(profileForm)
    userStore.profile = { ...userStore.profile, ...profileForm }
    localStorage.setItem('lostlink_user', JSON.stringify(userStore.profile))
    ElMessage.success('资料已更新')
    editOpen.value = false
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const savePassword = async () => {
  if (passwordForm.newPassword.length < 6) return ElMessage.warning('新密码至少 6 位')
  if (passwordForm.newPassword !== passwordForm.confirmPassword) return ElMessage.warning('两次密码不一致')
  try {
    await updatePassword(passwordForm)
    ElMessage.success('密码已修改，请重新登录')
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <PageContainer title="个人资料" subtitle="维护联系方式与账号安全">
    <section class="profile-grid">
      <el-card shadow="never" class="profile-card">
        <el-avatar :size="86">{{ userStore.profile?.nickname?.slice(0, 1) || '我' }}</el-avatar>
        <h2>{{ userStore.profile?.nickname }}</h2>
        <p>{{ userStore.profile?.username }} · {{ userStore.profile?.role }}</p>
        <dl class="detail-list">
          <dt>手机号</dt><dd>{{ userStore.profile?.phone }}</dd>
          <dt>邮箱</dt><dd>{{ userStore.profile?.email }}</dd>
          <dt>最近登录</dt><dd>{{ userStore.profile?.lastLoginTime || '-' }}</dd>
        </dl>
        <div class="action-row">
          <el-button type="primary" @click="openEdit">编辑资料</el-button>
          <el-button @click="passwordOpen = true">修改密码</el-button>
          <el-button type="danger" plain @click="userStore.logout().then(() => router.push('/'))">退出登录</el-button>
        </div>
      </el-card>
      <section class="stat-grid">
        <article class="mini-stat"><strong>4</strong><span>发布数量</span></article>
        <article class="mini-stat"><strong>2</strong><span>认领申请</span></article>
        <article class="mini-stat"><strong>1</strong><span>成功找回</span></article>
        <article class="mini-stat"><strong>3</strong><span>待处理</span></article>
      </section>
    </section>
    <el-dialog v-model="editOpen" title="编辑资料" width="520px">
      <el-form label-position="top">
        <el-form-item label="昵称"><el-input v-model="profileForm.nickname" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="profileForm.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="profileForm.email" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="editOpen = false">取消</el-button><el-button type="primary" @click="saveProfile">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="passwordOpen" title="修改密码" width="520px">
      <el-form label-position="top">
        <el-form-item label="原密码"><el-input v-model="passwordForm.oldPassword" type="password" show-password /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="passwordForm.newPassword" type="password" show-password /></el-form-item>
        <el-form-item label="确认新密码"><el-input v-model="passwordForm.confirmPassword" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer><el-button @click="passwordOpen = false">取消</el-button><el-button type="primary" @click="savePassword">确认修改</el-button></template>
    </el-dialog>
  </PageContainer>
</template>
