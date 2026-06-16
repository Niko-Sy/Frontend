<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/common/PageContainer.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ItemCard from '../../components/item/ItemCard.vue'
import ItemFilterPanel from '../../components/item/ItemFilterPanel.vue'
import ClaimDialog from '../../components/claim/ClaimDialog.vue'
import ClueDialog from '../../components/claim/ClueDialog.vue'
import { listItems } from '../../api/item'
import { useAppStore } from '../../store/app'
import { useUserStore } from '../../store/user'
import { mockItems, pageOf } from '../../utils/mock'
import { canClaim, canSubmitClue } from '../../utils/permission'
import { isFallbackableError, normalizePageData } from '../../utils/normalize'

const props = defineProps({ itemType: { type: String, required: true } })
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const loading = ref(false)
const page = ref({ total: 0, records: [], pageNum: 1, pageSize: 10 })
const view = ref('card')
const filters = reactive({
  keyword: route.query.keyword || '',
  categoryId: '',
  location: '',
  status: '',
  sortBy: '',
})
const claimOpen = ref(false)
const clueOpen = ref(false)
const activeItem = ref(null)

const title = computed(() => (props.itemType === 'LOST' ? '失物大厅' : '拾物大厅'))
const subtitle = computed(() =>
  props.itemType === 'LOST'
    ? '查看同学们正在寻找的物品，如果你有线索，可以直接提交给发布人。'
    : '浏览校内拾物信息，确认特征后在线提交认领申请。',
)
const statusOptions = [
  { label: '可处理', value: 'AVAILABLE' },
  { label: '认领中', value: 'CLAIMING' },
  { label: '待交接', value: 'WAIT_HANDOVER' },
  { label: '已完成', value: 'CLAIMED' },
  { label: '已过期', value: 'EXPIRED' },
]

const localFilter = () => {
  let records = mockItems.filter((item) => item.itemType === props.itemType)
  if (filters.keyword) records = records.filter((item) => `${item.title}${item.description}`.includes(filters.keyword))
  if (filters.categoryId) records = records.filter((item) => item.categoryId === filters.categoryId)
  if (filters.location) records = records.filter((item) => item.location.includes(filters.location))
  if (filters.status) records = records.filter((item) => item.status === filters.status)
  return pageOf(records)
}

const load = async () => {
  loading.value = true
  try {
    const data = await listItems({
      ...filters,
      itemType: props.itemType,
      pageNum: page.value.pageNum,
      pageSize: page.value.pageSize,
    })
    page.value = normalizePageData(data)
  } catch (error) {
    page.value = isFallbackableError(error) ? localFilter() : { total: 0, records: [], pageNum: 1, pageSize: page.value.pageSize }
  } finally {
    loading.value = false
  }
}

const requireLogin = () => {
  if (userStore.profile) return true
  router.push({ path: '/login', query: { redirect: route.fullPath } })
  return false
}

const handleAction = (item) => {
  if (!requireLogin()) return
  activeItem.value = item
  if (props.itemType === 'FOUND') {
    if (canClaim(item, userStore.profile)) claimOpen.value = true
    else router.push(`/item/${item.id}`)
    return
  }
  if (canSubmitClue(item, userStore.profile)) clueOpen.value = true
  else router.push(`/item/${item.id}`)
}

watch(
  () => props.itemType,
  () => {
    page.value.pageNum = 1
    load()
  },
)

onMounted(async () => {
  await appStore.loadCategories()
  await load()
})
</script>

<template>
  <PageContainer no-header compact>
    <div class="hall-compact-head">
      <div>
        <span class="eyebrow">{{ itemType === 'LOST' ? 'Lost Items' : 'Found Items' }}</span>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <el-segmented v-model="view" :options="[{ label: '卡片', value: 'card' }, { label: '列表', value: 'list' }]" />
    </div>
    <ItemFilterPanel v-model="filters" :categories="appStore.categories" :status-options="statusOptions" @search="load" @reset="load" />
    <div class="result-bar">
      <span>共找到 {{ page.total }} 条结果</span>
      <span v-if="filters.keyword">关键词：{{ filters.keyword }}</span>
    </div>
    <div v-loading="loading" :class="view === 'card' ? 'item-grid' : 'item-list'">
      <ItemCard
        v-for="item in page.records"
        :key="item.id"
        :item="item"
        :dense="view === 'list'"
        :action-label="itemType === 'FOUND' ? (canClaim(item, userStore.profile) ? '申请认领' : '查看详情') : (canSubmitClue(item, userStore.profile) ? '提交线索' : '查看详情')"
        @action="handleAction"
      />
    </div>
    <EmptyState v-if="!loading && !page.records.length" title="暂时没有找到相关物品" />
    <el-pagination
      v-if="page.total > page.pageSize"
      v-model:current-page="page.pageNum"
      class="pagination"
      background
      layout="prev, pager, next"
      :total="page.total"
      @current-change="load"
    />
    <ClaimDialog v-model="claimOpen" :item="activeItem" @success="load" />
    <ClueDialog v-model="clueOpen" :item="activeItem" @success="load" />
  </PageContainer>
</template>
