<template>
  <div>
    <header class="topbar">
      <div class="page-container topbar-inner">
        <el-button text @click="$router.push('/home')"><el-icon><Back /></el-icon> 返回首页</el-button>
        <span class="crumb">发布新帖子</span>
      </div>
    </header>

    <div class="page-container layout">
      <main class="form-wrap">
        <el-form label-position="top">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题（20 字以内）" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="正文">
            <el-input v-model="form.content" type="textarea" :rows="8" placeholder="分享你的内容" maxlength="2000" show-word-limit />
          </el-form-item>
          <el-form-item label="图片（可选）">
            <el-upload action="#" :auto-upload="false" list-type="picture-card" :limit="1">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-button type="primary" :loading="publishing" @click="publish">发布</el-button>
        </el-form>
      </main>

      <aside class="aside">
        <el-card>
          <template #header>发布须知</template>
          <p class="note">内容发布后将自动进行审核。请勿发布违法违规、低俗及引导性内容。</p>
        </el-card>
        <el-card>
          <template #header>审核反馈</template>
          <ul class="note">
            <li>审核中：内容暂不对他人可见。</li>
            <li>提醒修改：可回填原文修改后重新提交。</li>
            <li>拦截：不予发表，可申诉。</li>
          </ul>
        </el-card>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'

const router = useRouter()
const form = reactive({ title: '', content: '' })
const publishing = ref(false)

async function publish() {
  if (!form.title.trim() || !form.content.trim()) {
    ElMessage.warning('标题和正文不能为空')
    return
  }
  publishing.value = true
  try {
    const { audit } = await api.createPost({ ...form })
    publishing.value = false

    // 按审核结果三种承载形式回显（4.3.5 / 4.3.6）
    if (audit.status === 'blocked') {
      await ElMessageBox.alert(audit.reason + '。如对结果有异议可申诉。', '内容不予发表', {
        confirmButtonText: '我知道了',
        cancelButtonText: '我要申诉',
        showCancelButton: true,
        type: 'error',
      })
      if (false) router.push('/me/messages') // 预留：申诉入口
    } else if (audit.status === 'remind') {
      await ElMessageBox.confirm('内容可能违规，请修改后重新提交。是否回填原文以便修改？', '提醒修改', {
        confirmButtonText: '返回修改',
        cancelButtonText: '删除',
        type: 'warning',
      })
        .then(() => {
          form.content = form.content
        })
        .catch(() => {})
    } else if (audit.status === 'recheck') {
      ElMessage.info('内容已提交，正在人工复核，预计 24 小时内出结果。')
      router.push('/home')
    } else {
      ElMessage.success('发布成功，已通过审核')
      router.push('/home')
    }
  } catch (e) {
    publishing.value = false
    ElMessage.error(e.message || '发布失败，已保留你的内容')
  }
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
.form-wrap {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}
.aside {
  width: 280px;
}
.note {
  color: #4b5563;
  font-size: 13px;
  margin: 0;
}
.aside ul.note {
  padding-left: 18px;
  line-height: 1.9;
}
</style>
