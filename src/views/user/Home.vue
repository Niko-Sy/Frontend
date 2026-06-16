<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import PageContainer from "../../components/common/PageContainer.vue"
import ItemCard from "../../components/item/ItemCard.vue"
import { listItems } from "../../api/item"
import { dashboardSummary } from "../../api/statistics"
import { useUserStore } from "../../store/user"
import { mockItems } from "../../utils/mock"
import { isFallbackableError, normalizeDashboardSummary, normalizePageData } from "../../utils/normalize"

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const keyword = ref("")
const searchType = ref("FOUND")
const items = ref([])
const summary = ref(null)

const foundItems = computed(() => items.value.filter((item) => item.itemType === "FOUND").slice(0, 4))
const lostItems = computed(() => items.value.filter((item) => item.itemType === "LOST").slice(0, 4))
const todayItems = computed(() => summary.value?.todayItems ?? items.value.filter((item) => item.createTime?.startsWith(new Date().toISOString().slice(0, 10))).length)
const pendingClaims = computed(() => summary.value?.pendingClaims ?? items.value.filter((item) => item.status === "CLAIMING").length)
const waitHandovers = computed(() => summary.value?.waitHandoverItems ?? items.value.filter((item) => item.status === "WAIT_HANDOVER").length)

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
  const path = searchType.value === "LOST" ? "/lost" : "/found"
  router.push({ path, query: keyword.value ? { keyword: keyword.value } : {} })
}

onMounted(load)
</script>

<template>
  <PageContainer compact>
    <div class="bento-grid-wrapper">
      
      <!-- Hero Section (Bento Size: Large) -->
      <section class="bento-card bento-hero">
        <div class="hero-content">
          <span class="eyebrow">LostLink Campus</span>
          <h1>让校园遗失物品更快回家</h1>
          <p>发布、查找、认领、交接，一站式完成。用更清晰的流程，把每一次捡获都变成一次靠谱的归还。</p>
          
          <div class="hero-search">
            <el-select v-model="searchType" class="hero-type-select">
              <el-option label="找拾物" value="FOUND" />
              <el-option label="找失物" value="LOST" />
            </el-select>
            <el-input v-model="keyword" size="large" placeholder="输入物品、地点或关键词" @keyup.enter="search" />
            <el-button type="primary" size="large" round @click="search">搜索</el-button>
          </div>
        </div>
      </section>

      <!-- Quick Actions (Bento Box: Square) -->
      <section class="bento-card bento-actions">
        <div class="action-btn" 
/publish?type=LOST
)">
          <div class="action-icon publish-lost"><el-icon><Position /></el-icon></div>
          <span>发布失物</span>
        </div>
        <div class="action-btn" 
/publish?type=FOUND
)">
          <div class="action-icon publish-found"><el-icon><Checked /></el-icon></div>
          <span>发布拾物</span>
        </div>
        <div class="action-btn" 
/my/items
)">
          <div class="action-icon my-post"><el-icon><List /></el-icon></div>
          <span>我的发布</span>
        </div>
        <div class="action-btn" 
/my/claims
)">
          <div class="action-icon my-claim"><el-icon><Avatar /></el-icon></div>
          <span>我的认领</span>
        </div>
      </section>

      <!-- Flow Panel -->
      <section class="bento-card bento-flow">
        <h3>全闭环寻物流程</h3>
        <div class="flow-steps">
          <div v-for="(step, index) in [\"发布信息\", \"管理审核\", \"线索认领\", \"扫码交接\"]" :key="step" class="flow-step">
            <span class="step-num">{{ index + 1 }}</span>
            <strong>{{ step }}</strong>
          </div>
        </div>
      </section>

      <!-- Stats Panel -->
      <section class="bento-card bento-stats">
        <div class="stat-item">
          <strong>{{ todayItems }}</strong>
          <span>今日新增</span>
        </div>
        <div class="stat-item">
          <strong>{{ pendingClaims }}</strong>
          <span>认领待审</span>
        </div>
        <div class="stat-item">
          <strong>{{ waitHandovers }}</strong>
          <span>线下交接</span>
        </div>
      </section>

      <!-- Found Items (Wide) -->
      <section class="bento-card bento-items bento-found">
        <div class="bento-header">
          <h2>最新拾物大厅</h2>
          <el-button round size="small" 
/found
)">探索所有</el-button>
        </div>
        <div v-loading="loading" class="item-list-wrap">
          <ItemCard v-for="item in foundItems" :key="item.id" :item="item" action-label="申请认领" />
        </div>
      </section>

      <!-- Lost Items (Wide) -->
      <section class="bento-card bento-items bento-lost">
        <div class="bento-header">
          <h2>最新失物报备</h2>
          <el-button round size="small" 
/lost
)">探索所有</el-button>
        </div>
        <div v-loading="loading" class="item-list-wrap">
          <ItemCard v-for="item in lostItems" :key="item.id" :item="item" action-label="提线索" />
        </div>
      </section>
      
    </div>
  </PageContainer>
</template>

<style scoped>
.bento-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minMax(180px, auto);
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.bento-card {
  background: var(--gradient-card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Card Placements */
.bento-hero { grid-column: span 8; grid-row: span 2; justify-content: center; background: var(--gradient-hero); }
.bento-actions { grid-column: span 4; grid-row: span 1; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); padding: var(--space-4); }
.bento-stats { grid-column: span 4; grid-row: span 1; display: flex; flex-direction: row; justify-content: space-around; align-items: center; }
.bento-flow { grid-column: span 12; grid-row: span 1; justify-content: center;}
.bento-found { grid-column: span 6; grid-row: span 2; }
.bento-lost { grid-column: span 6; grid-row: span 2; }

/* Styling Details */
.eyebrow { font-size: 13px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
.bento-hero h1 { font-size: 40px; font-weight: 800; line-height: 1.2; margin: 12px 0; color: var(--text-strong); }
.bento-hero p { font-size: 16px; color: var(--text-muted); max-width: 80%; margin-bottom: 30px; }

.hero-search { display: flex; gap: var(--space-2); max-width: 500px; }
.hero-search .el-select { width: 120px; }
.hero-search .el-input { flex: 1; }

.action-btn { background: var(--surface-glass); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; border: 1px solid var(--border-soft); transition: all 0.2s; }
.action-btn:hover { background: var(--surface); box-shadow: var(--shadow-sm); }
.action-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
.publish-lost { background: var(--warning); }
.publish-found { background: var(--success); }
.my-post { background: var(--primary); }
.my-claim { background: var(--brand-violet); }

.stat-item { text-align: center; }
.stat-item strong { display: block; font-size: 36px; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stat-item span { font-size: 14px; color: var(--text-muted); font-weight: 600; }

.flow-steps { display: flex; gap: var(--space-4); margin-top: 16px; align-items: center; justify-content: space-between; }
.flow-step { display: flex; align-items: center; gap: 12px; }
.step-num { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }

.bento-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.bento-header h2 { margin: 0; font-size: 22px; font-weight: 800; }
.item-list-wrap { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }

/* Responsive adjustments for mobile App experience */
@media (max-width: 991px) {
  .bento-hero, .bento-actions, .bento-stats, .bento-flow, .bento-found, .bento-lost { grid-column: span 12; }
  .bento-stats { flex-direction: row; }
  .bento-actions { grid-template-columns: repeat(4, 1fr); padding: var(--space-3); }
  .action-btn span { font-size: 12px; }
}

@media (max-width: 767px) {
  .bento-grid-wrapper { gap: var(--space-3); }
  .bento-hero h1 { font-size: 28px; }
  .bento-hero p { max-width: 100%; font-size: 14px; }
  .bento-card { padding: var(--space-4); border-radius: var(--radius-md); }
  .action-icon { width: 36px; height: 36px; font-size: 16px; }
  .flow-steps { flex-direction: column; align-items: flex-start; }
}
</style>
