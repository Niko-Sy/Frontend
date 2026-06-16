<script setup>
import { computed, onMounted, ref } from 'vue'
import { categoryStats, claimSuccessRate, expireStats, itemStatusStats, monthlyStats, userRankStats } from '../../api/statistics'
import { statusMeta } from '../../utils/status'

const loading = ref(false)
const itemStatus = ref([])
const categories = ref([])
const monthly = ref([])
const claimRate = ref(null)
const userRank = ref([])
const expires = ref(null)

const listText = (records, formatter, empty = '暂无数据') => {
  if (!records?.length) return empty
  return records.map(formatter).join(' · ')
}

const cards = computed(() => [
  {
    title: '物品状态分布',
    value: listText(itemStatus.value, (item) => `${statusMeta(item.name).label} ${item.value}`),
  },
  {
    title: '分类发布数量',
    value: listText(categories.value, (item) => `${item.name} ${item.value}`),
  },
  {
    title: '月度发布趋势',
    value: listText(monthly.value, (item) => `${item.month} ${item.count}`),
  },
  {
    title: '认领成功率',
    value: claimRate.value ? `${claimRate.value.completedClaims || 0}/${claimRate.value.totalClaims || 0}，成功率 ${Math.round((claimRate.value.successRate || 0) * 100)}%` : '暂无数据',
  },
  {
    title: '用户发布排行',
    value: listText(userRank.value, (item) => `${item.nickname || item.username || item.name} ${item.count || item.itemCount || 0}`),
  },
  {
    title: '过期数据统计',
    value: expires.value ? Object.entries(expires.value).map(([key, value]) => `${key} ${value}`).join(' · ') : '暂无数据',
  },
])

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
        <h1>统计分析</h1>
        <p>使用后台统计接口展示系统运行数据</p>
      </div>
      <el-date-picker type="daterange" />
    </div>
    <section v-loading="loading" class="analytics-grid">
      <el-card v-for="card in cards" :key="card.title" shadow="never">
        <h3>{{ card.title }}</h3>
        <div class="chart-placeholder">{{ card.value }}</div>
      </el-card>
    </section>
  </section>
</template>
