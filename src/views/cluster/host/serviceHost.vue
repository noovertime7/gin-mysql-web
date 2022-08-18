<template>
  <div class="app-container">
    <div class="filter-container">
      <span class="filter-item">服务名: </span>
      <!-- 下拉框 -->
      <!-- filterable：带搜索功能 -->
      <!-- placeholder 默认提示 -->
      <!-- label 显示内容 -->
      <!-- value 绑定到v-model的值中 -->
      <el-select v-model="bakServiceValue" filterable placeholder="请选择" class="filter-item">
        <el-option
          v-for="(item, index) in bakServiceList"
          :key="index"
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select>
      <el-input
        v-model="listQuery.info"
        placeholder="主机名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="info"
        plain
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增主机
      </el-button>
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
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机" width="350px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务数" width="350px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.TaskNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="350px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="在线状态" width="300px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.HostStatus | statusFilter">
            {{ row.HostStatus | loadtypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改主机
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除主机
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主机" prop="host">
          <el-input v-model="temp.host" placeholder="请输入数据库主机，如127.0.0.1:3306" />
        </el-form-item>
        <el-form-item label="服务名" prop="service_name">
          <el-input v-model="temp.service_name" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="请输入数据库用户名 默认root" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" placeholder="请输入数据库密码" show-password />
        </el-form-item>
        <el-form-item label="备注" prop="content">
          <el-input v-model="temp.content" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import {CreateAgentHost, DeleteAgentHost, GetAgentHostList, UpdateAgentHost} from "@/api/agent-host";
import {GetServiceList} from "@/api/agent";

const loadTypeOptions = [
  { key: '0', display_name: '离线' },
  { key: '1', display_name: '在线' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const loadTypeKeyValue = loadTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
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
      bakServiceValue: "",
      bakServiceList: [],
      service_name : '',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        service_name: '',
        page_no: 1,
        page_size: 10,
        info: ''
      },
      importanceOptions: [1, 2, 3],
      showReviewer: false,
      temp: {
        id: '',
        host: '',
        username: 'root',
        password: '',
        content: '',
        service_name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改主机信息',
        create: '添加主机信息'
      },
      rules: {
        host: [{ required: true, message: '请输入数据库主机信息', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getServiceList()
  },
  watch: {
    //监听bakService的值,若发生变化，则执行handler方法中的内容
    bakServiceValue: {
      handler() {
        //将bakService的值存入本地，用于path切换时依旧能获取得到
        localStorage.setItem('bakService', this.bakServiceValue)
        //重置当前页为1
        this.currentPage = 1
        //获取deployment列表
        this.getList()
      }
    },
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.service_name = this.bakServiceValue
      GetAgentHostList(this.listQuery).then((response) => {
        this.list = response.data.listItem
        this.total = response.data.Total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    getServiceList() {
      GetServiceList().then(res => {
        this.bakServiceList = res.data.agent_list
        // 默认请求服务第一个
        this.bakServiceValue = this.bakServiceList[0].name
        this.getList()
      })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    createData(row) {
      // 需要先将service_name赋值
      this.temp.service_name = this.bakServiceValue
      const query = Object.assign({}, this.temp)
      // 发起创建Host请求
      CreateAgentHost(query).then((res) => {
        console.log(res)
        if (res.errno === 0) {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: 'Success',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    updateData() {
      this.temp.service_name = this.bakServiceValue
      const query = Object.assign({}, this.temp)
      UpdateAgentHost(query).then((res) => {
        this.dialogFormVisible = false
        this.getList()
        this.$notify({
          title: 'Success',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.temp = {
        host: '',
        username: 'root',
        password: '',
        content: '',
        service_name: this.bakServiceValue
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.temp = {
          id: row.ID,
          service_name: this.bakServiceValue,
          host: row.Host,
          username: row.UserName,
          password: row.Password,
          content: row.Content
        }
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deleteQuery = {
          'id': row.ID,
          'service_name': this.bakServiceValue
        }
        DeleteAgentHost(deleteQuery).then((response) => {
          this.list.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: '删除主机成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
