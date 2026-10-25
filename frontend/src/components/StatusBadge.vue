<template>
  <!-- 审核状态徽标：颜色 + 文字 + 图标 三重标识，颜色不作为唯一区分手段 -->
  <span
    class="status-badge"
    :style="{ backgroundColor: status.color + '1a', color: status.color, borderColor: status.color + '55' }"
  >
    <el-icon v-if="icon" :size="12"><component :is="icon" /></el-icon>
    {{ status.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { AUDIT_STATUS } from '@/router'

const props = defineProps({
  // 状态键：pending / passed / remind / blocked / recheck / pending_retry / restricted
  status: { type: String, required: true },
  showIcon: { type: Boolean, default: true },
})

const ICONS = {
  pending: 'Clock',
  passed: 'CircleCheck',
  remind: 'Warning',
  blocked: 'CircleClose',
  recheck: 'QuestionFilled',
  pending_retry: 'Timer',
  restricted: 'Lock',
}

const status = computed(() => AUDIT_STATUS[props.status] || AUDIT_STATUS.pending)
const icon = computed(() => (props.showIcon ? ICONS[props.status] || 'InfoFilled' : ''))
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}
</style>
