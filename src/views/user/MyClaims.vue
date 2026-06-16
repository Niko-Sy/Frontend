<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import ClaimProgress from '../../components/claim/ClaimProgress.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { cancelClaim, listMyClaims, supplementClaim } from '../../api/claim'
import { mockClaims } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const status = ref('')
const records = ref([])
const supplementOpen = ref(false)
const activeClaim = ref(null)
const supplementText = ref('')
const tabs = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '待补充', value: 'NEED_MORE' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '已失效', value: 'INVALID' },
]
const filtered = computed(() => (status.value ? records.value.filter((item) => item.status === status.value) : records.value))

const load = async () => {
  loading.value = true
  try {
    const data = await listMyClaims({ status: status.value || undefined })
    records.value = normalizePageData(data).records
  } catch (error) {
    records.value = isFallbackableError(error) ? mockClaims : []
  } finally {
    loading.value = false
  }
}

const cancel = async (row) => {
  await ElMessageBox.confirm('确认取消该认领申请？', '二次确认', { type: 'warning' })
  try {
    await cancelClaim(row.id)
    ElMessage.success('申请已取消')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const submitSupplement = async () => {
  if (!supplementText.value.trim()) return ElMessage.warning('请填写补充说明')
  try {
    await supplementClaim(activeClaim.value.id, { featureDesc: supplementText.value.trim() })
    ElMessage.success('补充材料已提交')
    supplementOpen.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <PageContainer title="我的认领" subtitle="查看认领申请进度与处理要求">
    <el-tabs v-model="status" @tab-change="load">
      <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.label" :name="tab.value" />
    </el-tabs>
    <div v-loading="loading" class="claim-list">
      <el-card v-for="claim in filtered" :key="claim.id" shadow="never" class="claim-card">
        <div class="claim-card-head">
          <div>
            <h3>{{ claim.itemTitle }}</h3>
            <p>申请时间：{{ formatDate(claim.createTime) }}</p>
          </div>
          <StatusTag :status="claim.status" kind="claim" />
        </div>
        <ClaimProgress :status="claim.status" />
        <p class="muted">特征说明：{{ claim.featureDesc || '-' }}</p>
        <el-alert v-if="claim.status === 'NEED_MORE'" type="warning" :title="claim.reviewRemark" show-icon :closable="false" />
        <div class="action-row">
          <el-button type="primary" link @click="$router.push(`/item/${claim.itemId}`)">查看物品</el-button>
          <el-button v-if="claim.status === 'PENDING'" link type="danger" @click="cancel(claim)">取消申请</el-button>
          <el-button v-if="claim.status === 'NEED_MORE'" type="warning" link @click="activeClaim = claim; supplementOpen = true">补充证明</el-button>
        </div>
      </el-card>
    </div>
    <EmptyState v-if="!loading && !filtered.length" title="你还没有提交认领申请" action-text="去招领大厅看看" @action="$router.push('/found')" />
    <el-dialog v-model="supplementOpen" title="补充证明材料" width="520px">
      <el-input v-model="supplementText" type="textarea" :rows="5" placeholder="补充特征描述、凭证信息或联系方式" />
      <template #footer>
        <el-button @click="supplementOpen = false">取消</el-button>
        <el-button type="primary" @click="submitSupplement">提交补充</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
