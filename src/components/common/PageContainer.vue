<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <section class="page-container" :class="{ compact }">
    <div v-if="title || subtitle || $slots.actions" class="page-head">
      <div>
        <h1 v-if="title">{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>
