<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'DataLine' },
})
</script>

<template>
  <article class="stat-card">
    <div class="stat-icon"><el-icon><component :is="icon" /></el-icon></div>
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small v-if="hint">{{ hint }}</small>
    </div>
  </article>
</template>
