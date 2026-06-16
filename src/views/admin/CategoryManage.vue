<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '../../components/common/StatusTag.vue'
import { createCategory, deleteCategory, disableCategory, enableCategory, listAdminCategories, updateCategory } from '../../api/adminCategory'
import { mockCategories } from '../../utils/mock'
import { formatDate } from '../../utils/format'
import { isFallbackableError, normalizeCategories, normalizeCategory } from '../../utils/normalize'

const records = ref([])
const dialog = ref(false)
const form = reactive({ id: null, categoryName: '', icon: '', sortOrder: 1, status: 1 })

const load = async () => {
  try {
    records.value = normalizeCategories(await listAdminCategories())
  } catch (error) {
    records.value = isFallbackableError(error) ? normalizeCategories(mockCategories) : []
  }
}

const open = (row = null) => {
  const next = row ? normalizeCategory(row) : { id: null, categoryName: '', icon: '', sortOrder: 1, status: 1 }
  Object.assign(form, next)
  dialog.value = true
}

const save = async () => {
  if (!form.categoryName.trim()) return ElMessage.warning('分类名称不能为空')
  const payload = {
    categoryName: form.categoryName.trim(),
    icon: form.icon || '',
    sortOrder: form.sortOrder ?? 0,
  }
  try {
    form.id ? await updateCategory(form.id, payload) : await createCategory(payload)
    ElMessage.success('保存成功')
    dialog.value = false
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const toggle = async (row) => {
  try {
    row.status ? await disableCategory(row.id) : await enableCategory(row.id)
    ElMessage.success('操作成功')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const remove = async (row) => {
  await ElMessageBox.confirm(`确认删除分类「${row.categoryName}」？`, '二次确认', { type: 'warning' })
  try {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <section class="admin-page">
    <div class="admin-page-head">
      <div>
        <h1>分类管理</h1>
        <p>维护发布时可选的物品分类</p>
      </div>
      <el-button type="primary" @click="open()">新增分类</el-button>
    </div>
    <el-table :data="records">
      <el-table-column prop="categoryName" label="分类名称" />
      <el-table-column prop="icon" label="图标" />
      <el-table-column prop="sortOrder" label="排序" />
      <el-table-column label="状态"><template #default="{ row }"><StatusTag :status="row.status" kind="user" /></template></el-table-column>
      <el-table-column prop="itemCount" label="关联物品数" />
      <el-table-column label="创建时间"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">编辑</el-button>
          <el-button link @click="toggle(row)">{{ row.status ? '禁用' : '启用' }}</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialog" title="分类表单" width="420px">
      <el-form label-position="top">
        <el-form-item label="分类名称"><el-input v-model="form.categoryName" /></el-form-item>
        <el-form-item label="图标标识"><el-input v-model="form.icon" placeholder="如 phone、book-open、key" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>
