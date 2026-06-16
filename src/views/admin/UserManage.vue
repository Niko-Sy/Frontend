<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatsGrid from '../../components/common/StatsGrid.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import { disableUser, enableUser, listAdminUsers, resetUserPassword, updateUserRole } from '../../api/adminUser'
import { mockUsers } from '../../utils/mock'
import { formatDate } from '../../utils/format'

const users = ref([])
const keyword = ref('')
const roleFilter = ref('')

const filteredUsers = computed(() =>
  users.value.filter((user) => {
    const keywordHit = !keyword.value || `${user.username}${user.nickname}${user.phone}`.includes(keyword.value)
    const roleHit = !roleFilter.value || user.role === roleFilter.value
    return keywordHit && roleHit
  }),
)

const stats = computed(() => [
  { label: '总用户', value: users.value.length, icon: 'User', tone: 'primary' },
  { label: '管理员', value: users.value.filter((user) => user.role === 'ADMIN').length, icon: 'Avatar', tone: 'purple' },
  { label: '启用账号', value: users.value.filter((user) => user.status).length, icon: 'CircleCheck', tone: 'success' },
  { label: '禁用账号', value: users.value.filter((user) => !user.status).length, icon: 'Warning', tone: 'warning' },
])

const load = async () => {
  try {
    const data = await listAdminUsers()
    users.value = data.records || data || []
  } catch {
    users.value = mockUsers
  }
}

const toggle = async (row) => {
  try {
    if (row.status) {
      const { value } = await ElMessageBox.prompt('请输入禁用原因', '禁用用户')
      await disableUser(row.id, { reason: value })
    } else {
      await enableUser(row.id)
    }
    ElMessage.success('操作成功')
    load()
  } catch (e) {
    if (e.message) ElMessage.error(e.message)
  }
}

const role = async (row) => {
  try {
    await updateUserRole(row.id, { role: row.role === 'ADMIN' ? 'USER' : 'ADMIN' })
    ElMessage.success('角色已更新')
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

const reset = async (row) => {
  try {
    await resetUserPassword(row.id, { newPassword: '123456' })
    ElMessage.success('已重置为 123456')
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="eyebrow">Accounts</span>
        <h1>用户管理</h1>
        <p>维护用户状态、角色和账号安全。</p>
      </div>
    </div>
    <StatsGrid :items="stats" />
    <section class="filter-panel">
      <el-input v-model="keyword" placeholder="用户名 / 手机号" clearable />
      <el-select v-model="roleFilter" placeholder="角色" clearable>
        <el-option label="用户" value="USER" />
        <el-option label="管理员" value="ADMIN" />
      </el-select>
      <el-button type="primary">搜索</el-button>
    </section>
    <section class="premium-table-shell">
      <el-table :data="filteredUsers">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" />
        <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" kind="user" /></template></el-table-column>
        <el-table-column label="注册时间" min-width="160"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button link type="primary" @click="role(row)">改角色</el-button>
            <el-button link @click="reset(row)">重置密码</el-button>
            <el-button link :type="row.status ? 'danger' : 'success'" @click="toggle(row)">{{ row.status ? '禁用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>
