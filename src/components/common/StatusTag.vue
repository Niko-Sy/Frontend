<script setup>
import { computed } from 'vue'
import { statusMeta, USER_STATUS } from '../../utils/status'

const props = defineProps({
  status: { type: [String, Number], default: '' },
  kind: { type: String, default: 'item' },
  size: { type: String, default: 'default' },
})

const meta = computed(() => {
  if (props.kind === 'user') {
    const entry = USER_STATUS[props.status] || [props.status, 'info']
    return { label: entry[0], tone: entry[1] }
  }
  return statusMeta(props.status, props.kind)
})
</script>

<template>
  <span class="status-tag" :class="[meta.tone, size]" :title="meta.label">
    {{ meta.label }}
  </span>
</template>
