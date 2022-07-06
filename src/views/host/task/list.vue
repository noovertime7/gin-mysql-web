<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.info"
        placeholder="主机/数据库名"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        plain
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        plain
        type="success"
        icon="el-icon-edit"
        @click="handleAddTask"
      >
        添加任务
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        plain
        icon="el-icon-video-play"
        @click="handleStartAllTask"
      >
        启动主机下所有任务
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        plain
        icon="el-icon-switch-button"
        @click="handleStopAllTask"
      >
        关闭主机下所有任务
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="ID" prop="id" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机" align="center" min-width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="center" min-width="30px">
        <template slot-scope="{ row }">
          <span>{{ row.db_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下次执行时间" align="center" min-width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.backup_cycle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" min-width="30px">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            disabled
          />
        </template>
      </el-table-column>
      <el-table-column label="任务创建时间" align="center" min-width="60px">
        <template slot-scope="{ row }">
          <span>{{ row.create_at }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="350"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="success" plain size="mini" @click="handleStartBakTask(row,$index)"> 启动 </el-button>
          <el-button type="info" plain size="mini" @click="handleStopBakTask(row,$index)"> 停止 </el-button>
          <el-button type="primary" plain size="mini" @click="handleEdit(row,$index)">修改</el-button>
          <el-button size="mini" plain type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { taskList, taskDelete } from '@/api/task'
import { startAllBakByHost, startBak, stopAllBakByHost, stopBak } from '@/api/bak'

export default {
  name: 'TaskList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      hostId: 0,
      listQuery: {
        host_id: '',
        page_no: 1,
        page_size: 20,
        info: ''
      },
      temp: {
        id: undefined
      }
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    if (id > 0) {
      this.isEdit = true
      this.hostId = id
      this.getList()
    }
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.host_id = this.hostId
      taskList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    handleStartAllTask() {
      const startQuery = {
        'host_id': this.hostId
      }
      startAllBakByHost(startQuery).then((response) => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '批量任务启动成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleStopAllTask() {
      const stopQuery = {
        'host_id': this.hostId
      }
      stopAllBakByHost(stopQuery).then((response) => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '批量任务关闭成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleFilter() {
      this.listQuery.page_no = 1
      this.getList()
    },
    handleEdit(row, index) {
      this.$router.push('/host/task_edit/' + row.id)
    },
    handleAddTask() {
      this.$router.push('/host/task_add/' + this.hostId)
    },
    handleDelete(row, index) {
      this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deleteQuery = {
          'id': row.id
        }
        taskDelete(deleteQuery).then((response) => {
          this.list.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleStartBakTask(row, index) {
      this.$confirm('是否启动备份任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const startQuery = {
          'id': row.id
        }
        startBak(startQuery).then((response) => {
          this.getList()
          this.$notify({
            title: 'Success',
            message: '启动任务成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleStopBakTask(row, index) {
      const startQuery = {
        'id': row.id
      }
      stopBak(startQuery).then((response) => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '任务停止成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    rtClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
