<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true,
      default() {
        return {
          'name': ['test1', 'test2', 'test3', 'test4', 'test5'],
          'value': ['10','20','12','7','23']
        }
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.initChart()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 10,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.chartData.name,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          min:0,  //取0为最小刻度
          max: 50, //取100为最大刻度
          scale: true, //自适应
          type: 'value',
          axisTick: {
            show: false
          },
        }],
        series: [{
          name: this.chartData.name,
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          data: this.chartData.value,
          animationDuration
        }]
      })
    }
  }
}
</script>
