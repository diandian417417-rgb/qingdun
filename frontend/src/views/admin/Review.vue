<template>
  <el-card>
    <template #header>
      <div class="header">
        <span class="title">人工复核队列</span>
        <span class="hint">超 24 小时未处理条目高亮</span>
        <div class="filters">
          <el-select v-model="filterTrigger" placeholder="触发原因" clearable size="small" style="width: 160px">
            <el-option label="全部" value="" />
            <el-option v-for="t in triggers" :key="t" :label="t" :value="t" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索内容/作者" clearable size="small" style="width: 200px" :prefix-icon="Search" />
        </div>
      </div>
    </template>

    <el-table :data="filtered" empty-text="暂无待复核内容" :row-class-name="rowClass">
      <el-table-column prop="id" label="编号" width="90" />
      <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="110" />
      <el-table-column prop="trigger" label="触发原因" width="160" />
      <el-table-column prop="submitAt" label="提交时间" width="160" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="$router.push(`/admin/review/${row.id}`)">复核</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { api } from '@/api'

const queue = ref([])
const filterTrigger = ref('')
const keyword = ref('')
const triggers = ref([])

onMounted(async () => {
  queue.value = await api.getReviewQueue()
  triggers.value = [...new Set(queue.value.map((q) => q.trigger))]
})

const filtered = computed(() =>
  queue.value.filter((q) => {
    const matchTrigger = !filterTrigger.value || q.trigger === filterTrigger.value
    const kw = keyword.value.trim()
    const matchKw = !kw || q.content.includes(kw) || q.author.includes(kw)
    return matchTrigger && matchKw
  })
)

function rowClass({ row }) {
  return row.timeout ? 'timeout-row' : ''
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-weight: 600;
}
.hint {
  font-size: 12px;
  color: #d14343;
  font-weight: normal;
}
.filters {
  margin-left: auto;
  display: flex;
  gap: 10px;
}
:deep(.timeout-row) {
  background: #fdecec;
}
</style>
