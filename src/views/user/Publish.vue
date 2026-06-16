<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '../../components/common/PageContainer.vue'
import ItemCard from '../../components/item/ItemCard.vue'
import { createItem, findSimilarItems } from '../../api/item'
import { uploadFiles } from '../../api/file'
import { useAppStore } from '../../store/app'
import { validatePublish } from '../../utils/validate'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const active = ref(0)
const submitting = ref(false)
const similar = ref([])
const fileList = ref([])
const form = reactive({
  itemType: route.query.type || 'LOST',
  title: '',
  categoryId: '',
  location: '',
  eventTime: '',
  description: '',
  contactInfo: '',
  isPublicContact: 0,
  expireDays: 30,
  remark: '',
  imageUrls: [],
})

const previewItem = computed(() => ({
  id: 'preview',
  ...form,
  categoryName: appStore.categories.find((cat) => cat.id === form.categoryId)?.categoryName || '未选择分类',
  status: 'PENDING_REVIEW',
  expireTime: `${form.expireDays} 天有效`,
  viewCount: 0,
  claimCount: 0,
  publisherName: '我',
  coverImage: form.imageUrls?.[0] || '',
}))

const next = () => {
  if (active.value === 0 && !form.itemType) return ElMessage.warning('请选择发布类型')
  if (active.value === 1) {
    const errors = validatePublish({ ...form, contactInfo: 'placeholder', expireDays: 1 })
    const first = errors.find((text) => !text.includes('联系方式') && !text.includes('有效期'))
    if (first) return ElMessage.warning(first)
  }
  if (active.value === 2 && !form.contactInfo.trim()) return ElMessage.warning('请填写联系方式')
  active.value += 1
}

const checkSimilar = async () => {
  if (!form.title || !form.categoryId || !form.location) return
  try {
    similar.value = await findSimilarItems({ title: form.title, categoryId: form.categoryId, location: form.location, itemType: form.itemType })
  } catch {
    similar.value = []
  }
}

const beforeUpload = (file) => {
  const validType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  const validSize = file.size / 1024 / 1024 <= 5
  if (!validType) ElMessage.warning('仅支持 jpg、jpeg、png 图片')
  if (!validSize) ElMessage.warning('单张图片不能超过 5MB')
  return validType && validSize
}

const submit = async () => {
  const errors = validatePublish(form)
  if (errors.length) return ElMessage.warning(errors[0])
  await ElMessageBox.confirm('确认提交发布信息？提交后将进入管理员审核。', '发布确认', { type: 'info' })
  submitting.value = true
  try {
    const files = fileList.value.map((file) => file.raw).filter(Boolean)
    if (files.length) form.imageUrls = await uploadFiles(files)
    await createItem({
      itemType: form.itemType,
      title: form.title,
      categoryId: form.categoryId,
      description: form.description,
      location: form.location,
      eventTime: form.eventTime,
      contactInfo: form.contactInfo,
      isPublicContact: form.isPublicContact,
      expireDays: form.expireDays,
      remark: form.remark,
      imageUrls: form.imageUrls,
    })
    ElMessage.success('发布成功，等待管理员审核')
    router.push('/my/items')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => appStore.loadCategories())
</script>

<template>
  <PageContainer title="发布信息" subtitle="四步完成发布，系统会提示可能重复的信息。">
    <div class="publish-layout">
      <el-card class="publish-card" shadow="never">
        <el-steps :active="active" finish-status="success" align-center>
          <el-step title="选择类型" />
          <el-step title="填写信息" />
          <el-step title="联系方式" />
          <el-step title="预览提交" />
        </el-steps>

        <div v-if="active === 0" class="type-choice">
          <button type="button" :class="{ active: form.itemType === 'LOST' }" @click="form.itemType = 'LOST'">
            <strong>我丢失了物品</strong>
            <span>发布失物信息，等待同学提供线索。</span>
          </button>
          <button type="button" :class="{ active: form.itemType === 'FOUND' }" @click="form.itemType = 'FOUND'">
            <strong>我捡到了物品</strong>
            <span>发布拾物信息，等待失主提交认领。</span>
          </button>
        </div>

        <el-form v-else-if="active === 1" class="form-grid" label-position="top">
          <el-form-item label="物品名称"><el-input v-model="form.title" maxlength="50" show-word-limit @blur="checkSimilar" /></el-form-item>
          <el-form-item label="物品分类">
            <el-select v-model="form.categoryId" placeholder="请选择" @change="checkSimilar">
              <el-option v-for="cat in appStore.categories" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="form.itemType === 'LOST' ? '丢失地点' : '拾取地点'"><el-input v-model="form.location" @blur="checkSimilar" /></el-form-item>
          <el-form-item :label="form.itemType === 'LOST' ? '丢失时间' : '拾取时间'">
            <el-date-picker v-model="form.eventTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
          <el-form-item class="wide" label="详细描述"><el-input v-model="form.description" type="textarea" :rows="5" maxlength="500" show-word-limit /></el-form-item>
          <el-form-item class="wide" label="图片上传">
            <el-upload v-model:file-list="fileList" list-type="picture-card" :auto-upload="false" :limit="3" :before-upload="beforeUpload">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-alert v-if="similar.length" class="wide" type="warning" show-icon :closable="false" title="发现可能相似的信息，请确认不是重复发布。" />
        </el-form>

        <el-form v-else-if="active === 2" class="form-grid" label-position="top">
          <el-form-item label="联系方式"><el-input v-model="form.contactInfo" placeholder="手机号、邮箱或微信号至少一种" /></el-form-item>
          <el-form-item label="是否公开联系方式">
            <el-switch v-model="form.isPublicContact" :active-value="1" :inactive-value="0" active-text="公开" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="有效期">
            <el-radio-group v-model="form.expireDays">
              <el-radio-button :label="7">7 天</el-radio-button>
              <el-radio-button :label="15">15 天</el-radio-button>
              <el-radio-button :label="30">30 天</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item class="wide" label="备注说明"><el-input v-model="form.remark" type="textarea" :rows="3" /></el-form-item>
        </el-form>

        <div v-else class="preview-layout">
          <ItemCard :item="previewItem" />
          <el-card shadow="never">
            <h3>提交后状态</h3>
            <p>信息将进入待审核，管理员通过后公开展示。联系方式默认受保护。</p>
          </el-card>
        </div>

        <div class="step-actions">
          <el-button :disabled="active === 0" @click="active -= 1">上一步</el-button>
          <el-button v-if="active < 3" type="primary" @click="next">下一步</el-button>
          <el-button v-else type="primary" :loading="submitting" @click="submit">确认提交</el-button>
        </div>
      </el-card>

      <aside class="publish-aside glass-panel">
        <h3>发布预览</h3>
        <ItemCard :item="previewItem" dense />
        <p>提交后会进入管理员审核，通过后才会出现在大厅中。</p>
      </aside>
    </div>
  </PageContainer>
</template>
