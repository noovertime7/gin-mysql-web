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
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select>

      <el-input v-model="listQuery.info" placeholder="备份主机/数据库名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        显示备份文件路径
      </el-checkbox>
      <div>

      </div>
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
      <el-table-column label="备份主机" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.DBName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.FileSize }}KB</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备份时间" width="250px">
        <template slot-scope="{row}">
          <span>{{ row.BakTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="钉钉发送状态" width="140px">
        <template slot-scope="{row}">
          <el-tag :type="row.DingStatus | statusFilter">
            {{ row.DingStatus|loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="OSS保存状态" width="140px">
        <template slot-scope="{row}">
          <el-tag :type="row.OSSStatus | statusFilter">
            {{ row.OSSStatus|loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" align="center" label="文件路径" width="150">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.FileName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备份状态" width="120">
        <template slot-scope="{row}">
          <el-tooltip :content="row.Message" placement="top-start" effect="light">
            <el-tag :type="row.Message | statusFilter">
              {{ row.Message }}
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="257">
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
import { checkDownloadBakFile } from '@/api/public'
import {GetServiceList} from "@/api/agent";
import {DeleteHistory, GetAgentHistory} from "@/api/agent-history";
import {StartAgentTask} from "@/api/agent-task";

const loadTypeOptions = [
  { key: '0', display_name: '失败' },
  { key: '1', display_name: '成功' },
  { key: '2', display_name: '未启用' }
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
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      bakHistoryValue: "",
      bakHistoryList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        service_name: "",
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
  beforeMount() {
    this.getServiceList()
  },
  watch: {
    //监听bakHistory的值,若发生变化，则执行handler方法中的内容
    bakHistoryValue: {
      handler() {
        //将bakHistory的值存入本地，用于path切换时依旧能获取得到
        localStorage.setItem('bakHistory', this.bakHistoryValue)
        //重置当前页为1
        this.currentPage = 1
        //获取deployment列表
        this.getList()
      }
    },
  },
  methods: {
    deleteHistory(row) {
      const deleteQuery = {
        'id': row.ID,
        'service_name': this.bakHistoryValue
      }
      DeleteHistory(deleteQuery).then((response) => {
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
      GetAgentHistory(this.listQuery).then(response => {
        this.list = response.data.historyListOutItem
        this.total = response.data.Total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    //获取服务列表
    getServiceList() {
      GetServiceList().then(res => {
          this.bakHistoryList = res.data.agent_list
        // 默认请求服务第一个
        this.bakHistoryValue = this.bakHistoryList[0].name
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
        const tHeader = ['id', 'host', 'db_name', 'ding_status', 'oss_status', 'message', 'file_size', 'file_name', 'bak_time']
        const filterVal = ['id', 'host', 'db_name', 'ding_status', 'oss_status', 'message', 'file_size', 'file_name', 'bak_time']
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
