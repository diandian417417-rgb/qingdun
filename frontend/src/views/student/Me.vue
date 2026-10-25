<template>
  <div>
    <header class="topbar">
      <div class="page-container topbar-inner">
        <el-button text @click="$router.push('/home')"><el-icon><Back /></el-icon> 返回首页</el-button>
        <span class="crumb">个人中心</span>
      </div>
    </header>

    <div class="page-container">
      <!-- 顶部信息卡：渐变背景 + 头像 + 计数 -->
      <div class="profile qd-card">
        <div class="profile-main">
          <span class="qd-avatar big">{{ nickname.slice(0, 1) }}</span>
          <div>
            <div class="name">{{ nickname }}</div>
            <div class="uname">@{{ currentUser?.username }}</div>
          </div>
        </div>
        <div class="stats">
          <div class="stat"><b>{{ myPosts.length }}</b><span>发布</span></div>
          <div class="stat"><b>{{ counts.passed }}</b><span>通过</span></div>
          <div class="stat"><b>{{ counts.remind }}</b><span>提醒修改</span></div>
          <div class="stat"><b>{{ counts.blocked }}</b><span>拦截</span></div>
        </div>
      </div>

      <!-- 四个标签页：帖子 / 评论 / 审核记录 / 申诉记录 -->
      <el-card shadow="never" class="tabs-card">
        <el-tabs v-model="tab">
          <el-tab-pane label="我的帖子" name="posts">
            <el-table :data="myPosts" empty-text="还没有发布帖子">
              <el-table-column prop="title" label="标题" min-width="200" />
              <el-table-column label="状态" width="140">
                <template #default="{ row }"><StatusBadge :status="row.status" /></template>
              </el-table-column>
              <el-table-column prop="createdAt" label="时间" width="150" />
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button v-if="row.status === 'passed' || row.status === 'pending'" text type="primary">编辑</el-button>
                  <el-button v-if="row.status === 'blocked'" text type="warning" @click="$router.push('/me/messages')">申诉</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="我的评论" name="comments">
            <el-table :data="comments" empty-text="暂无评论记录">
              <el-table-column prop="content" label="评论内容" min-width="240" />
              <el-table-column prop="postTitle" label="所在帖子" min-width="160" />
              <el-table-column label="状态" width="120">
                <template #default="{ row }"><StatusBadge :status="row.status" /></template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="150" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="审核记录" name="audit">
            <el-table :data="records" empty-text="暂无审核记录">
              <el-table-column prop="type" label="类型" width="80" />
              <el-table-column prop="title" label="内容" min-width="200" />
              <el-table-column label="状态" width="120">
                <template #default="{ row }"><StatusBadge :status="row.status" /></template>
              </el-table-column>
              <el-table-column prop="reason" label="原因类别" min-width="180" />
              <el-table-column prop="time" label="时间" width="150" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="申诉记录" name="appeals">
            <el-table :data="appeals" empty-text="暂无申诉记录">
              <el-table-column prop="content" label="被处置内容" min-width="220" />
              <el-table-column prop="reason" label="申诉理由" min-width="180" />
              <el-table-column label="进度" width="140">
                <template #default="{ row }">
                  <el-tag :type="row.progress === '复核完成' ? 'success' : 'warning'" size="small">
                    {{ row.progress }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="提交时间" width="150" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import { currentUser } from '@/composables/useAuth'
import StatusBadge from '@/components/StatusBadge.vue'

const tab = ref('posts')
const myPosts = ref([])
const records = ref([])

// 本地模拟数据：我的评论、申诉记录（后端就绪后改为接口获取）
const comments = ref([
  { id: 1, content: '我也觉得二楼那家不错', postTitle: '食堂二楼新窗口测评', status: 'passed', time: '2026-10-22 11:00' },
  { id: 2, content: '请问具体几点开门呀', postTitle: '请问图书馆周五几点闭馆', status: 'passed', time: '2026-10-21 19:30' },
])
const appeals = ref([
  { id: 1, content: '回复：食堂新窗口', reason: '我只是推荐餐厅，没有引导加好友', progress: '复核完成', time: '2026-10-21 12:35' },
])

const nickname = computed(() => currentUser.value?.nickname || '用户')

const counts = computed(() => {
  const c = { passed: 0, remind: 0, blocked: 0 }
  myPosts.value.forEach((p) => {
    if (p.status in c) c[p.status] += 1
  })
  return c
})

onMounted(async () => {
  myPosts.value = await api.getMyPosts()
  records.value = await api.getMyAuditRecords()
})
</script>

<style scoped>
.topbar {
  background: #fff;
  border-bottom: 1px solid var(--qd-border);
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
.profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  margin-top: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #e6f7f7 100%);
}
.profile-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.qd-avatar.big {
  width: 56px;
  height: 56px;
  font-size: 22px;
}
.name {
  font-size: 18px;
  font-weight: 600;
}
.uname {
  color: #9ca3af;
  font-size: 13px;
}
.stats {
  display: flex;
  gap: 40px;
}
.stat {
  text-align: center;
}
.stat b {
  display: block;
  font-size: 22px;
  color: var(--qd-primary);
}
.stat span {
  color: #9ca3af;
  font-size: 12px;
}
.tabs-card {
  margin-top: 16px;
}
</style>
