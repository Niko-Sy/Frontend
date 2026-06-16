<script setup>
import { computed, onMounted, ref } from 'vue'
import EmptyState from '../../components/common/EmptyState.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import { listAdminItems } from '../../api/adminItem'
import { mockItems } from '../../utils/mock'
import { daysLeft, formatDate } from '../../utils/format'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const items = ref([])

const expired = computed(() => items.value.filter((item) => item.status === 'EXPIRED'))
const near = computed(() => {
  const now = Date.now()
  const limit = 7 * 24 * 60 * 60 * 1000
  return items.value
    .filter((item) => item.expireTime && !['EXPIRED', 'CLAIMED', 'REMOVED'].includes(item.status))
    .filter((item) => {
      const expire = new Date(item.expireTime.replace?.(/-/g, '/') || item.expireTime).getTime()
      return Number.isFinite(expire) && expire >= now && expire - now <= limit
    })
    .slice(0, 10)
})

const load = async () => {
  loading.value = true
  try {
    const data = await listAdminItems({ pageNum: 1, pageSize: 100 })
    items.value = normalizePageData(data).records
  } catch (error) {
    items.value = isFallbackableError(error) ? mockItems : []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <h1>过期信息管理</h1>
      <p>查看自动过期、即将过期与历史归档信息。</p>
    </div>
    <section v-loading="loading" class="two-column">
      <el-card shadow="never">
        <h3>即将过期</h3>
        <el-table :data="near">
          <el-table-column prop="title" label="物品" />
          <el-table-column label="剩余"><template #default="{ row }">{{ daysLeft(row.expireTime) }}</template></el-table-column>
          <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
        </el-table>
        <EmptyState v-if="!near.length" title="暂无即将过期信息" description="未来 7 天内没有即将过期的发布。" />
      </el-card>
      <el-card shadow="never">
        <h3>已过期</h3>
        <el-table :data="expired">
          <el-table-column prop="title" label="物品" />
          <el-table-column label="过期时间"><template #default="{ row }">{{ formatDate(row.expireTime) }}</template></el-table-column>
          <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
        </el-table>
        <EmptyState v-if="!expired.length" title="暂无过期信息" description="当前没有已过期的发布记录。" />
      </el-card>
    </section>
  </section>
</template>
