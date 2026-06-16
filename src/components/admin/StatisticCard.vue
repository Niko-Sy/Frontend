<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'DataLine' },
  duration: { type: Number, default: 420 },
})

const displayValue = ref(0)
const frameId = ref(0)

const targetValue = computed(() => {
  const next = Number(props.value ?? 0)
  return Number.isFinite(next) ? next : 0
})

const animateTo = (nextValue) => {
  cancelAnimationFrame(frameId.value)
  const startValue = Number(displayValue.value) || 0
  const startedAt = performance.now()
  const duration = Math.min(Math.max(props.duration, 300), 500)

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(startValue + (nextValue - startValue) * eased)
    if (progress < 1) frameId.value = requestAnimationFrame(tick)
  }

  frameId.value = requestAnimationFrame(tick)
}

watch(targetValue, animateTo, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(frameId.value))
</script>

<template>
  <article class="stat-card dashboard-metric">
    <div class="metric-head">
      <span>{{ label }}</span>
      <div class="stat-icon"><el-icon><component :is="icon" /></el-icon></div>
    </div>
    <strong>{{ displayValue }}</strong>
    <small v-if="hint">{{ hint }}</small>
  </article>
</template>
