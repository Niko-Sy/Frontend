<script setup>
defineProps({
  title: { type: String, default: '暂时没有数据' },
  description: { type: String, default: '换个筛选条件试试，或者稍后再回来看看。' },
  actionText: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <el-icon><Search /></el-icon>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <el-button v-if="actionText" type="primary" round @click="$emit('action')">{{ actionText }}</el-button>
  </div>
</template>
