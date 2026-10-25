<template>
  <!-- 管理端框架：左侧固定一级菜单（180px），右侧内容区自适应 -->
  <div class="admin-layout">
    <aside class="side">
      <div class="brand" @click="$router.push('/admin/dashboard')">青盾 · 审核后台</div>
      <el-menu :default-active="$route.path" router class="menu">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon><span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/admin/review">
          <el-icon><Finished /></el-icon><span>人工复核</span>
        </el-menu-item>
        <el-menu-item index="/admin/rules">
          <el-icon><Setting /></el-icon><span>规则配置</span>
        </el-menu-item>
        <el-menu-item index="/admin/system">
          <el-icon><Monitor /></el-icon><span>日志 / 用户 / 状态</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main">
      <header class="top">
        <span class="title">{{ pageTitle }}</span>
        <el-dropdown @command="onUser">
          <span class="user">{{ adminName }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { currentUser, logoutAdmin } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()

const TITLES = {
  '/admin/dashboard': '数据看板',
  '/admin/review': '人工复核队列',
  '/admin/rules': '规则配置',
  '/admin/system': '审核日志 / 用户风险 / 系统状态',
}
const pageTitle = computed(() => TITLES[route.path] || '审核后台')
const adminName = computed(() => currentUser.value?.nickname || '审核员')

function onUser(cmd) {
  if (cmd === 'logout') {
    logoutAdmin()
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.side {
  width: 180px;
  background: #1f2d3d;
  color: #fff;
  flex-shrink: 0;
}
.brand {
  padding: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}
.menu {
  border-right: none;
  background: transparent;
  --el-menu-text-color: #c0c4cc;
  --el-menu-hover-bg-color: #2c3a4d;
  --el-menu-active-color: #fff;
}
.menu :deep(.el-menu-item.is-active) {
  background: var(--qd-primary);
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.top {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.title {
  font-weight: 600;
}
.user {
  margin-left: auto;
  cursor: pointer;
  color: #374151;
}
.content {
  padding: 16px;
  flex: 1;
}
</style>
