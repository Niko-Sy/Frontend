<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createClaim } from '../../api/claim'
import { validateClaim } from '../../utils/validate'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'success'])

const submitting = ref(false)
const form = reactive({
  lostTime: '',
  lostLocation: '',
  featureDesc: '',
  proofInfo: '',
  applicantPhone: '',
  evidenceUrls: [],
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.lostLocation = props.item?.location || ''
      form.applicantPhone = ''
    }
  },
)

const close = () => emit('update:modelValue', false)

const submit = async () => {
  const errors = validateClaim(form)
  if (errors.length) return ElMessage.warning(errors[0])
  submitting.value = true
  try {
    await createClaim(props.item.id, { ...form, claimDesc: form.featureDesc })
    ElMessage.success('申请已提交，请等待管理员审核')
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
  <el-dialog :model-value="modelValue" title="提交认领申请" width="560px" class="claim-dialog" @close="close">
    <div v-if="item" class="claim-summary">
      <strong>{{ item.title }}</strong>
      <span>{{ item.categoryName }} · {{ item.location }}</span>
    </div>
    <el-form label-position="top">
      <el-form-item label="丢失时间">
        <el-date-picker v-model="form.lostTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择丢失时间" />
      </el-form-item>
      <el-form-item label="丢失地点">
        <el-input v-model="form.lostLocation" placeholder="例如：图书馆二楼" />
      </el-form-item>
      <el-form-item label="物品特征说明">
        <el-input v-model="form.featureDesc" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请描述只有失主清楚的特征，不少于 10 个字" />
      </el-form-item>
      <el-form-item label="证明信息">
        <el-input v-model="form.proofInfo" placeholder="可填写购买记录、照片、编号等信息" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.applicantPhone" placeholder="请输入手机号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">提交申请</el-button>
    </template>
  </el-dialog>
</template>
