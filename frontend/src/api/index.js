// ============================================================
// 统一 API 层
// USE_MOCK = true  ：走本地 Mock 数据（后端未就绪时开发/演示）
// USE_MOCK = false ：走真实后端 RESTful 接口（后端就绪后切换）
// 页面里只 import 这里的函数，不直接改页面即可切换数据源。
// ============================================================
import { mock } from './mock'

export const USE_MOCK = true

// 真实接口地址：后端就绪后按接口约定填写（vite proxy 会把 /api 转发到后端）
const BASE = '/api'

// 简易请求封装（当前仅 mock 模式使用；真实模式可换成 axios/fetch）
async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  return res.json()
}

const backend = {
  // 认证
  login: (d) => http('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  register: (d) => http('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  adminLogin: (d) => http('/admin/login', { method: 'POST', body: JSON.stringify(d) }),

  // 社区
  getPosts: () => http('/posts'),
  getPost: (id) => http(`/posts/${id}`),
  getComments: (postId) => http(`/posts/${postId}/comments`),
  createPost: (d) => http('/posts', { method: 'POST', body: JSON.stringify(d) }),
  createComment: (d) => http('/comments', { method: 'POST', body: JSON.stringify(d) }),

  // 我的
  getMyPosts: () => http('/me/posts'),
  getMyAuditRecords: () => http('/me/audit'),
  getMessages: () => http('/me/messages'),

  // 管理端
  getDashboard: () => http('/admin/dashboard'),
  getReviewQueue: () => http('/admin/review'),
  getReviewDetail: (id) => http(`/admin/review/${id}`),
  submitReview: (d) => http('/admin/review', { method: 'POST', body: JSON.stringify(d) }),
  getRules: () => http('/admin/rules'),
  addRule: (d) => http('/admin/rules', { method: 'POST', body: JSON.stringify(d) }),
  verifyRule: (id) => http(`/admin/rules/${id}/verify`, { method: 'POST' }),
  getAuditLogs: () => http('/admin/logs'),
  getUsers: () => http('/admin/users'),
  getSystem: () => http('/admin/system'),
}

// 按开关导出：页面 import { api } from '@/api'
export const api = USE_MOCK ? mock : backend
