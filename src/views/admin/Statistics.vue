<script setup>
import { computed, onMounted, ref } from 'vue'
import ChartCard from '../../components/admin/ChartCard.vue'
import { categoryStats, claimSuccessRate, expireStats, itemStatusStats, monthlyStats, userRankStats } from '../../api/statistics'
import { statusMeta } from '../../utils/status'

const loading = ref(false)
const itemStatus = ref([])
const categories = ref([])
const monthly = ref([])
const claimRate = ref(null)
const userRank = ref([])
const expires = ref(null)

const statusChart = computed(() => itemStatus.value.map((item) => ({ name: statusMeta(item.name).label, value: item.value })))
const categoryChart = computed(() => categories.value.map((item) => ({ name: item.name, value: item.value })))
const monthlyChart = computed(() => monthly.value.map((item) => ({ name: item.month, value: item.count })))
const userRankChart = computed(() => userRank.value.map((item) => ({ name: item.nickname || item.username || item.name, value: item.count || item.itemCount || 0 })))
const claimRateChart = computed(() => {
  const total = claimRate.value?.totalClaims || 0
  const completed = claimRate.value?.completedClaims || 0
  if (!total) return []
  return [
    { name: '成功认领', value: completed },
    { name: '其他申请', value: Math.max(total - completed, 0) },
  ]
})
const expireChart = computed(() => {
  if (!expires.value) return []
  return Object.entries(expires.value).map(([name, value]) => ({ name, value }))
})

onMounted(async () => {
  loading.value = true
  const [statusResult, categoryResult, monthlyResult, claimResult, rankResult, expireResult] = await Promise.allSettled([
    itemStatusStats(),
    categoryStats(),
    monthlyStats(),
    claimSuccessRate(),
    userRankStats(),
    expireStats(),
  ])
  itemStatus.value = statusResult.status === 'fulfilled' ? statusResult.value || [] : []
  categories.value = categoryResult.status === 'fulfilled' ? categoryResult.value || [] : []
  monthly.value = monthlyResult.status === 'fulfilled' ? monthlyResult.value || [] : []
  claimRate.value = claimResult.status === 'fulfilled' ? claimResult.value : null
  userRank.value = rankResult.status === 'fulfilled' ? rankResult.value || [] : []
  expires.value = expireResult.status === 'fulfilled' ? expireResult.value : null
  loading.value = false
})
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <span class="eyebrow">Analytics</span>
        <h1>统计分析</h1>
        <p>用图表展示发布趋势、分类分布、认领成功率和过期数据。</p>
      </div>
      <el-date-picker type="daterange" />
    </div>
    <section v-loading="loading" class="analytics-grid">
      <ChartCard title="物品状态分布" type="donut" :data="statusChart" />
      <ChartCard title="分类发布数量" type="horizontal-bar" :data="categoryChart" />
      <ChartCard title="月度发布趋势" type="line" :data="monthlyChart" />
      <ChartCard title="认领成功率" type="donut" :data="claimRateChart" />
      <ChartCard title="用户发布排行" type="bar" :data="userRankChart" />
      <ChartCard title="过期数据统计" type="horizontal-bar" :data="expireChart" />
    </section>
  </section>
</template>
