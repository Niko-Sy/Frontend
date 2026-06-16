<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="stats-grid">
    <component :is="item.to ? 'RouterLink' : 'article'" v-for="item in items" :key="item.label" class="stat-tile" v-bind="item.to ? { to: item.to } : {}">
      <span class="stat-icon" :class="item.tone || 'primary'">
        <el-icon><component :is="item.icon || 'DataLine'" /></el-icon>
      </span>
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
      <small v-if="item.hint">{{ item.hint }}</small>
    </component>
  </section>
</template>
