<script setup>
defineProps({
  allowed: { type: Boolean, default: true },
  reason: { type: String, default: '当前状态不可操作' },
  type: { type: String, default: 'primary' },
})
defineEmits(['click'])
</script>

<template>
  <el-tooltip :disabled="allowed" :content="reason">
    <span>
      <el-button :type="type" :disabled="!allowed" v-bind="$attrs" @click="$emit('click')">
        <slot />
      </el-button>
    </span>
  </el-tooltip>
</template>
