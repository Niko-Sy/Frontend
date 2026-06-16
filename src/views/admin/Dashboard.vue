<script setup>
import { computed, onMounted, ref } from 'vue'
import ChartCard from '../../components/admin/ChartCard.vue'
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
  { label: '总发布量', value: summary.value.totalItems, icon: 'Box', hint: '平台累计收录' },
  { label: '待审物品', value: summary.value.pendingItems, icon: 'Clock', hint: '需要管理员处理' },
  { label: '待审认领', value: summary.value.pendingClaims, icon: 'Checked', hint: '核对申请材料' },
  { label: '待交接物品', value: summary.value.waitHandoverItems, icon: 'Switch', hint: '线下闭环跟进' },
  { label: '今日新增', value: summary.value.todayItems, icon: 'Plus', hint: '当天发布信息' },
  { label: '过期数量', value: summary.value.expiredItems, icon: 'Warning', hint: '建议及时处理' },
])

const statusChart = computed(() => statusData.value.map((item) => ({ name: statusMeta(item.name).label, value: item.value })))
const categoryChart = computed(() => categoryData.value.map((item) => ({ name: item.name, value: item.value })))
const monthlyChart = computed(() => monthlyData.value.map((item) => ({ name: item.month, value: item.count })))

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
    <div class="admin-page-head">
      <div>
        <span class="eyebrow">Admin Workspace</span>
        <h1>数据看板</h1>
        <p>系统整体运行概览、待处理事项和近期趋势。</p>
      </div>
      <div class="flow-capsules">
        <span>今日新增 {{ summary.todayItems }}</span>
        <span>待处理 {{ summary.pendingItems + summary.pendingClaims }}</span>
      </div>
    </div>

    <section class="stat-grid">
      <StatisticCard v-for="card in summaryCards" :key="card.label" :label="card.label" :value="card.value" :icon="card.icon" :hint="card.hint" />
    </section>

    <section class="chart-grid">
      <ChartCard title="状态分布" subtitle="物品生命周期分布" type="donut" :data="statusChart" />
      <ChartCard title="分类热度" subtitle="不同分类发布量对比" type="horizontal-bar" :data="categoryChart" />
      <ChartCard title="月度趋势" subtitle="发布量随时间变化" type="line" :data="monthlyChart" />
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
