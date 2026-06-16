<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import StatsGrid from '../../components/common/StatsGrid.vue'
import { updatePassword, updateProfile } from '../../api/auth'
import { useUserStore } from '../../store/user'
import { emailPattern, phonePattern } from '../../utils/validate'

const router = useRouter()
const userStore = useUserStore()
const editOpen = ref(false)
const passwordOpen = ref(false)
const profileForm = reactive({ nickname: '', phone: '', email: '', avatar: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const stats = computed(() => [
  { label: '发布数量', value: 4, icon: 'DocumentAdd', tone: 'primary', to: '/my/items', hint: '查看我的发布' },
  { label: '认领申请', value: 2, icon: 'Checked', tone: 'purple', to: '/my/claims', hint: '跟进申请状态' },
  { label: '成功找回', value: 1, icon: 'CircleCheck', tone: 'success', to: '/my/handovers', hint: '已闭环记录' },
  { label: '待处理', value: 3, icon: 'Bell', tone: 'warning', to: '/my/notices', hint: '查看提醒消息' },
])

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
  <PageContainer no-header compact>
    <section class="profile-grid">
      <el-card shadow="never" class="profile-card identity-card">
        <el-avatar :size="86">{{ userStore.profile?.nickname?.slice(0, 1) || '我' }}</el-avatar>
        <h2>{{ userStore.profile?.nickname || '未设置昵称' }}</h2>
        <p>{{ userStore.profile?.username }} · {{ userStore.profile?.role === 'ADMIN' ? '管理员' : '普通用户' }}</p>
        <dl class="detail-list">
          <dt>手机号</dt><dd>{{ userStore.profile?.phone || '-' }}</dd>
          <dt>邮箱</dt><dd>{{ userStore.profile?.email || '-' }}</dd>
          <dt>最近登录</dt><dd>{{ userStore.profile?.lastLoginTime || '-' }}</dd>
        </dl>
        <div class="action-row">
          <el-button type="primary" @click="openEdit">编辑资料</el-button>
          <el-button @click="passwordOpen = true">修改密码</el-button>
          <el-button type="danger" plain @click="userStore.logout().then(() => router.push('/'))">退出登录</el-button>
        </div>
      </el-card>
      <StatsGrid :items="stats" />
    </section>

    <el-dialog v-model="editOpen" title="编辑资料" width="520px">
      <el-form label-position="top">
        <el-form-item label="昵称"><el-input v-model="profileForm.nickname" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="profileForm.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="profileForm.email" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordOpen" title="修改密码" width="520px">
      <el-form label-position="top">
        <el-form-item label="原密码"><el-input v-model="passwordForm.oldPassword" type="password" show-password /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="passwordForm.newPassword" type="password" show-password /></el-form-item>
        <el-form-item label="确认新密码"><el-input v-model="passwordForm.confirmPassword" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordOpen = false">取消</el-button>
        <el-button type="primary" @click="savePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
