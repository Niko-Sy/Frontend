export const ITEM_STATUS = {
  DRAFT: ['草稿', 'info'],
  PENDING_REVIEW: ['待审核', 'warning'],
  REJECTED: ['已驳回', 'danger'],
  AVAILABLE: ['待处理', 'primary'],
  CLAIMING: ['认领中', 'purple'],
  WAIT_HANDOVER: ['待交接', 'warning'],
  CLAIMED: ['已认领', 'success'],
  EXPIRED: ['已过期', 'danger'],
  REMOVED: ['已下架', 'info'],
}

export const CLAIM_STATUS = {
  PENDING: ['待审核', 'warning'],
  NEED_MORE: ['待补充', 'warning'],
  APPROVED: ['已通过', 'success'],
  REJECTED: ['已驳回', 'danger'],
  INVALID: ['已失效', 'info'],
  COMPLETED: ['已完成', 'success'],
  CANCELED: ['已取消', 'info'],
  CANCELLED: ['已取消', 'info'],
}

export const HANDOVER_STATUS = {
  WAIT_CONFIRM: ['待确认', 'warning'],
  APPOINTED: ['已预约', 'primary'],
  COMPLETED: ['已完成', 'success'],
  CANCELED: ['已取消', 'info'],
  CANCELLED: ['已取消', 'info'],
  EXPIRED: ['已超时', 'danger'],
}

export const USER_STATUS = {
  0: ['禁用', 'danger'],
  1: ['启用', 'success'],
}

export const typeText = (type) => (type === 'LOST' ? '失物' : '拾物')

export const statusMeta = (status, kind = 'item') => {
  const source = kind === 'claim' ? CLAIM_STATUS : kind === 'handover' ? HANDOVER_STATUS : ITEM_STATUS
  const entry = source[status] || [status || '未知', 'info']
  return { label: entry[0], tone: entry[1] }
}
