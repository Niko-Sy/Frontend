<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  noHeader: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
  headerMode: {
    type: String,
    default: 'compact',
    validator: (value) => ['none', 'compact', 'standard'].includes(value),
  },
})

const slots = useSlots()
const resolvedHeaderMode = computed(() => (props.noHeader ? 'none' : props.headerMode))
const showHeader = computed(() => resolvedHeaderMode.value !== 'none' && (props.eyebrow || props.title || props.subtitle || slots.actions))
const isCompact = computed(() => props.compact || resolvedHeaderMode.value === 'compact')
</script>

<template>
  <section class="page-container" :class="{ compact: isCompact, wide }">
    <div v-if="showHeader" class="page-head" :class="`page-head--${resolvedHeaderMode}`">
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
