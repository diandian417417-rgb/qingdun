<script setup>
import { ref, onMounted } from "vue"

const msg = ref("")
const author = ref("同学")
const content = ref("")
const posts = ref([])
const API = "http://127.0.0.1:8000"

async function ping() {
  const r = await fetch(API + "/api/ping")
  const d = await r.json()
  msg.value = d.msg
}

async function submit() {
  await fetch(API + "/api/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author: author.value, content: content.value })
  })
  msg.value = "发布成功（审核通过）"
  content.value = ""
  loadPosts()
}

async function loadPosts() {
  const r = await fetch(API + "/api/posts")
  posts.value = await r.json()
}

onMounted(loadPosts)
</script>

<template>
  <div style="max-width:600px;margin:40px auto;font-family:sans-serif">
    <h1>青盾 · 校园社区</h1>
    <button @click="ping">测试后端连接</button>
    <p style="color:#2a7">{{ msg }}</p>

    <hr />
    <h3>发一条帖子</h3>
    <input v-model="author" placeholder="昵称" style="width:100px" />
    <textarea v-model="content" placeholder="说点什么…" style="width:100%;height:60px"></textarea>
    <button @click="submit">发帖</button>

    <hr />
    <h3>帖子列表</h3>
    <ul>
      <li v-for="p in posts" :key="p.id">
        【{{ p.author }}】{{ p.content }}（{{ p.status }}）
      </li>
    </ul>
  </div>
</template>