<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AdminReviewDrawer from '../../components/admin/AdminReviewDrawer.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import { approveItem, listPendingItems, rejectItem } from '../../api/adminItem'
import { mockItems, pageOf } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { typeText } from '../../utils/status'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const records = ref([])
const drawerOpen = ref(false)
const active = ref(null)
const filters = reactive({
  keyword: '',
  itemType: '',
  pageNum: 1,
  pageSize: 20,
})

const load = async () => {
  loading.value = true
  try {
    const data = await listPendingItems({
      keyword: filters.keyword || undefined,
      itemType: filters.itemType || undefined,
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
    })
    records.value = normalizePageData(data).records
  } catch (error) {
    records.value = isFallbackableError(error)
      ? pageOf(mockItems.filter((item) => ['PENDING_REVIEW', 'AVAILABLE'].includes(item.status))).records
      : []
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
    await approveItem(row.id)
    ElMessage.success('审核通过')
    drawerOpen.value = false
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}
const reject = async ({ id, remark }) => {
  try {
    await rejectItem(id, { reviewRemark: remark })
    ElMessage.success('已驳回')
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
      <h1>物品审核</h1>
      <p>审核发布信息、查看疑似重复并处理下架。</p>
    </div>
    <section class="filter-panel">
      <el-input v-model="filters.keyword" placeholder="关键词" clearable @keyup.enter="load" />
      <el-select v-model="filters.itemType" placeholder="类型" clearable>
        <el-option label="失物" value="LOST" />
        <el-option label="拾物" value="FOUND" />
      </el-select>
      <el-button type="primary" @click="load">搜索</el-button>
    </section>
    <el-table v-loading="loading" :data="records" @row-click="open">
      <el-table-column prop="title" label="物品名称" min-width="180" />
      <el-table-column label="类型" width="90"><template #default="{ row }">{{ typeText(row.itemType) }}</template></el-table-column>
      <el-table-column prop="categoryName" label="分类" width="110" />
      <el-table-column prop="publisherName" label="发布人" width="110" />
      <el-table-column prop="location" label="地点" min-width="160" />
      <el-table-column label="提交时间" width="160"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
      <el-table-column label="疑似重复" width="100"><template #default>低</template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }"><el-button link type="primary" @click.stop="open(row)">审核</el-button></template>
      </el-table-column>
    </el-table>
    <EmptyState v-if="!loading && !records.length" title="暂无待审核物品" description="当前筛选条件下没有需要处理的发布记录。" />
    <AdminReviewDrawer v-if="active" v-model="drawerOpen" title="物品审核详情" :record="active" @approve="approve" @reject="reject" />
  </section>
</template>
