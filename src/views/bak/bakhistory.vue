<template>
  <div class="app-container">
    <div class="filter-container">
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
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备份主机" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.db_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.file_size }}KB</span>
        </template>
      </el-table-column>
      <el-table-column label="备份时间" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.bak_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="钉钉发送状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.ding_status | statusFilter">
            {{ row.ding_status|loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="OSS保存状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.oss_status | statusFilter">
            {{ row.oss_status|loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="文件路径" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.file_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备份状态" width="105" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.message | statusFilter">
            {{ row.message }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="364" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            下载
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
import { bakList } from '@/api/bak'

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
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
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
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      bakList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        console.log(this.list)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page_no = 1
      this.getList()
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
.0
