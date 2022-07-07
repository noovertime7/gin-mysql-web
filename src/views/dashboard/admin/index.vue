<template>
  <div class="dashboard-editor-container">

    <panel-group :data="panelGroupData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 16}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartData" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="8" />
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import TransactionTable from './components/TransactionTable'
import { panelGroupData, pieChartData } from '@/api/dashboard'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    PieChart,
    TransactionTable
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis,
      panelGroupData: {
        taskNum: 0,
        successNum: 0,
        runningNum: 0,
        hostNum: 0
      },
      pieChartData: {
        'title': '主机备份任务占比',
        'legend': ['主机1', '主机2', '主机3', '主机4', '主机5'],
        'series': [
          { value: 20, name: '主机1' },
          { value: 24, name: '主机2' },
          { value: 49, name: '主机3' },
          { value: 100, name: '主机4' },
          { value: 9, name: '主机5' }
        ]
      }
    }
  },
  created() {
    this.fetchPanelGroupData()
    this.fetchPieChartData()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    fetchPanelGroupData() {
      panelGroupData().then((res) => {
        this.panelGroupData.hostNum = res.data.host_num
        this.panelGroupData.taskNum = res.data.task_num
        this.panelGroupData.successNum = res.data.history_num
        this.panelGroupData.runningNum = res.data.running_pro_num
      })
    },
    fetchPieChartData() {
      pieChartData({ }).then(response => {
        this.pieChartData.legend = response.data.legend
        this.pieChartData.series = response.data.data
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
