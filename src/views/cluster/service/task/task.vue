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
            <el-form-item label="数据库名">
              <el-input v-model="form.db_name" placeholder="例如: mysql" />
            </el-form-item>
            <el-form-item label="数据库备份时间">
              <el-input v-model="form.backup_cycle" placeholder="例如: 30 12 * * ?  (参考crontab格式,精确到分钟)" />
            </el-form-item>
            <el-form-item label="数据保留周期">
              <el-input v-model="form.keep_number" placeholder="例如: 7  (单位天)" />
            </el-form-item>
            <el-form-item >
              <el-switch
                v-model="form.is_ding_send"
                :active-value="1"
                :inactive-value="0"
              />
              <span style="color:#606266;font-weight: 700;">&nbsp;&nbsp;&nbsp;是否发送钉钉通知&nbsp;&nbsp;</span>
              <el-switch
                v-model="form.is_oss_save"
                :active-value="1"
                :inactive-value="0"
              />
              <span style="color:#606266;font-weight: 700;">&nbsp;&nbsp;&nbsp;是否保存至OSS&nbsp;&nbsp;</span>
            </el-form-item>
            <el-form-item v-if="form.is_ding_send===1" label="钉钉Secret">
              <el-input v-model="form.ding_secret" placeholder="最多255字符必填" />
            </el-form-item>
            <el-form-item v-if="form.is_ding_send===1" label="钉钉AccessToken">
              <el-input v-model="form.ding_access_token" placeholder="最多255字符必填" />
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="OSS类型">
              <el-radio-group v-model="form.oss_type">
                <el-radio :label="0">阿里云</el-radio>
                <el-radio :label="1">Minio</el-radio>
                <el-radio :label="2">MyCloud</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="OssEndpoint">
              <el-input v-model="form.endpoint" placeholder="对象存储地址 minio要写9000数据端口" />
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="OssAccess">
              <el-input v-model="form.oss_access" placeholder="OssAccess" />
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="OssSecret">
              <el-input v-model="form.oss_secret" placeholder="OssSecret" />
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="桶名">
              <el-input v-model="form.bucket_name" placeholder="bucket_name" />
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="Directory">
              <el-input v-model="form.directory" placeholder="桶内指定目录" />
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
        is_ding_send: 0,
        is_oss_save: 0,
        ding_access_token: '',
        ding_secret: '',
        oss_type: 1,
        endpoint: '',
        oss_access: '',
        oss_secret: '',
        bucket_name: '',
        directory: ''
      }
    }
  },
  created() {
     this.host_id = Number(this.$route.params && this.$route.params.hostid)
    this.service_name = this.$route.params && this.$route.params.servicename
    this.task_id = Number(this.$route.params && this.$route.params.taskid)
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
      GetAgentTaskDetail(query).then(response => {
        this.form.id = Number(this.task_id)
        this.form.keep_number = response.data.taskInfo.KeepNumber
        this.form.db_name = response.data.taskInfo.DBName
        this.form.host = response.data.hostInfo.Host
        this.form.backup_cycle = response.data.taskInfo.BackupCycle
        this.form.is_ding_send = response.data.dingInfo.IsDingSend
        this.form.ding_secret = response.data.dingInfo.DingAccessToken
        this.form.ding_access_token = response.data.dingInfo.DingSecret
        this.form.is_oss_save = response.data.ossInfo.IsOssSave
        this.form.oss_type = response.data.ossInfo.OssType
        this.form.oss_secret = response.data.ossInfo.OssSecret
        this.form.oss_access = response.data.ossInfo.OssAccess
        this.form.endpoint = response.data.ossInfo.Endpoint
        this.form.directory = response.data.ossInfo.Directory
        this.form.bucket_name = response.data.ossInfo.BucketName
      }).catch(() => {
      })
    },
    handleSubmit() {
      this.submitButDisabled = true
      const query = Object.assign({}, this.form)
      query.keep_number = Number(query.keep_number)
      // 新增hostid与service_name到请求中去
      query.host_id = this.host_id
      query.service_name = this.service_name
      if (this.isEdit) {
        UpdateAgentTask(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '修改成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push("/cluster/list/" + this.service_name)
        }).catch(() => {
          this.submitButDisabled = false
        })
      } else {
        AddAgentTask(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push("/cluster/list/" + this.service_name)
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
