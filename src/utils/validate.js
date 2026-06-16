export const phonePattern = /^1[3-9]\d{9}$/
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const required = (value, message = '该字段不能为空') => {
  if (value === undefined || value === null || String(value).trim() === '') return message
  return ''
}

export const lengthBetween = (value, min, max, label) => {
  const len = String(value || '').trim().length
  if (len < min || len > max) return `${label}需要为 ${min}-${max} 个字符`
  return ''
}

export const validatePublish = (form) => {
  const errors = [
    required(form.itemType, '请选择发布类型'),
    lengthBetween(form.title, 2, 50, '物品名称'),
    required(form.categoryId, '请选择物品分类'),
    lengthBetween(form.location, 2, 100, '发生地点'),
    required(form.eventTime, '请选择发生时间'),
    lengthBetween(form.description, 10, 500, '详细描述'),
    required(form.contactInfo, '请填写联系方式'),
    required(form.expireDays, '请选择有效期'),
  ].filter(Boolean)

  if (form.eventTime && new Date(form.eventTime).getTime() > Date.now()) {
    errors.push('发生时间不能晚于当前时间')
  }

  return errors
}

export const validateClaim = (form) => {
  return [
    required(form.lostTime, '请填写丢失时间'),
    required(form.lostLocation, '请填写丢失地点'),
    lengthBetween(form.featureDesc, 10, 500, '特征描述'),
    phonePattern.test(form.applicantPhone || '') ? '' : '请填写正确的联系电话',
  ].filter(Boolean)
}
