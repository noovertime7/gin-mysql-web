<template>
  <div class="app-container">
    <div class="filter-container">   <span class="filter-item">服务名: </span>
      <!-- 下拉框 -->
      <!-- filterable：带搜索功能 -->
      <!-- placeholder 默认提示 -->
      <!-- label 显示内容 -->
      <!-- value 绑定到v-model的值中 -->
      <el-select v-model="bakHistoryValue" filterable placeholder="请选择" class="filter-item">
        <el-option
          v-for="(item, index) in bakHistoryList"
          :key="index"
          :label="item.service_name"
          :value="item.service_name"
        />
      </el-select>

      <el-input v-model="listQuery.info" placeholder="备份主机/数据库名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        显示快照索引
      </el-checkbox>
      <div />
    </div>

    <el-table
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ES主机" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="快照仓库" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Repository }}</span>
        </template>
      </el-table-column>
      <el-table-column label="快照名" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Snapshot }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" align="center" label="快照索引" width="150">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.Indices }}</span>
        </template>
      </el-table-column>
      <el-table-column label="UUID" width="210px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.UUID }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.StartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="结束时间" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.EndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用时" width="120px">
        <template slot-scope="{row}">
          <span>{{ row.DurationInMillis }}ms</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="快照状态" width="140px">
        <template slot-scope="{row}">
          <el-tag :type="row.State | statusFilter">
            {{ row.State|loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.Message }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="200" fixed="right">
        <template slot-scope="{row}">
          <el-button type="warning" size="mini" @click="deleteHistory(row)">
            删除
          </el-button>
          <el-button size="mini" type="success" @click="Reduction">
            还原
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page_no"
      :limit.sync="listQuery.page_size"
      @pagination="getList"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { GetServiceList } from '@/api/agent'
import { deleteEsHistory, getEshistoryList } from '@/api/elastic'

const loadTypeOptions = [
  { key: 'faild', display_name: '失败' },
  { key: 'SUCCESS', display_name: '成功' }
]
const loadTypeKeyValue = loadTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'BakHistory',
  components: { Pagination },
  directives: { waves },
  filters: {
    loadtypeFilter(type) {
      return loadTypeKeyValue[type]
    },
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        SUCCESS: 'success',
        faild: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      bakHistoryValue: '',
      bakHistoryList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        service_name: '',
        page_no: 1,
        page_size: 20,
        info: '',
        sort: ''
      },
      sortOptions: [{ label: 'ID Ascending', key: 'aesc' }, { label: 'ID Descending', key: 'desc' }],
      showReviewer: false,
      temp: {
        id: undefined
      },
      downloadLoading: false
    }
  },
  watch: {
    // 监听bakHistory的值,若发生变化，则执行handler方法中的内容
    bakHistoryValue: {
      handler() {
        // 将bakHistory的值存入本地，用于path切换时依旧能获取得到
        localStorage.setItem('bakHistory', this.bakHistoryValue)
        // 重置当前页为1
        this.currentPage = 1
        // 获取deployment列表
        this.getList()
      }
    }
  },
  created() {
    this.getServiceList()
  },
  methods: {
    deleteHistory(row) {
      const deleteQuery = {
        'id': row.ID,
        'service_name': this.bakHistoryValue
      }
      deleteEsHistory(deleteQuery).then((response) => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '启动任务成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.service_name = this.bakHistoryValue
      getEshistoryList(this.listQuery).then(response => {
        this.list = response.data.esHistoryListOutItem
        this.total = response.data.Total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    // 获取服务列表
    getServiceList() {
      GetServiceList().then(res => {
        this.bakHistoryList = res.data.agent_list
        // 默认请求服务第一个
        this.bakHistoryValue = this.bakHistoryList[0].service_name
        this.getList()
      })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
    },
    handleFilter() {
      this.listQuery.page_no = 1
      this.getServiceList()
    },
    Reduction() {
      this.$prompt('还原备份影响数据库数据, 请输入还原密码', '安全校验', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value !== 'admin123') {
          this.$message({
            type: 'error',
            message: '输入的还原密码有误'
          })
          return
        }
        this.$message({
          type: 'success',
          message: '还原成功'
        })
      })
    },
    handleModifyStatus() {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'aesc'
      } else {
        this.listQuery.sort = 'desc'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '任务ID', '快照名', '快照仓库', 'UUID', '备份状态', '用时', '开始时间', '结束时间', '主机', '索引', '备注']
        const filterVal = ['ID', 'TaskID', 'Snapshot', 'Repository', 'UUID', 'State', 'DurationInMillis', 'StartTime', 'EndTime', 'Host', 'Indices', 'Message']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    getSortClass: function() {
      const sort = this.listQuery.sort
      if (sort === 'desc') {
        return 'descending'
      }
      return 'aescending'
    }
  }
}
</script>
