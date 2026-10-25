import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn, isAdminLoggedIn } from '@/composables/useAuth'

// 审核状态提示要求（4.3.5）：
// 状态文案采用“结论 + 原因类别 + 出口”三段式，不出现具体词条与规则编号。
// 此处为前端展示口径，最终以后端接口约定为准。
export const AUDIT_STATUS = {
  pending: {
    label: '审核中',
    color: '#2f6fd0',
    text: '审核中：正在判定，暂不对他人可见',
  },
  passed: {
    label: '通过',
    color: '#22a06b',
    text: '通过',
  },
  remind: {
    label: '提醒修改',
    color: '#d97a18',
    text: '内容可能违规，请修改后重新提交',
  },
  blocked: {
    label: '拦截',
    color: '#d14343',
    text: '内容不予发表',
  },
  recheck: {
    label: '待复核',
    color: '#6c5ce7',
    text: '待复核：人工复核中，预计 24 小时内出结果',
  },
  pending_retry: {
    label: '待补审',
    color: '#64748b',
    text: '审核中（延迟）：服务繁忙，恢复后自动补审',
  },
  restricted: {
    label: '受限',
    color: '#6b7280',
    text: '账号内容受限，可在消息中查看原因',
  },
}

const routes = [
  // ===== 学生端（P-S1 ~ P-S6）=====
  { path: '/login', name: 'login', component: () => import('@/views/student/Login.vue') },
  { path: '/home', name: 'home', component: () => import('@/views/student/Home.vue') },
  { path: '/post/new', name: 'post-new', component: () => import('@/views/student/PostNew.vue') },
  { path: '/post/:id', name: 'post-detail', component: () => import('@/views/student/PostDetail.vue') },
  { path: '/me/posts', name: 'me-posts', component: () => import('@/views/student/Me.vue') },
  { path: '/me/messages', name: 'me-messages', component: () => import('@/views/student/Messages.vue') },
  { path: '/', redirect: '/home' },

  // ===== 管理端（P-A1 ~ P-A6），独立入口 =====
  { path: '/admin/login', name: 'admin-login', component: () => import('@/views/admin/AdminLogin.vue') },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'review', name: 'admin-review', component: () => import('@/views/admin/Review.vue') },
      { path: 'review/:id', name: 'admin-review-detail', component: () => import('@/views/admin/ReviewDetail.vue') },
      { path: 'rules', name: 'admin-rules', component: () => import('@/views/admin/Rules.vue') },
      { path: 'system', name: 'admin-system', component: () => import('@/views/admin/AdminExtras.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：未登录访问学生端任意页面 → 登录页；未登录管理端账号 → 管理端登录页
router.beforeEach((to) => {
  if (to.path.startsWith('/admin')) {
    // 管理端
    if (to.path === '/admin/login') return true
    if (!isAdminLoggedIn()) return { path: '/admin/login' }
    return true
  }
  // 学生端
  if (to.path === '/login') return true
  if (!isLoggedIn()) return { path: '/login' }
  return true
})

export default router
