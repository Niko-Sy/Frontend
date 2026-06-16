<script setup>
import { computed, onMounted, ref } from 'vue'
import StatisticCard from '../../components/admin/StatisticCard.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import { categoryStats, dashboardSummary as getSummary, itemStatusStats, monthlyStats, recentPending } from '../../api/statistics'
import { dashboardSummary as mockSummary, mockClaims, mockItems } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizeDashboardSummary } from '../../utils/normalize'
import { statusMeta } from '../../utils/status'

const summary = ref(normalizeDashboardSummary(mockSummary))
const pendingItems = ref([])
const pendingClaims = ref([])
const statusData = ref([])
const categoryData = ref([])
const monthlyData = ref([])

const summaryCards = computed(() => [
  { label: '总发布量', value: summary.value.totalItems, icon: 'Box' },
  { label: '待审核物品', value: summary.value.pendingItems, icon: 'Clock' },
  { label: '待审核认领', value: summary.value.pendingClaims, icon: 'Checked' },
  { label: '待交接物品', value: summary.value.waitHandoverItems, icon: 'Switch' },
  { label: '今日新增', value: summary.value.todayItems, icon: 'Plus' },
  { label: '过期数量', value: summary.value.expiredItems, icon: 'Warning' },
])

const statusText = computed(() =>
  statusData.value.length
    ? statusData.value.map((item) => `${statusMeta(item.name).label} ${item.value}`).join(' · ')
    : '暂无状态数据',
)
const categoryText = computed(() =>
  categoryData.value.length ? categoryData.value.map((item) => `${item.name} ${item.value}`).join(' · ') : '暂无分类数据',
)
const monthlyText = computed(() =>
  monthlyData.value.length ? monthlyData.value.map((item) => `${item.month} ${item.count}`).join(' · ') : '暂无趋势数据',
)

onMounted(async () => {
  try {
    summary.value = normalizeDashboardSummary(await getSummary())
  } catch (error) {
    summary.value = isFallbackableError(error) ? normalizeDashboardSummary(mockSummary) : normalizeDashboardSummary()
  }

  try {
    const recent = await recentPending()
    pendingItems.value = recent.items || recent.pendingItems || recent.itemRecords || []
    pendingClaims.value = recent.claims || recent.pendingClaims || recent.claimRecords || []
  } catch (error) {
    pendingItems.value = isFallbackableError(error) ? mockItems.filter((item) => item.status === 'PENDING_REVIEW') : []
    pendingClaims.value = isFallbackableError(error) ? mockClaims.filter((claim) => claim.status === 'PENDING') : []
  }

  const [statusResult, categoryResult, monthlyResult] = await Promise.allSettled([itemStatusStats(), categoryStats(), monthlyStats()])
  statusData.value = statusResult.status === 'fulfilled' ? statusResult.value || [] : []
  categoryData.value = categoryResult.status === 'fulfilled' ? categoryResult.value || [] : []
  monthlyData.value = monthlyResult.status === 'fulfilled' ? monthlyResult.value || [] : []
})
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head"><h1>数据看板</h1><p>系统整体运行概览与待处理提醒</p></div>
    <section class="stat-grid">
      <StatisticCard v-for="card in summaryCards" :key="card.label" :label="card.label" :value="card.value" :icon="card.icon" />
    </section>
    <section class="chart-grid">
      <el-card shadow="never"><h3>状态分布</h3><div class="chart-placeholder">{{ statusText }}</div></el-card>
      <el-card shadow="never"><h3>分类统计</h3><div class="chart-placeholder">{{ categoryText }}</div></el-card>
      <el-card shadow="never"><h3>月度趋势</h3><div class="chart-placeholder">{{ monthlyText }}</div></el-card>
    </section>
    <section class="two-column">
      <el-card shadow="never">
        <h3>最新待审核物品</h3>
        <el-table :data="pendingItems">
          <el-table-column prop="title" label="物品" />
          <el-table-column prop="publisherName" label="发布人" />
          <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
          <el-table-column label="时间"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
        </el-table>
      </el-card>
      <el-card shadow="never">
        <h3>最新认领申请</h3>
        <el-table :data="pendingClaims">
          <el-table-column prop="itemTitle" label="物品" />
          <el-table-column prop="applicantName" label="申请人" />
          <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" kind="claim" /></template></el-table-column>
          <el-table-column label="时间"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
        </el-table>
      </el-card>
    </section>
  </section>
</template>
