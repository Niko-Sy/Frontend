<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AdminReviewDrawer from '../../components/admin/AdminReviewDrawer.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import { approveClaim, listPendingClaims, needMoreClaim, rejectClaim } from '../../api/adminClaim'
import { mockClaims } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const records = ref([])
const active = ref(null)
const drawerOpen = ref(false)
const filters = reactive({
  keyword: '',
  status: '',
  pageNum: 1,
  pageSize: 20,
})

const load = async () => {
  loading.value = true
  try {
    const data = await listPendingClaims({
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
    })
    records.value = normalizePageData(data).records
  } catch (error) {
    records.value = isFallbackableError(error) ? mockClaims : []
  } finally {
    loading.value = false
  }
}

const open = (row) => {
  active.value = row
  drawerOpen.value = true
}

const approve = async (row) => {
  try {
    await approveClaim(row.id)
    ElMessage.success('认领通过')
    drawerOpen.value = false
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

const reject = async ({ id, remark }) => {
  try {
    await rejectClaim(id, { reviewRemark: remark })
    ElMessage.success('已驳回')
    drawerOpen.value = false
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

const needMore = async ({ id, remark }) => {
  try {
    await needMoreClaim(id, { reviewRemark: remark })
    ElMessage.success('已要求补充')
    drawerOpen.value = false
    load()
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
        <span class="eyebrow">Claim Review</span>
        <h1>认领审核</h1>
        <p>核对申请说明、证明材料和同物品的其他申请。</p>
      </div>
      <div class="flow-capsules"><span>待处理 {{ records.length }}</span></div>
    </div>
    <section class="filter-panel">
      <el-input v-model="filters.keyword" placeholder="申请人 / 物品名称" clearable @keyup.enter="load" />
      <el-select v-model="filters.status" placeholder="状态" clearable>
        <el-option label="待审核" value="PENDING" />
        <el-option label="待补充" value="NEED_MORE" />
      </el-select>
      <el-button type="primary" @click="load">搜索</el-button>
    </section>
    <div class="claim-review-layout">
      <el-card shadow="never">
        <el-table v-loading="loading" :data="records" @row-click="open">
          <el-table-column prop="applicantName" label="申请人" width="110" />
          <el-table-column prop="itemTitle" label="物品名称" min-width="180" />
          <el-table-column label="状态" width="110"><template #default="{ row }"><StatusTag :status="row.status" kind="claim" /></template></el-table-column>
          <el-table-column label="申请时间" width="160"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
          <el-table-column label="操作" width="120"><template #default="{ row }"><el-button link type="primary" @click.stop="open(row)">查看</el-button></template></el-table-column>
        </el-table>
        <EmptyState v-if="!loading && !records.length" title="暂无待审核认领" description="当前没有需要处理的认领记录。" />
      </el-card>
      <el-card shadow="never" class="review-side">
        <h3>{{ active?.itemTitle || '选择左侧申请' }}</h3>
        <p>{{ active?.featureDesc || '查看认领说明与证明材料，对比后进行审核。' }}</p>
        <StatusTag v-if="active" :status="active.status" kind="claim" />
      </el-card>
    </div>
    <AdminReviewDrawer
      v-if="active"
      v-model="drawerOpen"
      title="认领审核详情"
      kind="claim"
      :record="active"
      @approve="approve"
      @reject="reject"
      @need-more="needMore"
    />
  </section>
</template>
