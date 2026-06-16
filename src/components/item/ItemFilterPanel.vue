<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  statusOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const defaults = { keyword: '', categoryId: '', location: '', status: '', sortBy: '' }
const form = reactive({ ...defaults })

watch(
  () => props.modelValue,
  (value) => Object.assign(form, defaults, value || {}),
  { immediate: true, deep: true },
)

const update = () => emit('update:modelValue', { ...form })
const search = () => {
  update()
  emit('search', { ...form })
}
const reset = () => {
  Object.assign(form, defaults)
  update()
  emit('reset')
  emit('search', { ...form })
}
</script>

<template>
  <section class="filter-panel" aria-label="物品筛选">
    <el-input v-model="form.keyword" class="filter-keyword" clearable placeholder="关键词：物品名称、描述" @keyup.enter="search" @change="update">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="form.categoryId" clearable placeholder="分类" @change="update">
      <el-option v-for="cat in categories" :key="cat.id" :label="cat.categoryName || cat.name" :value="cat.id" />
    </el-select>
    <el-input v-model="form.location" clearable placeholder="地点" @keyup.enter="search" @change="update" />
    <el-select v-model="form.status" clearable placeholder="状态" @change="update">
      <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <el-select v-model="form.sortBy" placeholder="排序" @change="update">
      <el-option label="最新发布" value="" />
      <el-option label="发生时间" value="eventTime" />
      <el-option label="即将过期" value="expireSoon" />
    </el-select>
    <div class="filter-actions">
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
  </section>
</template>
