<template>
  <div v-if="detail">
    <el-page-header content="复核详情与处置" @back="$router.push('/admin/review')" class="ph" />

    <div class="layout">
      <!-- 左栏：证据 -->
      <div class="left">
        <el-card>
          <template #header>原始内容</template>
          <p class="raw">{{ detail.content }}</p>
          <el-divider />
          <p class="meta"><b>归一化结果：</b>{{ detail.normalized }}</p>
          <p class="meta"><b>触发原因：</b>{{ detail.trigger }}</p>
        </el-card>

        <el-card class="mt">
          <template #header>证据链时间线</template>
          <el-timeline>
            <el-timeline-item v-for="e in detail.evidence" :key="e.layer" :timestamp="e.time">
              <b>{{ e.layer }}</b>：{{ e.result }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <!-- 右栏：处置 -->
      <div class="right">
        <el-card>
          <template #header>处置结论</template>
          <el-radio-group v-model="conclusion">
            <el-radio value="passed">放行</el-radio>
            <el-radio value="remind">提醒修改</el-radio>
            <el-radio value="blocked">拦截</el-radio>
            <el-radio value="recheck">维持待复核</el-radio>
          </el-radio-group>
          <el-form label-position="top" class="mt">
            <el-form-item label="处置理由（将展示给用户，需类别化表述，必填）">
              <el-input v-model="reason" type="textarea" :rows="3" placeholder="请填写处置理由" />
            </el-form-item>
            <el-checkbox v-model="writeBack">处置结论回写词条库（新增规则将进入“待验证”）</el-checkbox>
          </el-form>
          <el-button type="primary" :loading="submitting" @click="submit">提交结论</el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const detail = ref(null)
const conclusion = ref('passed')
const reason = ref('')
const writeBack = ref(false)
const submitting = ref(false)

onMounted(async () => {
  detail.value = await api.getReviewDetail(route.params.id)
})

async function submit() {
  if (!reason.value.trim()) {
    ElMessage.warning('请填写处置理由')
    return
  }
  submitting.value = true
  await api.submitReview({ id: detail.value.id, conclusion: conclusion.value, reason: reason.value })
  submitting.value = false
  ElMessage.success('结论已提交并通知作者，已写入审核日志')
  if (writeBack.value) ElMessage.info('已生成待验证词条，回归通过后启用')
  router.push('/admin/review')
}
</script>

<style scoped>
.ph {
  margin-bottom: 16px;
}
.layout {
  display: flex;
  gap: 16px;
}
.left {
  flex: 1.4;
}
.right {
  flex: 1;
}
.mt {
  margin-top: 16px;
}
.raw {
  white-space: pre-wrap;
  margin: 0;
}
.meta {
  color: #4b5563;
  margin: 4px 0;
}
</style>
