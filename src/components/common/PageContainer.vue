<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  noHeader: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
})
</script>

<template>
  <section class="page-container" :class="{ compact, wide }">
    <div v-if="!noHeader && (eyebrow || title || subtitle || $slots.actions)" class="page-head">
      <div>
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
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
