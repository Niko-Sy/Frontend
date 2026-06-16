<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '../common/StatusTag.vue'
import TimelineLog from '../common/TimelineLog.vue'
import { formatDate } from '../../utils/format'
import { mockTimeline } from '../../utils/mock'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '审核详情' },
  record: { type: Object, default: null },
  kind: { type: String, default: 'item' },
  timeline: { type: Array, default: () => mockTimeline },
})
const emit = defineEmits(['update:modelValue', 'approve', 'reject', 'needMore', 'remove'])

const remark = ref('')

const close = () => emit('update:modelValue', false)
const requireRemark = async (action, label) => {
  if (!remark.value.trim()) return ElMessage.warning(`${label}原因不能为空`)
  emit(action, { ...props.record, remark: remark.value })
}
const approve = async () => {
  await ElMessageBox.confirm('确认通过该审核？', '二次确认', { type: 'warning' })
  emit('approve', props.record)
}
</script>

<template>
  <el-drawer :model-value="modelValue" :title="title" size="520px" @close="close">
    <template v-if="record">
      <section class="drawer-section">
        <div class="drawer-title">
          <h3>{{ record.title || record.itemTitle || record.applicantName }}</h3>
          <StatusTag :status="record.status" :kind="kind" />
        </div>
        <p class="muted">{{ record.categoryName || record.applicantPhone }} · {{ record.location || record.lostLocation }}</p>
      </section>

      <section class="drawer-section info-grid">
        <span>发布人</span><strong>{{ record.publisherName || record.publisherId || '-' }}</strong>
        <span>申请人</span><strong>{{ record.applicantName || '-' }}</strong>
        <span>提交时间</span><strong>{{ formatDate(record.createTime) }}</strong>
        <span>说明</span><strong>{{ record.description || record.featureDesc || record.claimDesc || '-' }}</strong>
      </section>

      <section class="drawer-section">
        <h4>疑似重复 / 证明材料</h4>
        <div class="duplicate-card">系统将基于分类、地点、时间、标题关键词展示相似信息。当前演示数据无高风险重复。</div>
      </section>

      <section class="drawer-section">
        <h4>状态时间线</h4>
        <TimelineLog :logs="timeline" />
      </section>

      <section class="drawer-section">
        <el-input v-model="remark" type="textarea" :rows="3" placeholder="驳回、补充或下架原因" />
      </section>
    </template>

    <template #footer>
      <div class="drawer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button v-if="kind === 'claim'" type="warning" @click="requireRemark('needMore', '补充说明')">要求补充</el-button>
        <el-button type="danger" @click="requireRemark('reject', '驳回')">驳回</el-button>
        <el-button type="primary" @click="approve">通过</el-button>
      </div>
    </template>
  </el-drawer>
</template>
