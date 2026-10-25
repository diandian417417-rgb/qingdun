<template>
  <el-card>
    <el-tabs v-model="tab">
      <!-- 审核日志：只查不删，可溯源 -->
      <el-tab-pane label="审核日志" name="logs">
        <el-button size="small" class="add" @click="exportLogs">导出（仅查询，不提供删除）</el-button>
        <el-table :data="logs" empty-text="暂无日志">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="content" label="内容" min-width="180" show-overflow-tooltip />
          <el-table-column prop="layer" label="命中层级" width="120" />
          <el-table-column prop="rule" label="规则" width="130" />
          <el-table-column prop="result" label="处置结果" width="110" />
          <el-table-column prop="operator" label="处置人" width="110" />
        </el-table>
      </el-tab-pane>

      <!-- 用户风险：按违规次数与等级排序，可直接处置 -->
      <el-tab-pane label="用户风险" name="users">
        <el-table :data="users" empty-text="暂无用户">
          <el-table-column prop="username" label="账号" width="160" />
          <el-table-column prop="posts" label="发帖数" width="100" />
          <el-table-column prop="violations" label="违规次数" width="110" />
          <el-table-column prop="level" label="等级" width="100" />
          <el-table-column prop="risk" label="风险" width="100" />
          <el-table-column label="操作" width="140">
            <template #default="{ row }">
              <el-button v-if="row.level !== '受限'" size="small" type="danger" plain @click="restrict(row)">限流/封禁</el-button>
              <el-tag v-else type="danger" size="small">已受限</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 系统状态：服务可用性、队列积压、降级开关（二次确认） -->
      <el-tab-pane label="系统状态" name="system">
        <el-table :data="system.services" empty-text="暂无服务">
          <el-table-column prop="name" label="服务" width="200" />
          <el-table-column label="状态" width="160">
            <template #default="{ row }">
              <el-tag :type="row.status === '正常' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="sys-meta">
          <span>审核队列积压：{{ system.queueBacklog }} 条</span>
          <span>降级模式：{{ system.degradedMode ? '开启' : '关闭' }}</span>
        </div>
        <el-button type="warning" @click="toggleDegraded">
          {{ system.degradedMode ? '关闭降级模式' : '开启降级模式' }}
        </el-button>
        <el-alert
          v-if="system.degradedMode"
          title="当前处于降级模式：GLM 服务异常时自动切到本地规则全量拦截，存疑内容入队待补审。"
          type="warning"
          :closable="false"
          class="mt"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'

const tab = ref('logs')
const logs = ref([])
const users = ref([])
const system = ref({ services: [], queueBacklog: 0, degradedMode: false })

onMounted(async () => {
  logs.value = await api.getAuditLogs()
  users.value = await api.getUsers()
  system.value = await api.getSystem()
})

function exportLogs() {
  ElMessage.info('日志导出功能待接入后端（当前为模拟）')
}

function restrict(row) {
  ElMessageBox.confirm(`确认对用户 ${row.username} 执行限流/封禁？该操作影响其全部内容发布。`, '危险操作确认', {
    confirmButtonText: '确认处置',
    type: 'warning',
  })
    .then(() => {
      row.level = '受限'
      ElMessage.success('已执行处置')
    })
    .catch(() => {})
}

function toggleDegraded() {
  // 降级开关需二次确认
  ElMessageBox.confirm('开启降级模式后，GLM 异常时将自动启用本地规则全量拦截。是否继续？', '二次确认', {
    confirmButtonText: '确认',
    type: 'warning',
  })
    .then(() => {
      system.value.degradedMode = !system.value.degradedMode
      ElMessage.success('已更新，操作已记录')
    })
    .catch(() => {})
}
</script>

<style scoped>
.add {
  margin-bottom: 12px;
}
.sys-meta {
  display: flex;
  gap: 32px;
  margin: 16px 0;
  color: #4b5563;
}
.mt {
  margin-top: 12px;
}
</style>
