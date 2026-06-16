<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import TimelineLog from '../../components/common/TimelineLog.vue'
import ItemCard from '../../components/item/ItemCard.vue'
import ClaimDialog from '../../components/claim/ClaimDialog.vue'
import ClueDialog from '../../components/claim/ClueDialog.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { findSimilarItems, getItem, increaseView, markFound, removeItem } from '../../api/item'
import { itemTimeline } from '../../api/log'
import { useUserStore } from '../../store/user'
import { canClaim, canSubmitClue, isOwner } from '../../utils/permission'
import { mockItems, mockTimeline } from '../../utils/mock'
import { daysLeft, formatDate, imageUrl, maskContact } from '../../utils/format'
import { typeText } from '../../utils/status'
import { isFallbackableError } from '../../utils/normalize'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const item = ref(null)
const logs = ref([])
const similar = ref([])
const loading = ref(false)
const claimOpen = ref(false)
const clueOpen = ref(false)

const owner = computed(() => isOwner(item.value, userStore.profile))
const contactText = computed(() => {
  if (!item.value) return '-'
  if (!userStore.profile) return '登录后查看联系方式'
  if (owner.value || userStore.isAdmin || item.value.isPublicContact) return item.value.contactInfo || '-'
  return maskContact(item.value.contactInfo)
})
const statusTip = computed(() => {
  if (item.value?.status === 'AVAILABLE' && item.value?.itemType === 'LOST') {
    return '该失物信息正在展示中，如你有线索可以提交给发布人。'
  }
  if (item.value?.status === 'AVAILABLE' && item.value?.itemType === 'FOUND') {
    return '该拾物当前可认领，请确认特征后提交申请。'
  }
  const map = {
    PENDING_REVIEW: '该信息正在等待管理员审核，暂未公开展示。',
    REJECTED: '该信息审核未通过，请查看驳回原因并修改后重提。',
    CLAIMING: '已有用户提交认领申请，仍可继续提交。',
    WAIT_HANDOVER: '认领申请已通过，等待线下交接。',
    CLAIMED: '该物品已完成认领。',
    EXPIRED: '该信息已过期，不支持继续认领。',
    REMOVED: '该信息已下架。',
  }
  return map[item.value?.status] || ''
})

const load = async () => {
  loading.value = true
  try {
    item.value = await getItem(route.params.id)
    increaseView(route.params.id).catch(() => {})
  } catch (error) {
    if (isFallbackableError(error)) {
      item.value = mockItems.find((mock) => String(mock.id) === String(route.params.id)) || mockItems[0]
    } else {
      item.value = null
      loading.value = false
      return
    }
  }
  try {
    logs.value = await itemTimeline(route.params.id)
  } catch {
    logs.value = mockTimeline
  }
  try {
    const data = await findSimilarItems({
      itemType: item.value.itemType,
      title: item.value.title,
      categoryId: item.value.categoryId,
      location: item.value.location,
      eventTime: item.value.eventTime,
    })
    similar.value = Array.isArray(data) ? data.filter((record) => record.id !== item.value.id).slice(0, 3) : data?.records || []
  } catch {
    similar.value = []
  }
  loading.value = false
}

const ownerAction = async (type) => {
  await ElMessageBox.confirm('确认执行该操作？', '二次确认', { type: 'warning' })
  try {
    if (type === 'found') await markFound(item.value.id)
    if (type === 'remove') await removeItem(item.value.id, { reason: '发布人主动下架' })
    ElMessage.success('操作成功')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <PageContainer v-loading="loading" header-mode="compact" title="物品详情" subtitle="完整信息、状态时间线与可执行操作">
    <template #actions>
      <el-button @click="router.back()">返回</el-button>
    </template>
    <template v-if="item">
      <el-alert v-if="statusTip" class="status-alert" :title="statusTip" type="info" show-icon :closable="false" />
      <section class="detail-grid">
        <div class="detail-gallery">
          <div v-if="item.coverImage || item.imageUrls?.length" class="detail-image" :style="{ backgroundImage: `url(${imageUrl(item.coverImage || item.imageUrls[0])})` }" />
          <div v-else class="detail-placeholder">{{ typeText(item.itemType) }}</div>
        </div>
        <div class="detail-info">
          <div class="item-tags">
            <span class="type-pill" :class="item.itemType">{{ typeText(item.itemType) }}</span>
            <StatusTag :status="item.status" />
          </div>
          <h1>{{ item.title }}</h1>
          <p>{{ item.description }}</p>
          <dl class="detail-list">
            <dt>分类</dt><dd>{{ item.categoryName }}</dd>
            <dt>地点</dt><dd>{{ item.location }}</dd>
            <dt>发生时间</dt><dd>{{ formatDate(item.eventTime) }}</dd>
            <dt>发布时间</dt><dd>{{ formatDate(item.createTime) }}</dd>
            <dt>有效期</dt><dd>{{ daysLeft(item.expireTime) }}</dd>
            <dt>发布人</dt><dd>{{ item.publisherName }}</dd>
            <dt>浏览/申请</dt><dd>{{ item.viewCount || 0 }} / {{ item.claimCount || 0 }}</dd>
            <dt>联系方式</dt><dd>{{ contactText }}</dd>
          </dl>
          <div class="action-row">
            <el-button v-if="!userStore.profile" type="primary" @click="router.push(`/login?redirect=${route.fullPath}`)">登录后操作</el-button>
            <el-button v-else-if="canClaim(item, userStore.profile)" type="primary" @click="claimOpen = true">申请认领</el-button>
            <el-button v-else-if="canSubmitClue(item, userStore.profile)" type="primary" @click="clueOpen = true">提交线索</el-button>
            <el-button v-if="owner && item.status === 'AVAILABLE'" @click="ownerAction('found')">标记已找回</el-button>
            <el-button v-if="owner && ['AVAILABLE', 'PENDING_REVIEW'].includes(item.status)" type="danger" plain @click="ownerAction('remove')">下架</el-button>
          </div>
        </div>
      </section>

      <section class="section-block two-column">
        <el-card shadow="never">
          <h2>详细描述</h2>
          <p>{{ item.description }}</p>
          <h2>联系方式规则</h2>
          <p>未登录用户只能看到提示；发布人、管理员和审核通过的申请人可查看完整联系方式。</p>
        </el-card>
        <el-card shadow="never">
          <h2>状态时间线</h2>
          <TimelineLog :logs="logs" />
        </el-card>
      </section>

      <section class="section-block">
        <div class="section-title"><h2>相似物品推荐</h2></div>
        <div class="item-grid">
          <ItemCard v-for="record in similar" :key="record.id" :item="record" />
        </div>
        <EmptyState v-if="!similar.length" title="暂无相似物品" description="当前没有找到可推荐的相似信息。" />
      </section>
      <ClaimDialog v-model="claimOpen" :item="item" @success="load" />
      <ClueDialog v-model="clueOpen" :item="item" @success="load" />
    </template>
  </PageContainer>
</template>
