<template>
  <el-card>
    <template #header>规则配置</template>

    <el-tabs v-model="tab">
      <el-tab-pane label="敏感词库" name="words">
        <el-button type="primary" size="small" class="add" @click="addOpen = true">+ 新增词条</el-button>
        <el-table :data="rules" empty-text="暂无词条">
          <el-table-column prop="word" label="词条" min-width="120" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="level" label="级别" width="80" />
          <el-table-column prop="source" label="来源" width="120" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'warning'" size="small">
                {{ row.status === 'enabled' ? '已启用' : '待验证' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="110" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <!-- 规则“待验证后启用”：回归通过后才允许启用 -->
              <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="verify(row)">
                回归通过并启用
              </el-button>
              <span v-else class="enabled-text">已生效</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="归一化字典" name="normalize">
        <el-empty description="归一化字典（谐音/拆字/emoji 还原规则）开发中" :image-size="80" />
      </el-tab-pane>

      <el-tab-pane label="行为规则" name="behavior">
        <el-empty description="行为规则（频控/相似度）开发中" :image-size="80" />
      </el-tab-pane>
    </el-tabs>

    <!-- 新增词条弹窗：默认“待验证” -->
    <el-dialog v-model="addOpen" title="新增词条" width="480px">
      <el-form label-position="top">
        <el-form-item label="词条">
          <el-input v-model="form.word" placeholder="请输入词条" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option label="交易引导" value="交易引导" />
            <el-option label="广告引流" value="广告引流" />
            <el-option label="低俗内容" value="低俗内容" />
            <el-option label="政治敏感" value="政治敏感" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-radio-group v-model="form.level">
            <el-radio value="高">高</el-radio>
            <el-radio value="中">中</el-radio>
            <el-radio value="低">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert title="新增规则默认“待验证”，需回归验证通过后才能启用。" type="info" :closable="false" />
      </el-form>
      <template #footer>
        <el-button @click="addOpen = false">取消</el-button>
        <el-button type="primary" @click="addRule">提交（进入待验证）</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '@/api'

const tab = ref('words')
const rules = ref([])
const addOpen = ref(false)
const form = ref({ word: '', category: '', level: '高' })

onMounted(async () => {
  rules.value = await api.getRules()
})

async function addRule() {
  if (!form.value.word.trim()) {
    ElMessage.warning('请输入词条')
    return
  }
  const rule = await api.addRule(form.value)
  rules.value.unshift(rule)
  addOpen.value = false
  form.value = { word: '', category: '', level: '高' }
  ElMessage.success('已新增，进入待验证状态')
}

async function verify(row) {
  await api.verifyRule(row.id)
  row.status = 'enabled'
  ElMessage.success('回归通过，规则已启用')
}
</script>

<style scoped>
.add {
  margin-bottom: 12px;
}
.enabled-text {
  color: #9ca3af;
  font-size: 13px;
}
</style>
