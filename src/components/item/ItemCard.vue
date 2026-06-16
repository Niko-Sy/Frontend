<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StatusTag from '../common/StatusTag.vue'
import { daysLeft, formatDate, imageUrl } from '../../utils/format'
import { typeText } from '../../utils/status'

const props = defineProps({
  item: { type: Object, required: true },
  actionLabel: { type: String, default: '' },
  dense: { type: Boolean, default: false },
})
const emit = defineEmits(['action'])
const router = useRouter()

const coverStyle = computed(() => {
  const image = props.item.coverImage || props.item.imageUrls?.[0]
  return image ? { backgroundImage: `url(${imageUrl(image)})` } : {}
})

const open = () => router.push(`/item/${props.item.id}`)
</script>

<template>
  <article
    class="item-card"
    :class="{ expired: ['EXPIRED', 'CLAIMED', 'REMOVED'].includes(item.status), dense }"
    role="button"
    tabindex="0"
    :aria-label="`查看${item.title}详情`"
    @click="open"
    @keydown.enter="open"
    @keydown.space.prevent="open"
  >
    <div class="item-cover" :style="coverStyle">
      <span v-if="!item.coverImage && !item.imageUrls?.length">{{ typeText(item.itemType) }}</span>
    </div>
    <div class="item-body">
      <div class="item-tags">
        <span class="type-pill" :class="item.itemType">{{ typeText(item.itemType) }}</span>
        <StatusTag :status="item.status" size="small" />
      </div>
      <h3>{{ item.title }}</h3>
      <p class="muted">{{ item.categoryName || '未分类' }} · {{ item.location || '地点待补充' }}</p>
      <p class="item-desc">{{ item.description || '暂无详细描述' }}</p>
      <div class="item-meta">
        <span><el-icon><Clock /></el-icon>{{ formatDate(item.eventTime) }}</span>
        <span><el-icon><View /></el-icon>{{ item.viewCount || 0 }}</span>
        <span><el-icon><Tickets /></el-icon>{{ item.claimCount || 0 }}</span>
      </div>
      <div class="item-card-footer">
        <span>{{ daysLeft(item.expireTime) }}</span>
        <el-button class="item-action" type="primary" link @click.stop="emit('action', item)">{{ actionLabel || '查看详情' }}</el-button>
      </div>
    </div>
  </article>
</template>
