<template>
  <div>
    <!-- 顶栏：三个一级入口 + 发帖按钮；搜索框为后续扩展，本期仅保留入口 -->
    <header class="topbar">
      <div class="topbar-inner page-container">
        <div class="logo" @click="$router.push('/home')">
          <span class="logo-mark">青</span>青盾
        </div>

        <el-input
          class="search"
          :model-value="searchText"
          placeholder="搜索（后续版本开放）"
          disabled
          clearable
          :prefix-icon="Search"
        />

        <nav class="nav">
          <el-button text type="primary" @click="$router.push('/home')">首页</el-button>
          <el-button text @click="$router.push('/me/posts')">我的帖子</el-button>
          <el-button text @click="$router.push('/me/messages')">消息</el-button>
          <el-button type="primary" round @click="$router.push('/post/new')">+ 发帖</el-button>
          <el-dropdown @command="onUser">
            <span class="user">
              <span class="qd-avatar">{{ nickname.slice(0, 1) }}</span>
              {{ nickname }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="me">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </nav>
      </div>
    </header>

    <div class="page-container layout">
      <main class="feed">
        <div v-for="post in posts" :key="post.id" class="qd-card qd-card-hover post-card" @click="openPost(post.id)">
          <div class="post-head">
            <span class="qd-avatar">{{ post.author.slice(0, 1) }}</span>
            <div class="head-meta">
              <span class="author">{{ post.author }}</span>
              <span class="time">{{ post.createdAt }}</span>
            </div>
            <StatusBadge v-if="post.authorId === currentUser?.id" :status="post.status" class="badge" />
          </div>
          <h3 class="title">{{ post.title }}</h3>
          <p class="content">{{ post.content }}</p>
          <div class="post-foot">
            <span class="like" :class="{ liked: likedSet.has(post.id) }" @click.stop="toggleLike(post)">
              <el-icon><Pointer /></el-icon> {{ post.likeCount }}
            </span>
            <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
            <el-tag size="small" effect="plain" round class="tag">校园</el-tag>
          </div>
        </div>

        <el-empty v-if="!posts.length" description="还没有内容，去发第一帖吧">
          <el-button type="primary" @click="$router.push('/post/new')">去发帖</el-button>
        </el-empty>
      </main>

      <aside class="aside">
        <el-card shadow="never">
          <template #header><b>审核状态说明</b></template>
          <ul class="notice">
            <li><StatusBadge status="passed" />：内容公开可见</li>
            <li><StatusBadge status="pending" />：正在判定，暂不可见</li>
            <li><StatusBadge status="remind" />：请修改后重新提交</li>
            <li><StatusBadge status="blocked" />：不予发表</li>
            <li><StatusBadge status="recheck" />：人工复核中</li>
          </ul>
        </el-card>
        <el-card shadow="never" class="aside-card">
          <template #header><b>发布须知</b></template>
          <p class="notice-text">本平台内容发布后会自动进行多维度审核。请勿发布违法违规、低俗及引导性内容。</p>
        </el-card>
      </aside>
    </div>

    <el-button class="fab" type="primary" circle @click="$router.push('/post/new')">
      <el-icon :size="22"><EditPen /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { api } from '@/api'
import { currentUser, logoutStudent } from '@/composables/useAuth'
import StatusBadge from '@/components/StatusBadge.vue'

const router = useRouter()
const posts = ref([])
const likedSet = ref(new Set()) // 本地记录已点赞的帖子
const searchText = ref('') // 搜索为后续扩展，本期仅保留入口位置

const nickname = computed(() => currentUser.value?.nickname || '未登录')

onMounted(async () => {
  posts.value = await api.getPosts()
})

function openPost(id) {
  router.push(`/post/${id}`)
}

function toggleLike(post) {
  if (likedSet.value.has(post.id)) {
    likedSet.value.delete(post.id)
    post.likeCount -= 1
  } else {
    likedSet.value.add(post.id)
    post.likeCount += 1
  }
}

function onUser(cmd) {
  if (cmd === 'me') router.push('/me/posts')
  if (cmd === 'logout') {
    logoutStudent()
    router.push('/login')
  }
}
</script>

<style scoped>
.topbar {
  background: #fff;
  border-bottom: 1px solid var(--qd-border);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.04);
}
.topbar-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 60px;
}
.logo {
  font-size: 19px;
  font-weight: 700;
  color: var(--qd-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--qd-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.search {
  width: 280px;
}
.nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.user {
  margin-left: 12px;
  cursor: pointer;
  color: var(--qd-text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.layout {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.feed {
  flex: 1;
  min-width: 0;
}
.post-card {
  margin-bottom: 16px;
  padding: 20px;
  cursor: pointer;
}
.post-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.head-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.author {
  font-weight: 600;
  font-size: 14px;
}
.time {
  color: #9ca3af;
  font-size: 12px;
}
.badge {
  margin-left: auto;
}
.title {
  margin: 12px 0 6px;
  font-size: 17px;
}
.content {
  color: #4b5563;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-foot {
  color: #9ca3af;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}
.like {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.like.liked {
  color: var(--qd-primary);
  font-weight: 600;
}
.tag {
  margin-left: auto;
}
.aside {
  width: 280px;
  flex-shrink: 0;
}
.aside-card {
  margin-top: 16px;
}
.notice {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}
.notice-text {
  color: #4b5563;
  margin: 0;
  font-size: 13px;
}
.fab {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 52px;
  height: 52px;
  box-shadow: 0 6px 18px rgba(14, 159, 159, 0.4);
}
</style>
