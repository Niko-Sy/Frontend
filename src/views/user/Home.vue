<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/common/PageContainer.vue'
import ItemCard from '../../components/item/ItemCard.vue'
import { listItems } from '../../api/item'
import { dashboardSummary } from '../../api/statistics'
import { useUserStore } from '../../store/user'
import { mockItems } from '../../utils/mock'
import { isFallbackableError, normalizeDashboardSummary, normalizePageData } from '../../utils/normalize'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const keyword = ref('')
const searchType = ref('FOUND')
const items = ref([])
const summary = ref(null)

const foundItems = computed(() => items.value.filter((item) => item.itemType === 'FOUND').slice(0, 4))
const lostItems = computed(() => items.value.filter((item) => item.itemType === 'LOST').slice(0, 4))
const todayItems = computed(() => summary.value?.todayItems ?? items.value.filter((item) => item.createTime?.startsWith(new Date().toISOString().slice(0, 10))).length)
const pendingClaims = computed(() => summary.value?.pendingClaims ?? items.value.filter((item) => item.status === 'CLAIMING').length)
const waitHandovers = computed(() => summary.value?.waitHandoverItems ?? items.value.filter((item) => item.status === 'WAIT_HANDOVER').length)

const quickActions = [
  { label: '发布失物', desc: '让同学帮你留意', icon: 'Position', className: 'publish-lost', path: '/publish?type=LOST' },
  { label: '发布拾物', desc: '等待失主认领', icon: 'Checked', className: 'publish-found', path: '/publish?type=FOUND' },
  { label: '我的发布', desc: '查看处理进展', icon: 'List', className: 'my-post', path: '/my/items' },
  { label: '我的认领', desc: '跟进申请状态', icon: 'Avatar', className: 'my-claim', path: '/my/claims' },
]

const flowSteps = ['发布信息', '管理员审核', '线索认领', '预约交接']

const loadSummary = async () => {
  if (!userStore.isAdmin) return
  try {
    summary.value = normalizeDashboardSummary(await dashboardSummary())
  } catch (error) {
    summary.value = isFallbackableError(error) ? normalizeDashboardSummary({}) : null
  }
}

const load = async () => {
  loading.value = true
  try {
    const data = await listItems({ pageNum: 1, pageSize: 8 })
    items.value = normalizePageData(data).records
  } catch (error) {
    items.value = isFallbackableError(error) ? mockItems : []
  } finally {
    loading.value = false
  }
  await loadSummary()
}

const search = () => {
  const path = searchType.value === 'LOST' ? '/lost' : '/found'
  router.push({ path, query: keyword.value ? { keyword: keyword.value } : {} })
}

onMounted(load)
</script>

<template>
  <PageContainer compact>
    <section class="home-hero">
      <div>
        <span class="eyebrow">LostLink Campus</span>
        <h1 style="font-size: 3.6rem; font-weight: 600;">让校园遗失物品更快回家</h1>
        <p>发布、查找、认领、交接，一站式完成。用更清晰的流程，把每一次捡获都变成一次靠谱的归还。</p>
        <div class="hero-search">
          <el-select v-model="searchType" aria-label="搜索类型">
            <el-option label="找拾物" value="FOUND" />
            <el-option label="找失物" value="LOST" />
          </el-select>
          <el-input v-model="keyword" size="large" placeholder="输入物品、地点或关键词" @keyup.enter="search" />
          <el-button type="primary" size="large" round @click="search">搜索</el-button>
        </div>
        <div class="hero-badges">
          <span>审核后展示</span>
          <span>联系方式保护</span>
          <span>预约交接闭环</span>
        </div>
      </div>
      <aside class="hero-panel" aria-label="平台流程">
        <strong>校园互助闭环</strong>
        <span v-for="step in flowSteps" :key="step">
          {{ step }}
          <small>清晰记录每一步状态</small>
        </span>
      </aside>
    </section>

    <section class="stat-grid">
      <article class="home-stat">
        <strong>{{ todayItems }}</strong>
        <span>今日新增</span>
      </article>
      <article class="home-stat">
        <strong>{{ pendingClaims }}</strong>
        <span>认领待审</span>
      </article>
      <article class="home-stat">
        <strong>{{ waitHandovers }}</strong>
        <span>线下交接</span>
      </article>
      <article class="home-stat">
        <strong>{{ items.length }}</strong>
        <span>最新线索</span>
      </article>
    </section>

    <section class="quick-grid" aria-label="快捷入口">
      <button v-for="action in quickActions" :key="action.path" type="button" class="action-tile" @click="router.push(action.path)">
        <span class="action-icon" :class="action.className">
          <el-icon><component :is="action.icon" /></el-icon>
        </span>
        <strong>{{ action.label }}</strong>
        <small>{{ action.desc }}</small>
      </button>
    </section>

    <section class="section-block">
      <div class="section-title">
        <div>
          <span class="eyebrow">Found</span>
          <h2>最新拾物大厅</h2>
        </div>
        <el-button round @click="router.push('/found')">探索所有</el-button>
      </div>
      <div v-loading="loading" class="item-grid">
        <ItemCard v-for="item in foundItems" :key="item.id" :item="item" action-label="申请认领" />
      </div>
    </section>

    <section class="section-block">
      <div class="section-title">
        <div>
          <span class="eyebrow">Lost</span>
          <h2>最新失物报备</h2>
        </div>
        <el-button round @click="router.push('/lost')">探索所有</el-button>
      </div>
      <div v-loading="loading" class="item-grid">
        <ItemCard v-for="item in lostItems" :key="item.id" :item="item" action-label="提交线索" />
      </div>
    </section>
  </PageContainer>
</template>
