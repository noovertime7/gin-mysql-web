<template>
  <div class="mixin-components-container">
    <el-row>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span v-if="isEdit===false">创建任务</span>
          <span v-if="isEdit===true">修改任务</span>
        </div>
        <div style="margin-bottom:50px;">
          <el-form ref="form" :model="form" label-width="140px">
            <el-form-item label="ES主机地址">
              <el-input v-model="form.host" placeholder="例如: http://127.0.0.1:9200" />
            </el-form-item>
            <el-form-item label="ES用户名">
              <el-input v-model="form.user" placeholder="ES用户名" />
            </el-form-item>
            <el-form-item label="ES密码">
              <el-input v-model="form.password" placeholder="ES密码"  show-password/>
            </el-form-item>
            <el-form-item label="ES快照周期">
              <el-input v-model="form.backup_cycle" placeholder="例如: 30 12 * * ?  (参考crontab格式,精确到分钟)" />
            </el-form-item>
            <el-form-item label="快照保留周期">
              <el-input v-model="form.keep_number" placeholder="例如: 7  (单位天)" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">立即提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import {AddAgentTask, GetAgentTaskDetail, UpdateAgentTask} from "@/api/agent-task";
import {addEsTask, getEsTaskDetail, updateEsTask} from "@/api/elastic";

export default {
  name: 'TaskAddUpdate',
  data() {
    return {
      host_id:0,
      task_id: 0,
      service_name: '',
      submitButDisabled: false,
      isEdit: false,
      form: {
        service_name: '',
        id: '',
        host: '',
        host_id: '',
        password: '',
        user: '',
        db_name: '',
        backup_cycle: '',
        keep_number: '',
      }
    }
  },
  created() {
     this.task_id = Number(this.$route.params && this.$route.params.id)
    this.service_name = this.$route.params && this.$route.params.servicename
    const action = this.$route.params && this.$route.params.action
    // 判断是否为编辑操作
    if (action !== 'add') {
      this.isEdit = true
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      const query = { 'id': this.task_id ,'service_name':this.service_name}
      getEsTaskDetail(query).then(response => {
        this.form.id = Number(this.task_id)
        this.form.keep_number = response.data.esTaskInfo.KeepNumber
        this.form.host = response.data.esTaskInfo.EsHost
        this.form.user = response.data.esTaskInfo.EsUser
        this.form.password = response.data.esTaskInfo.EsPassword
        this.form.backup_cycle = response.data.esTaskInfo.BackupCycle
      }).catch(() => {
      })
    },
    handleSubmit() {
      this.submitButDisabled = true
      const query = Object.assign({}, this.form)
      query.keep_number = Number(query.keep_number)
      // 新增hostid与service_name到请求中去
      query.service_name = this.service_name
      if (this.isEdit) {
        updateEsTask(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '修改成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push("/cluster/elastic/list/" + this.service_name)
        }).catch(() => {
          this.submitButDisabled = false
        })
      } else {
        addEsTask(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push("/cluster/elastic/list/" + this.service_name)
        }).catch(() => {
          this.submitButDisabled = false
        })
      }
    }
  }
}
</script>

<style scoped>
.mixin-components-container {
  background-color: #f0f2f5;
  padding: 30px;
  min-height: calc(100vh - 84px);
}

</style>
