<script setup>
import { onMounted, reactive, ref } from 'vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { operationLogs } from '../../api/log'
import { mockLogs } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const loading = ref(false)
const logs = ref([])
const detail = ref(null)
const drawer = ref(false)
const filters = reactive({
  keyword: '',
  module: '',
  pageNum: 1,
  pageSize: 20,
})

const load = async () => {
  loading.value = true
  try {
    const data = await operationLogs({
      keyword: filters.keyword || undefined,
      module: filters.module || undefined,
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
    })
    logs.value = normalizePageData(data).records
  } catch (error) {
    logs.value = isFallbackableError(error) ? mockLogs : []
  } finally {
    loading.value = false
  }
}
const open = (row) => {
  detail.value = row
  drawer.value = true
}
onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <h1>操作日志</h1>
      <p>记录管理员关键操作、请求地址与执行结果。</p>
    </div>
    <section class="filter-panel">
      <el-input v-model="filters.keyword" placeholder="操作人 / 模块" clearable @keyup.enter="load" />
      <el-select v-model="filters.module" placeholder="模块" clearable>
        <el-option label="物品审核" value="item" />
        <el-option label="认领审核" value="claim" />
        <el-option label="交接管理" value="handover" />
      </el-select>
      <el-button type="primary" @click="load">搜索</el-button>
    </section>
    <el-table v-loading="loading" :data="logs" @row-click="open">
      <el-table-column prop="userId" label="操作人" width="90" />
      <el-table-column prop="module" label="模块" />
      <el-table-column prop="operation" label="操作内容" min-width="160" />
      <el-table-column prop="requestMethod" label="方法" width="90" />
      <el-table-column prop="requestUrl" label="请求地址" min-width="220" />
      <el-table-column prop="ipAddress" label="IP 地址" />
      <el-table-column label="时间"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
    </el-table>
    <EmptyState v-if="!loading && !logs.length" title="暂无操作日志" description="当前筛选条件下没有日志记录。" />
    <el-drawer v-model="drawer" title="日志详情" size="460px">
      <pre>{{ detail }}</pre>
    </el-drawer>
  </section>
</template>
