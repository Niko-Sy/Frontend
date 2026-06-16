<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '../../components/common/StatusTag.vue'
import { disableUser, enableUser, listAdminUsers, resetUserPassword, updateUserRole } from '../../api/adminUser'
import { mockUsers } from '../../utils/mock'
import { formatDate } from '../../utils/format'

const users = ref([])
const load = async () => { try { const data = await listAdminUsers(); users.value = data.records || data || [] } catch { users.value = mockUsers } }
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
  } catch (e) { if (e.message) ElMessage.error(e.message) }
}
const role = async (row) => { try { await updateUserRole(row.id, { role: row.role === 'ADMIN' ? 'USER' : 'ADMIN' }); ElMessage.success('角色已更新'); load() } catch (e) { ElMessage.error(e.message) } }
const reset = async (row) => { try { await resetUserPassword(row.id, { newPassword: '123456' }); ElMessage.success('已重置为 123456') } catch (e) { ElMessage.error(e.message) } }
onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>用户管理</h1><p>维护用户状态、角色和账号安全</p></div>
    <section class="filter-panel"><el-input placeholder="用户名 / 手机号" /><el-select placeholder="角色"><el-option label="用户" value="USER" /><el-option label="管理员" value="ADMIN" /></el-select><el-button type="primary">搜索</el-button></section>
    <el-table :data="users">
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
</template>
