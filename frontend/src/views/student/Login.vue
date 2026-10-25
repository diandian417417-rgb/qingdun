<template>
  <div class="login-page">
    <!-- 装饰性渐变光晕 -->
    <div class="blob blob1" />
    <div class="blob blob2" />

    <div class="login-card">
      <div class="brand">
        <div class="logo-badge"><el-icon :size="30"><Stamp /></el-icon></div>
        <h1>青 盾</h1>
        <p>校园社区平台 · 多维度 AI 内容审核</p>
        <ul class="capabilities">
          <li><el-icon><Document /></el-icon> 文本维度审核</li>
          <li><el-icon><Picture /></el-icon> 图片维度审核</li>
          <li><el-icon><DataAnalysis /></el-icon> 行为维度审核</li>
        </ul>
        <div class="brand-foot">内容发布即审，守护校园社区氛围</div>
      </div>

      <div class="form-wrap">
        <el-tabs v-model="activeTab" stretch>
          <el-tab-pane label="登录" name="login">
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="top">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable :prefix-icon="User" size="large" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" size="large" />
              </el-form-item>
              <el-button type="primary" class="submit" :loading="loading" @click="onLogin">
                登 录
              </el-button>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="注册" name="register">
            <el-form ref="regForm" :model="regForm" :rules="regRules" label-position="top">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="regForm.username" placeholder="3~20 位用户名" clearable :prefix-icon="User" size="large" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="regForm.password" type="password" placeholder="至少 6 位" show-password :prefix-icon="Lock" size="large" />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirm">
                <el-input v-model="regForm.confirm" type="password" placeholder="再次输入密码" show-password :prefix-icon="Lock" size="large" />
              </el-form-item>
              <el-button type="primary" class="submit" :loading="loading" @click="onRegister">
                注 册
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="admin-entry">
          <el-link type="primary" :underline="false" @click="$router.push('/admin/login')">
            <el-icon><Setting /></el-icon> 管理端入口
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Stamp, Document, Picture, DataAnalysis, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { api } from '@/api'
import { loginStudent } from '@/composables/useAuth'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)

// 平台独立账号认证：用户名 + 密码，不使用学号注册 / 统一身份认证
const loginForm = reactive({ username: '', password: '' })
const regForm = reactive({ username: '', password: '', confirm: '' })

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const regRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度 3~20 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirm: [
    {
      validator: (r, v, cb) => (v === regForm.password ? cb() : cb(new Error('两次输入的密码不一致'))),
      trigger: 'blur',
    },
  ],
}

async function onLogin() {
  try {
    const user = await api.login(loginForm)
    loginStudent(user)
    ElMessage.success('登录成功')
    router.push('/home')
  } catch (e) {
    // 登录失败不区分“账号不存在”与“密码错误”
    ElMessage.error(e.message || '登录失败')
  }
}

async function onRegister() {
  try {
    const user = await api.register(regForm)
    loginStudent(user)
    ElMessage.success('注册成功，已自动登录')
    router.push('/home')
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a5c5c 0%, #0e9f9f 55%, #064a4a 100%);
  overflow: hidden;
  padding: 24px;
}
/* 装饰光晕 */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}
.blob1 {
  width: 380px;
  height: 380px;
  background: #6c5ce7;
  top: -80px;
  left: -60px;
}
.blob2 {
  width: 320px;
  height: 320px;
  background: #0e9f9f;
  bottom: -80px;
  right: -40px;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 880px;
  min-height: 500px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  animation: rise 0.5s ease;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand {
  flex: 1;
  padding: 48px 40px;
  color: #fff;
  background: linear-gradient(160deg, #0e9f9f 0%, #0a6e6e 100%);
  display: flex;
  flex-direction: column;
}
.logo-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.brand h1 {
  margin: 0 0 10px;
  font-size: 38px;
  letter-spacing: 8px;
}
.brand p {
  opacity: 0.9;
  margin: 0 0 32px;
  font-size: 14px;
}
.capabilities {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 2.4;
  opacity: 0.95;
}
.capabilities li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-foot {
  margin-top: auto;
  font-size: 12px;
  opacity: 0.7;
}

.form-wrap {
  flex: 1;
  padding: 40px 40px;
  display: flex;
  flex-direction: column;
}
.submit {
  width: 100%;
  margin-top: 12px;
  height: 42px;
  font-size: 16px;
  letter-spacing: 4px;
}
.admin-entry {
  margin-top: 20px;
  text-align: right;
  font-size: 13px;
}
</style>
