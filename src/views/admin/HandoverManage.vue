<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '../../components/common/StatusTag.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { adminCompleteHandover, listAdminHandovers, updateHandoverRemark } from '../../api/adminHandover'
import { mockHandovers } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizeHandover, normalizeHandovers } from '../../utils/normalize'

const records = ref([])
const loading = ref(false)
const active = ref(null)
const drawer = ref(false)
const remark = ref('')

const load = async () => {
  loading.value = true
  try {
    records.value = normalizeHandovers(await listAdminHandovers()).records
  } catch (error) {
    records.value = isFallbackableError(error) ? mockHandovers.map(normalizeHandover) : []
  } finally {
    loading.value = false
  }
}

const open = (row) => {
  active.value = normalizeHandover(row)
  remark.value = row.remark || ''
  drawer.value = true
}

const complete = async () => {
  await ElMessageBox.confirm('确认将该交接记录标记为完成？', '二次确认', { type: 'warning' })
  try {
    await adminCompleteHandover(active.value.id, { handoverCode: active.value.handoverCode })
    ElMessage.success('交接已完成')
    drawer.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const saveRemark = async () => {
  try {
    await updateHandoverRemark(active.value.id, { remark: remark.value })
    ElMessage.success('备注已保存')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <h1>交接管理</h1>
      <p>跟进预约、交接码和线下完成状态。</p>
    </div>
    <el-table v-loading="loading" :data="records" @row-click="open">
      <el-table-column prop="itemTitle" label="物品名称" min-width="180" />
      <el-table-column prop="applicantName" label="申请人" width="110" />
      <el-table-column prop="publisherName" label="发布人" width="110" />
      <el-table-column label="预约时间" width="160"><template #default="{ row }">{{ formatDate(row.appointmentTime) }}</template></el-table-column>
      <el-table-column label="地点" min-width="160"><template #default="{ row }">{{ row.appointmentLocation || '-' }}</template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><StatusTag :status="row.status" kind="handover" /></template></el-table-column>
      <el-table-column label="操作" width="120"><template #default="{ row }"><el-button link type="primary" @click.stop="open(row)">详情</el-button></template></el-table-column>
    </el-table>
    <EmptyState v-if="!loading && !records.length" title="暂无交接记录" />
    <el-drawer v-model="drawer" title="交接详情" size="480px">
      <template v-if="active">
        <h3>{{ active.itemTitle }}</h3>
        <p>预约时间：{{ formatDate(active.appointmentTime) }}</p>
        <p>预约地点：{{ active.appointmentLocation || '待设置' }}</p>
        <p>交接码：{{ active.handoverCode }}</p>
        <el-input v-model="remark" type="textarea" :rows="4" placeholder="交接备注" />
      </template>
      <template #footer>
        <el-button @click="saveRemark">保存备注</el-button>
        <el-button type="primary" @click="complete">确认完成</el-button>
      </template>
    </el-drawer>
  </section>
</template>
