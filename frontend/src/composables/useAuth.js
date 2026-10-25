import { reactive, computed } from 'vue'

// 登录态管理：学生端与审核员（管理端）各自独立会话
// 说明：本项目采用“平台独立账号认证”（用户名 + 密码），不使用统一身份认证/学号注册。
// 当前用 localStorage 模拟会话；接入后端后改为存后端下发的 token。

const S_USER = 'qd_user'       // 学生端登录用户
const S_ADMIN = 'qd_admin'     // 管理端登录用户

const state = reactive({
  user: JSON.parse(localStorage.getItem(S_USER) || 'null'),
  admin: JSON.parse(localStorage.getItem(S_ADMIN) || 'null'),
})

export function isLoggedIn() {
  return !!state.user
}

export function isAdminLoggedIn() {
  return !!state.admin
}

export const currentUser = computed(() => state.user)

export function loginStudent(user) {
  state.user = user
  localStorage.setItem(S_USER, JSON.stringify(user))
}

export function logoutStudent() {
  state.user = null
  localStorage.removeItem(S_USER)
}

export function loginAdmin(admin) {
  state.admin = admin
  localStorage.setItem(S_ADMIN, JSON.stringify(admin))
}

export function logoutAdmin() {
  state.admin = null
  localStorage.removeItem(S_ADMIN)
}
