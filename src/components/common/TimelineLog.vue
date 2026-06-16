<script setup>
defineProps({
  logs: { type: Array, default: () => [] },
})
</script>

<template>
  <el-timeline class="timeline-log">
    <el-timeline-item
      v-for="log in logs"
      :key="log.id || log.title"
      :timestamp="log.createTime"
      :type="log.status === 'DONE' || log.status === 'SUCCESS' ? 'success' : log.status === 'CURRENT' ? 'primary' : 'info'"
    >
      <strong>{{ log.title || log.newStatus || log.operation }}</strong>
      <p>{{ log.remark || log.operatorName || log.module || '状态更新' }}</p>
    </el-timeline-item>
  </el-timeline>
</template>
