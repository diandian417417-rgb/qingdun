<template>
  <!-- 审核员登录页：入口独立，深色背景区分（P-A1） -->
  <div class="admin-login">
    <el-card class="card">
      <template #header>青盾 · 审核员登录</template>
      <el-form :model="form" label-position="top">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="管理员账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="密码" />
        </el-form-item>
        <el-form-item label="图形验证码">
          <div class="captcha-row">
            <el-input v-model="form.captcha" placeholder="验证码" />
            <span class="captcha">AB3K</span>
          </div>
        </el-form-item>
        <el-button type="primary" class="submit" :loading="loading" @click="login">登录</el-button>
      </el-form>
      <div class="back">
        <el-link @click="$router.push('/login')">← 返回学生端</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '@/api'
import { loginAdmin } from '@/composables/useAuth'

const router = useRouter()
const form = reactive({ username: '', password: '', captcha: '' })
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    const admin = await api.adminLogin(form)
    loginAdmin(admin)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch (e) {
    loading.value = false
    // 登录失败不暴露账号是否存在
    ElMessage.error(e.message || '登录失败')
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2d3d;
}
.card {
  width: 400px;
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha {
  background: #eef2f7;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #374151;
  user-select: none;
}
.submit {
  width: 100%;
}
.back {
  margin-top: 14px;
  text-align: center;
}
</style>
