<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { completeHandover, listMyHandovers, updateAppointment } from '../../api/handover'
import { mockHandovers } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizeHandover, normalizeHandovers } from '../../utils/normalize'

const loading = ref(false)
const records = ref([])
const showCode = ref({})
const dialogOpen = ref(false)
const active = ref(null)
const appointment = ref({ appointTime: '', appointLocation: '' })

const load = async () => {
  loading.value = true
  try {
    records.value = normalizeHandovers(await listMyHandovers()).records
  } catch (error) {
    records.value = isFallbackableError(error) ? mockHandovers.map(normalizeHandover) : []
  } finally {
    loading.value = false
  }
}

const openAppointment = (item) => {
  active.value = normalizeHandover(item)
  appointment.value = {
    appointTime: active.value.appointTime || active.value.appointmentTime || '',
    appointLocation: active.value.appointLocation || active.value.appointmentLocation || '',
  }
  dialogOpen.value = true
}

const saveAppointment = async () => {
  if (!appointment.value.appointTime || !appointment.value.appointLocation) return ElMessage.warning('请填写预约时间和地点')
  try {
    await updateAppointment(active.value.id, appointment.value)
    ElMessage.success('预约信息已更新')
    dialogOpen.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const complete = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入交接码完成交接', '完成交接')
  try {
    await completeHandover(row.id, { handoverCode: value })
    ElMessage.success('交接已完成')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <PageContainer title="我的预约" subtitle="管理认领通过后的线下交接流程">
    <div v-loading="loading" class="handover-grid">
      <el-card v-for="item in records" :key="item.id" shadow="never" class="handover-card">
        <div class="claim-card-head">
          <h3>{{ item.itemTitle }}</h3>
          <StatusTag :status="item.status" kind="handover" />
        </div>
        <p>预约时间：{{ formatDate(item.appointmentTime) }}</p>
        <p>预约地点：{{ item.appointmentLocation || '待设置' }}</p>
        <p>对方信息：{{ item.publisherName }} / {{ item.applicantName }}</p>
        <div class="handover-code">{{ showCode[item.id] ? item.handoverCode : '******' }}</div>
        <div class="action-row">
          <el-button link type="primary" @click="showCode[item.id] = !showCode[item.id]">{{ showCode[item.id] ? '隐藏交接码' : '显示交接码' }}</el-button>
          <el-button v-if="item.status === 'WAIT_CONFIRM'" link @click="openAppointment(item)">设置时间地点</el-button>
          <el-button v-if="item.status === 'APPOINTED'" link type="success" @click="complete(item)">确认完成</el-button>
        </div>
      </el-card>
    </div>
    <EmptyState v-if="!loading && !records.length" title="暂无预约交接" />
    <el-dialog v-model="dialogOpen" title="设置预约时间和地点" width="520px">
      <el-form label-position="top">
        <el-form-item label="预约时间"><el-date-picker v-model="appointment.appointTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="预约地点"><el-input v-model="appointment.appointLocation" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" @click="saveAppointment">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
