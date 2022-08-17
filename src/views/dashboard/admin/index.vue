<template>
  <div class="dashboard-editor-container">

    <panel-group :data="panelGroupData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
<!--      <line-chart :chart-data="lineChartData" />-->
      <el-col :xs="240" :sm="2400" :lg="1800">
        <div class="chart-wrapper">
          <bar-chart  :chart-data="barData"/>
        </div>
      </el-col>
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
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import {GetBarData, panelGroupData, pieChartData} from '@/api/dashboard'


export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    PieChart,
    TransactionTable,
    BarChart
  },
  data() {
    return {
      panelGroupData: {
        taskNum: 0,
        successNum: 0,
        runningNum: 0,
        hostNum: 0
      },
      barData: {
        'name': ['test12', 'test2'],
        'value': ['20','5']
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
    this.getBarData()
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
        console.log(response.data)
        this.pieChartData.legend = response.data.legend
        this.pieChartData.series = response.data.data
      }).catch(() => {
      })
    },
    getBarData(){
      GetBarData().then((res) => {
       this.barData.name = res.data.service_name
        this.barData.value = res.data.task_num
        console.log(this.barData)
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
