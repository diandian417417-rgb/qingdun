<template>
  <div>
    <header class="topbar">
      <div class="page-container topbar-inner">
        <el-button text @click="$router.push('/home')"><el-icon><Back /></el-icon> 返回首页</el-button>
        <span class="crumb">消息与申诉</span>
      </div>
    </header>

    <div class="page-container layout">
      <!-- 左侧：消息列表 -->
      <main class="list">
        <el-card>
          <template #header>消息</template>
          <div v-for="m in messages" :key="m.id" class="msg" :class="{ unread: !m.read }">
            <div class="msg-head">
              <span class="tag">{{ m.type }}</span>
              <span v-if="!m.read" class="dot" />
              <span class="time">{{ m.time }}</span>
            </div>
            <p class="msg-text">{{ m.title }}</p>
          </div>
          <el-empty v-if="!messages.length" description="暂无消息" :image-size="60" />
        </el-card>
      </main>

      <!-- 右侧：申诉表单 -->
      <aside class="appeal">
        <el-card>
          <template #header>发起申诉</template>
          <el-form label-position="top">
            <el-form-item label="被处置内容">
              <el-input :model-value="appeal.target || '（自动带出最近一条被处置内容）'" disabled />
            </el-form-item>
            <el-form-item label="申诉理由（300 字以内）">
              <el-input v-model="appeal.reason" type="textarea" :rows="6" maxlength="300" show-word-limit />
            </el-form-item>
            <el-button type="primary" :loading="submitting" @click="submit">提交申诉</el-button>
          </el-form>

          <div class="progress">
            <el-steps :active="1" align-center finish-status="success">
              <el-step title="已提交" />
              <el-step title="人工复核" />
              <el-step title="复核完成" />
            </el-steps>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '@/api'

const messages = ref([])
const appeal = ref({ target: '', reason: '' })
const submitting = ref(false)

onMounted(async () => {
  messages.value = await api.getMessages()
})

function submit() {
  if (!appeal.value.reason.trim()) {
    ElMessage.warning('请填写申诉理由')
    return
  }
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    ElMessage.success('申诉已提交，将进入人工复核')
    appeal.value.reason = ''
  }, 400)
}
</script>

<style scoped>
.topbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.topbar-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 52px;
}
.crumb {
  color: #6b7280;
}
.layout {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}
.list {
  flex: 1;
}
.msg {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}
.msg.unread .msg-text {
  font-weight: 600;
}
.msg-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tag {
  color: var(--qd-primary);
  font-size: 12px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d14343;
}
.time {
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
}
.msg-text {
  margin: 6px 0 0;
}
.appeal {
  width: 340px;
}
.progress {
  margin-top: 20px;
}
</style>
