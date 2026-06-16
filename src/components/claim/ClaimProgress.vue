<script setup>
const props = defineProps({
  status: { type: String, default: 'PENDING' },
})

const activeMap = {
  PENDING: 1,
  NEED_MORE: 1,
  APPROVED: 2,
  REJECTED: 1,
  INVALID: 1,
  COMPLETED: 4,
}
</script>

<template>
  <el-steps :active="activeMap[props.status] || 1" finish-status="success" simple>
    <el-step title="提交申请" />
    <el-step title="管理员审核" />
    <el-step title="预约交接" />
    <el-step title="完成交接" />
  </el-steps>
</template>
