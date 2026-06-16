<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createClue } from '../../api/clue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'success'])

const submitting = ref(false)
const form = reactive({
  clueContent: '',
  contactInfo: '',
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.clueContent = ''
      form.contactInfo = ''
    }
  },
)

const close = () => emit('update:modelValue', false)

const submit = async () => {
  const clueContent = form.clueContent.trim()
  const contactInfo = form.contactInfo.trim()
  if (clueContent.length < 10) return ElMessage.warning('线索说明不少于 10 个字')
  if (!contactInfo) return ElMessage.warning('请填写联系方式')
  submitting.value = true
  try {
    await createClue(props.item.id, { clueContent, contactInfo })
    ElMessage.success('线索已提交，等待发布人处理')
    emit('success')
    close()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog :model-value="modelValue" title="提交线索" width="540px" @close="close">
    <div v-if="item" class="claim-summary">
      <strong>{{ item.title }}</strong>
      <span>{{ item.categoryName }} · {{ item.location }}</span>
    </div>
    <el-form label-position="top">
      <el-form-item label="线索说明">
        <el-input
          v-model="form.clueContent"
          type="textarea"
          :rows="5"
          maxlength="500"
          show-word-limit
          placeholder="请描述你看到、捡到或交给谁的信息，不少于 10 个字"
        />
      </el-form-item>
      <el-form-item label="联系方式">
        <el-input v-model="form.contactInfo" placeholder="手机号、邮箱或微信号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">提交线索</el-button>
    </template>
  </el-dialog>
</template>
