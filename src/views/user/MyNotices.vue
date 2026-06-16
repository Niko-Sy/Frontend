<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { deleteNotice, listNotices, readAllNotices, readNotice } from '../../api/notice'
import { mockNotices } from '../../utils/mock'
import { formatDate } from '../../utils/format'

const loading = ref(false)
const active = ref('ALL')
const notices = ref([])
const tabs = ['ALL', 'UNREAD', 'ITEM', 'CLAIM', 'HANDOVER', 'SYSTEM']
const tabLabel = { ALL: '全部', UNREAD: '未读', ITEM: '审核', CLAIM: '认领', HANDOVER: '交接', SYSTEM: '系统' }
const filtered = computed(() => {
  if (active.value === 'ALL') return notices.value
  if (active.value === 'UNREAD') return notices.value.filter((item) => !item.readFlag)
  return notices.value.filter((item) => item.type === active.value)
})

const load = async () => {
  loading.value = true
  try {
    const data = await listNotices()
    notices.value = data.records || data || []
  } catch {
    notices.value = mockNotices
  } finally {
    loading.value = false
  }
}

const markRead = async (notice) => {
  if (notice.readFlag) return
  try {
    await readNotice(notice.id)
    notice.readFlag = 1
  } catch {
    notice.readFlag = 1
  }
}

const readAll = async () => {
  try {
    await readAllNotices()
    notices.value.forEach((item) => (item.readFlag = 1))
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const remove = async (notice) => {
  try {
    await deleteNotice(notice.id)
  } catch {
    // Demo mode removes locally.
  }
  notices.value = notices.value.filter((item) => item.id !== notice.id)
}

onMounted(load)
</script>

<template>
  <PageContainer title="消息通知" subtitle="审核、认领、交接与系统提醒统一收纳">
    <template #actions>
      <el-button type="primary" plain @click="readAll">全部已读</el-button>
    </template>
    <el-tabs v-model="active">
      <el-tab-pane v-for="tab in tabs" :key="tab" :name="tab" :label="tabLabel[tab]" />
    </el-tabs>
    <div v-loading="loading" class="notice-list">
      <article v-for="notice in filtered" :key="notice.id" class="notice-item" :class="{ unread: !notice.readFlag }" @click="markRead(notice)">
        <span class="notice-dot" />
        <div>
          <h3>{{ notice.title }}</h3>
          <p>{{ notice.content }}</p>
          <small>{{ formatDate(notice.createTime) }}</small>
        </div>
        <el-button link type="danger" @click.stop="remove(notice)">删除</el-button>
      </article>
    </div>
    <EmptyState v-if="!loading && !filtered.length" title="暂时没有新的消息" />
  </PageContainer>
</template>
