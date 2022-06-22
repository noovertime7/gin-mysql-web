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
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Search
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
      >
        Add
      </el-button>
    </div>

    <el-table
      :key="tableKey"
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
      <el-table-column label="主机" align="center" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="center" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.db_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下次执行时间" align="center" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.backup_cycle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备份任务状态" align="center" min-width="100px">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.Status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleDelete">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="任务创建时间" align="center" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.create_at }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini"> 启动 </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
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

const loadTypeOptions = [
  { key: '0', display_name: 'HTTP' },
  { key: '1', display_name: 'TCP' },
  { key: '2', display_name: 'GRPC' }
]

const loadTypeKeyValue = loadTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'TaskList',
  components: { Pagination },
  directives: { waves },
  filters: {
    loadtypeFilter(type) {
      return loadTypeKeyValue[type]
    }
  },
  data() {
    return {
      status: true,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
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
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      taskList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
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

    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
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
    rtClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
