<template>
  <div v-if="data">
    <!-- 四个指标卡（带图标与强调色） -->
    <div class="stat-grid">
      <div class="qd-card stat" @click="$router.push('/admin/review')">
        <div class="stat-icon" style="background: #e6f7f7; color: #0e9f9f">
          <el-icon :size="22"><DataLine /></el-icon>
        </div>
        <div class="stat-num">{{ data.stats.auditCount }}</div>
        <div class="stat-label">今日审核量</div>
      </div>
      <div class="qd-card stat">
        <div class="stat-icon" style="background: #fdecec; color: #d14343">
          <el-icon :size="22"><CircleClose /></el-icon>
        </div>
        <div class="stat-num">{{ data.stats.blockedCount }}</div>
        <div class="stat-label">拦截量</div>
      </div>
      <div class="qd-card stat" @click="$router.push('/admin/review')">
        <div class="stat-icon" style="background: #ece9fd; color: #6c5ce7">
          <el-icon :size="22"><QuestionFilled /></el-icon>
        </div>
        <div class="stat-num" style="color: #6c5ce7">{{ data.stats.recheckCount }}</div>
        <div class="stat-label">待复核量</div>
      </div>
      <div class="qd-card stat">
        <div class="stat-icon" style="background: #fff4e5; color: #d97a18">
          <el-icon :size="22"><Timer /></el-icon>
        </div>
        <div class="stat-num">{{ data.stats.avgTimeE2E }}s</div>
        <div class="stat-label">平均耗时（规则层 {{ data.stats.avgTimeRule }}s）</div>
      </div>
    </div>

    <div class="row">
      <!-- 近 7 日趋势（ECharts） -->
      <el-card class="panel">
        <template #header>近 7 日审核 / 拦截趋势</template>
        <div ref="trendEl" class="chart" />
      </el-card>

      <!-- 命中层级分布（环形图） -->
      <el-card class="panel">
        <template #header>命中层级分布</template>
        <div ref="pieEl" class="chart" />
      </el-card>
    </div>

    <div class="row">
      <!-- 风险类型 TOP5 -->
      <el-card class="panel">
        <template #header>风险类型 TOP5</template>
        <div v-for="(t, i) in data.topTypes" :key="t.name" class="risk">
          <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <span class="risk-name">{{ t.name }}</span>
          <div class="risk-bar"><div class="risk-bar-inner" :style="{ width: pct(t.count) + '%' }" /></div>
          <span class="count">{{ t.count }}</span>
        </div>
      </el-card>

      <!-- 最新待复核 -->
      <el-card class="panel">
        <template #header>最新待复核（点击直达）</template>
        <div v-for="r in reviewQueue.slice(0, 4)" :key="r.id" class="risk">
          <span class="truncate">{{ r.content }}</span>
          <el-button text type="primary" size="small" @click="$router.push(`/admin/review/${r.id}`)">复核</el-button>
        </div>
      </el-card>
    </div>

    <el-alert title="统计口径：近 24 小时系统自动审核数据，每 5 分钟自动刷新。" type="info" :closable="false" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api'

const data = ref(null)
const reviewQueue = ref([])
const trendEl = ref(null)
const pieEl = ref(null)

onMounted(async () => {
  data.value = await api.getDashboard()
  reviewQueue.value = await api.getReviewQueue()
  await nextTick()
  renderCharts()
})

function pct(v) {
  const max = Math.max(...data.value.topTypes.map((t) => t.count), 1)
  return Math.round((v / max) * 100)
}

function renderCharts() {
  // 趋势：柱（审核量）+ 线（拦截量）
  echarts.init(trendEl.value).setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['审核量', '拦截量'], right: 0, top: 0, textStyle: { fontSize: 12 } },
    grid: { left: 40, right: 16, top: 30, bottom: 24 },
    xAxis: {
      type: 'category',
      data: data.value.trend.map((d) => d.date),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f2f5' } } },
    series: [
      {
        name: '审核量',
        type: 'bar',
        data: data.value.trend.map((d) => d.total),
        itemStyle: { color: '#0e9f9f', borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
      },
      {
        name: '拦截量',
        type: 'line',
        smooth: true,
        data: data.value.trend.map((d) => d.blocked),
        itemStyle: { color: '#d14343' },
      },
    ],
  })

  // 层级分布：环形图
  echarts.init(pieEl.value).setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: data.value.layerDist.map((l, i) => ({
          ...l,
          itemStyle: { color: ['#0e9f9f', '#6c5ce7', '#d97a18'][i] },
        })),
      },
    ],
  })
}
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.stat {
  padding: 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.stat-num {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  color: #9ca3af;
  font-size: 13px;
  margin-top: 4px;
}
.row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.panel {
  flex: 1;
}
.chart {
  height: 260px;
}
.risk {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
}
.rank {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank.top {
  background: #0e9f9f;
  color: #fff;
}
.risk-name {
  width: 90px;
  flex-shrink: 0;
}
.risk-bar {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.risk-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #0e9f9f, #6c5ce7);
  border-radius: 4px;
}
.count {
  width: 24px;
  text-align: right;
  color: #0e9f9f;
  font-weight: 600;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 65%;
}
</style>
