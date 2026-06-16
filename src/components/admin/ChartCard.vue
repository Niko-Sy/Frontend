<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use as useEcharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'

useEcharts([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent])

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  type: { type: String, default: 'bar' },
  data: { type: Array, default: () => [] },
  height: { type: Number, default: 260 },
})

const cssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const normalized = computed(() =>
  props.data.map((item) => ({
    name: item.name || item.month || item.label || item.status || '未命名',
    value: Number(item.value ?? item.count ?? item.itemCount ?? 0),
  })),
)

const option = computed(() => {
  const text = cssVar('--text', '#1f2937')
  const muted = cssVar('--text-muted', '#64748b')
  const primary = cssVar('--brand-primary', '#6366f1')
  const sky = cssVar('--brand-sky', '#38bdf8')
  const violet = cssVar('--brand-violet', '#8b5cf6')
  const cyan = cssVar('--brand-cyan', '#22d3ee')
  const rose = cssVar('--brand-rose', '#f0abfc')
  const gridLine = cssVar('--border-soft', 'rgba(100,116,139,.14)')
  const data = normalized.value

  const common = {
    color: [primary, sky, violet, cyan, rose],
    textStyle: { color: text, fontFamily: cssVar('--font-sans', 'system-ui') },
    tooltip: { trigger: 'axis', borderWidth: 0, backgroundColor: cssVar('--surface-glass-strong', '#fff'), textStyle: { color: text } },
    grid: { top: 24, right: 16, bottom: 30, left: props.type === 'horizontal-bar' ? 72 : 36 },
  }

  if (props.type === 'line') {
    return {
      ...common,
      xAxis: { type: 'category', data: data.map((item) => item.name), axisLabel: { color: muted }, axisLine: { lineStyle: { color: gridLine } } },
      yAxis: { type: 'value', axisLabel: { color: muted }, splitLine: { lineStyle: { color: gridLine } } },
      series: [{ type: 'line', smooth: true, symbolSize: 8, areaStyle: { opacity: 0.12 }, lineStyle: { width: 3 }, data: data.map((item) => item.value) }],
    }
  }

  if (props.type === 'donut') {
    return {
      ...common,
      tooltip: { trigger: 'item', borderWidth: 0, backgroundColor: cssVar('--surface-glass-strong', '#fff'), textStyle: { color: text } },
      legend: { bottom: 0, textStyle: { color: muted } },
      series: [{ type: 'pie', radius: ['48%', '72%'], center: ['50%', '42%'], label: { color: text, formatter: '{b}' }, data }],
    }
  }

  const horizontal = props.type === 'horizontal-bar'
  return {
    ...common,
    xAxis: horizontal
      ? { type: 'value', axisLabel: { color: muted }, splitLine: { lineStyle: { color: gridLine } } }
      : { type: 'category', data: data.map((item) => item.name), axisLabel: { color: muted }, axisLine: { lineStyle: { color: gridLine } } },
    yAxis: horizontal
      ? { type: 'category', data: data.map((item) => item.name), axisLabel: { color: muted }, axisLine: { lineStyle: { color: gridLine } } }
      : { type: 'value', axisLabel: { color: muted }, splitLine: { lineStyle: { color: gridLine } } },
    series: [{ type: 'bar', barMaxWidth: 28, itemStyle: { borderRadius: horizontal ? [0, 10, 10, 0] : [10, 10, 0, 0] }, data: data.map((item) => item.value) }],
  }
})
</script>

<template>
  <el-card class="chart-card" shadow="never">
    <div class="chart-card-head">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <VChart v-if="normalized.length" class="chart-canvas" :option="option" autoresize :style="{ height: `${height}px` }" />
    <div v-else class="chart-empty" :style="{ minHeight: `${height}px` }">暂无数据</div>
  </el-card>
</template>
