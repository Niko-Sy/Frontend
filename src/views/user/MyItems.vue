<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { deleteItem, listMyItems, markFound, removeItem, withdrawItem } from '../../api/item'
import { mockItems, pageOf } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { typeText } from '../../utils/status'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const records = ref([])
const activeStatus = ref('')
const statuses = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING_REVIEW' },
  { label: '展示中', value: 'AVAILABLE' },
  { label: '认领中', value: 'CLAIMING' },
  { label: '已完成', value: 'CLAIMED' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已驳回', value: 'REJECTED' },
]

const filtered = computed(() => (activeStatus.value ? records.value.filter((item) => item.status === activeStatus.value) : records.value))
const stats = computed(() =>
  statuses.slice(1).map((status) => ({ ...status, count: records.value.filter((item) => item.status === status.value).length })),
)

const load = async () => {
  loading.value = true
  try {
    const data = await listMyItems({ status: activeStatus.value || undefined })
    records.value = normalizePageData(data).records
  } catch (error) {
    records.value = isFallbackableError(error) ? pageOf(mockItems.filter((item) => item.userId === 1)).records : []
  } finally {
    loading.value = false
  }
}

const act = async (row, action) => {
  await ElMessageBox.confirm('确认执行该操作？', '二次确认', { type: 'warning' })
  try {
    if (action === 'withdraw') await withdrawItem(row.id)
    if (action === 'remove') await removeItem(row.id, { reason: '用户主动下架' })
    if (action === 'delete') await deleteItem(row.id)
    if (action === 'found') await markFound(row.id)
    ElMessage.success('操作成功')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <PageContainer title="我的发布" subtitle="管理自己发布的失物与拾物信息">
    <section class="stat-grid">
      <article v-for="stat in stats" :key="stat.value" class="mini-stat">
        <strong>{{ stat.count }}</strong>
        <span>{{ stat.label }}</span>
      </article>
    </section>
    <el-tabs v-model="activeStatus" @tab-change="load">
      <el-tab-pane v-for="status in statuses" :key="status.value" :label="status.label" :name="status.value" />
    </el-tabs>
    <el-table v-loading="loading" :data="filtered" class="responsive-table">
      <el-table-column prop="title" label="物品名称" min-width="180" />
      <el-table-column label="类型" width="90"><template #default="{ row }">{{ typeText(row.itemType) }}</template></el-table-column>
      <el-table-column prop="categoryName" label="分类" width="110" />
      <el-table-column prop="location" label="地点" min-width="160" />
      <el-table-column label="状态" width="110"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
      <el-table-column label="发布时间" width="160"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" fixed="right" width="240">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/item/${row.id}`)">查看</el-button>
          <el-button v-if="row.status === 'PENDING_REVIEW'" link @click="act(row, 'withdraw')">撤回</el-button>
          <el-button v-if="row.status === 'AVAILABLE'" link @click="act(row, 'found')">标记找回</el-button>
          <el-button v-if="['AVAILABLE', 'PENDING_REVIEW'].includes(row.status)" link type="danger" @click="act(row, 'remove')">下架</el-button>
          <el-button v-if="['DRAFT', 'REJECTED', 'EXPIRED'].includes(row.status)" link type="danger" @click="act(row, 'delete')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <EmptyState v-if="!loading && !filtered.length" title="你还没有发布任何信息" action-text="去发布第一条" @action="$router.push('/publish')" />
  </PageContainer>
</template>
