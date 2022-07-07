<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="备份主机" width="290" align="center">
      <template slot-scope="scope">
        {{ scope.row.host }}
      </template>
    </el-table-column>
    <el-table-column label="备份数据库" width="130" align="center">
      <template slot-scope="scope">
        {{ scope.row.db_name }}
      </template>
    </el-table-column>
    <el-table-column label="备份时间" width="300" align="center">
      <template slot-scope="scope">
        {{ scope.row.bak_time }}
      </template>
    </el-table-column>
    <el-table-column label="备份状态" width="100" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.message | statusFilter">
          {{ row.message }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

import { getBakHistoryList } from '@/api/bak'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getBakHistoryList().then(response => {
        this.list = response.data.slice(0, 8)
        console.log(this.list)
      })
    }
  }
}
</script>
