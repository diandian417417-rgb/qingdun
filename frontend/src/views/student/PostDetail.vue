<template>
  <div>
    <header class="topbar">
      <div class="page-container topbar-inner">
        <el-button text @click="$router.push('/home')"><el-icon><Back /></el-icon> 返回首页</el-button>
        <span class="crumb">帖子详情</span>
      </div>
    </header>

    <div class="page-container layout">
      <main class="content">
        <el-card v-if="post">
          <div class="head">
            <span class="author">{{ post.author }}</span>
            <span class="time">{{ post.createdAt }}</span>
            <StatusBadge :status="post.status" class="badge" />
          </div>
          <h2>{{ post.title }}</h2>
          <p class="body">{{ post.content }}</p>
          <div class="foot">
            <el-button text><el-icon><Pointer /></el-icon> {{ post.likeCount }} 赞</el-button>
            <el-button text @click="report"><el-icon><Warning /></el-icon> 举报</el-button>
          </div>
        </el-card>

        <!-- 评论区：与正文共用同一条审核链路 -->
        <el-card class="comments">
          <template #header>评论（{{ comments.length }}）</template>
          <div v-for="c in comments" :key="c.id" class="comment">
            <div class="c-head">
              <span class="author">{{ c.author }}</span>
              <span class="time">{{ c.createdAt }}</span>
              <!-- 被拦截的评论仅本人可见；这里用徽标占位提示 -->
              <StatusBadge v-if="c.status === 'blocked'" :status="c.status" class="badge" />
            </div>
            <p class="c-body">{{ c.content }}</p>
          </div>
          <el-empty v-if="!comments.length" description="还没有评论" :image-size="60" />

          <div class="comment-box">
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="2"
              placeholder="友善评论，内容将自动审核"
            />
            <div class="comment-actions">
              <el-button type="primary" :loading="submitting" @click="submitComment">发表评论</el-button>
            </div>
            <el-alert
              v-if="commentResult && commentResult.status !== 'passed'"
              :title="commentResult.reason"
              :type="commentResult.status === 'blocked' ? 'error' : 'warning'"
              :closable="false"
              show-icon
            />
          </div>
        </el-card>
      </main>

      <!-- 右侧“本篇审核信息”：仅作者与审核员可见 -->
      <aside class="aside">
        <el-card>
          <template #header>本篇审核信息</template>
          <div v-if="post">
            <p class="meta">内容编号：#{{ post.id }}</p>
            <p class="meta">审核环节：文本规则 / AI 语义</p>
            <p class="meta">处置结果：{{ post.auditReason || '正常放行' }}</p>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const post = ref(null)
const comments = ref([])
const commentText = ref('')
const submitting = ref(false)
const commentResult = ref(null)

onMounted(async () => {
  const id = route.params.id
  post.value = await api.getPost(id)
  comments.value = await api.getComments(id)
})

async function submitComment() {
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    const { audit } = await api.createComment({ postId: post.value.id, content: commentText.value })
    submitting.value = false
    commentResult.value = audit
    if (audit.status === 'passed') {
      commentText.value = ''
      comments.value = await api.getComments(post.value.id)
      ElMessage.success('评论已通过审核并发布')
    } else if (audit.status === 'blocked') {
      ElMessage.error('评论不予发表：' + audit.reason)
    } else if (audit.status === 'remind') {
      ElMessage.warning('评论可能违规，请修改后重新提交')
    } else {
      ElMessage.info('评论已提交，正在人工复核')
    }
  } catch (e) {
    submitting.value = false
    ElMessage.error(e.message || '评论失败')
  }
}

function report() {
  ElMessageBox.confirm('确认举报该内容？举报后将转为人工复核。', '举报内容', {
    confirmButtonText: '确认举报',
    type: 'warning',
  })
    .then(() => ElMessage.success('已提交举报，进入人工复核'))
    .catch(() => {})
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
.content {
  flex: 1;
}
.head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author {
  font-weight: 600;
}
.time {
  color: #9ca3af;
  font-size: 12px;
}
.badge {
  margin-left: auto;
}
.body {
  color: #374151;
  white-space: pre-wrap;
}
.foot {
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}
.comments {
  margin-top: 16px;
}
.comment {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.c-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.c-body {
  margin: 6px 0 0;
  color: #4b5563;
}
.comment-box {
  margin-top: 16px;
}
.comment-actions {
  margin-top: 8px;
  text-align: right;
}
.aside {
  width: 280px;
}
.meta {
  margin: 0 0 8px;
  color: #4b5563;
  font-size: 13px;
}
</style>
