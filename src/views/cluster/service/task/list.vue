<template>
  <div class="app-container">
    <div class="filter-container">
      <span class="filter-item">备份主机: </span>
      <!-- 下拉框 -->
      <!-- filterable：带搜索功能 -->
      <!-- placeholder 默认提示 -->
      <!-- label 显示内容 -->
      <!-- value 绑定到v-model的值中 -->
      <el-select v-model="HostValue" filterable placeholder="请选择" class="filter-item">
        <el-option
          v-for="(item, index) in HostList"
          :key="index"
          :label="item.Host"
          :value="item.Host"
        />
      </el-select>
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
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机" align="center" min-width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.Host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="center" min-width="30px">
        <template slot-scope="{ row }">
          <span>{{ row.DBName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下次执行时间" align="center" min-width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.BackupCycle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" min-width="30px">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.Status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            disabled
          />
        </template>
      </el-table-column>
      <el-table-column label="任务创建时间" align="center" min-width="60px">
        <template slot-scope="{ row }">
          <span>{{ row.CreateAt }}</span>
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
import { GetAgentHostList } from '@/api/agent-host'
import {
  DeleteAgentTask,
  GetAgentTaskList,
  StartAgentHostTask,
  StartAgentTask,
  StopAgentHostTask,
  StopAgentTask
} from '@/api/agent-task'

export default {
  name: 'TaskList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      TestMap: {},
      HostID: 0,
      HostValue: '',
      HostList: [],
      service_name: '',
      list: null,
      total: 0,
      listLoading: true,
      hostId: 0,
      listQuery: {
        service_name: '',
        host_id: '',
        page_no: 1,
        page_size: 20,
        info: ''
      },
      temp: {
        id: undefined,
        service_name: ''
      }
    }
  },
  watch: {
    // 监听Host的值,若发生变化，则执行handler方法中的内容
    HostValue: {
      handler() {
        // 将Host的值存入本地，用于path切换时依旧能获取得到
        localStorage.setItem('Host', this.HostValue)
        // 重置当前页为1
        this.currentPage = 1
        // 获取deployment列表
        this.getList()
      }
    }
  },
  created() {
    this.service_name = this.$route.params && this.$route.params.servicename
    this.getHostList()
  },
  methods: {
    getvalue(inhost) {
      for (let i = 0; i < this.TestMap.length; i++) {
        if (this.TestMap[i].Host === inhost) {
          return this.TestMap[i].id
        }
      }
    },
    getList() {
      this.listLoading = true
      this.listQuery.service_name = this.service_name
      // 获取当前的host id发给后端
      this.listQuery.host_id = this.getvalue(this.HostValue)
      GetAgentTaskList(this.listQuery).then((response) => {
        this.list = response.data.taskListItem
        this.total = response.data.Total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    getHostList() {
      this.listQuery.service_name = this.service_name

      GetAgentHostList(this.listQuery).then(res => {
        // 判断当前服务是否拥有主机信息
        if (res.data.Total < 1 || res.data.Total === undefined) {
          this.$notify({
            title: 'Success',
            message: '当前服务备份主机为空,请先添加备份主机',
            type: 'success',
            duration: 1000
          })
          this.$router.push('/cluster/host')
          return
        }
        this.HostList = res.data.listItem
        // 默认请求服务第一个
        this.HostValue = this.HostList[0].Host
        this.HostID = this.HostList[0].ID

        this.TestMap = this.HostList.map(item => ({
          id: item.ID,
          Host: item.Host
        }))
        // for (let i=0;i<this.TestMap.length;i++) {
        //   if (this.TestMap[i].Host === '127.0.0.1:3307') {
        //     return this.TestMap[i].id
        //   }
        // }
        //
        // for (let i=0;i<this.HostList.length;i++) {
        //   this.TestMap.id = this.HostList[i].ID
        //   this.TestMap.Host = this.HostList[i].Host
        // }
        this.getList()
      })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
    },
    handleStartAllTask() {
      const startQuery = {
        'host_id': this.getvalue(this.HostValue),
        'service_name': this.service_name
      }
      StartAgentHostTask(startQuery).then((response) => {
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
        'host_id': this.getvalue(this.HostValue),
        'service_name': this.service_name
      }
      StopAgentHostTask(stopQuery).then((response) => {
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
      this.$router.push('/cluster/task_edit/' + this.getvalue(this.HostValue) + '/' + row.ID + '/' + this.service_name + '/edit')
    },
    handleAddTask() {
      this.$router.push('/cluster/task_add/' + this.getvalue(this.HostValue) + '/' + this.service_name + '/add')
    },
    handleDelete(row, index) {
      this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deleteQuery = {
          'id': row.ID,
          'service_name': this.service_name
        }
        DeleteAgentTask(deleteQuery).then((response) => {
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
          'task_id': row.ID,
          'service_name': this.service_name
        }
        StartAgentTask(startQuery).then((response) => {
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
      console.log(row)
      const startQuery = {
        'task_id': row.ID,
        'service_name': this.service_name
      }
      StopAgentTask(startQuery).then((response) => {
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
