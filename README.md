# 青盾 · 校园社区平台

> 一个面向高校学生的校园社区平台，内置多维度 AI 内容审核引擎。

## 📖 项目简介

「青盾」是一个面向高校学生的校园社区平台，支持学生发帖、评论、上传图片等基础功能，并集成一套多维度 AI 内容审核引擎，能够识别**谐音、拆字、emoji 夹带、隐晦 P 图、渐进诱导**等违规内容。

采用「**规则先行、AI 兜底、人审把关**」的分层审核架构，在保证审核效率的同时兼顾准确率。

本项目为《软件设计与体系结构》课程小组实践项目。

## ✨ 核心特性

- **校园社区功能**：用户注册登录、发帖与评论、图片上传、板块与话题、内容搜索
- **多维度 AI 内容审核引擎**：
  - 文本审核：敏感词引擎（AC 自动机）+ 归一化对抗变体 + 大模型语义兜底
  - 图片审核：OCR 提取图中文字 + 多模态大模型识别
  - 行为审核：识别高频发帖、试探性绕审、渐进诱导等异常行为
- **风险分级与处置**：通过 / 标记待复核 / 拦截
- **管理后台**：审核日志、人工复核、敏感词库维护

## 🛠 技术栈

| 类别 | 技术 |
|---|---|
| 后端 | Python + FastAPI |
| 前端 | Vue 3 + Vite |
| 数据库 | MySQL |
| 缓存 | Redis |
| 敏感词引擎 | Aho-Corasick（pyahocorasick） |
| OCR | PaddleOCR |
| 大模型 | 智谱 AI（GLM） |
| 部署 | Linux + Docker |

## 📁 目录结构

```
qingdun/
├─ backend/          # 后端服务（FastAPI）
│  ├─ main.py        # 主程序与接口
│  ├─ database.py    # 数据库连接配置
│  └─ models.py      # 数据模型
└─ frontend/         # 前端（Vue 3 + Vite）
   └─ src/App.vue    # 社区首页
```

## 🚀 如何运行

### 1. 后端

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # Mac / Linux
pip install fastapi uvicorn sqlalchemy pymysql
```

先在 MySQL 中创建数据库：

```sql
CREATE DATABASE qingdun DEFAULT CHARACTER SET utf8mb4;
```

修改 `backend/database.py` 中的数据库密码，然后启动：

```bash
python -m uvicorn main:app --reload
```

访问接口文档：http://127.0.0.1:8000/docs

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:5173

## 👥 团队成员

| 姓名 | 分工 |
|---|---|
| 唐思竹 | 队长 / 项目管理 / 审核引擎 |
| 杨开 | 后端开发 / 数据库 |
| 张圣喆 | 审核引擎 / 敏感词 |
| 高雯雅 | 前端开发 |
| 陈帆 | 测试 |

## 📄 课程信息

《软件设计与体系结构》2026 秋 · 北京工商大学
