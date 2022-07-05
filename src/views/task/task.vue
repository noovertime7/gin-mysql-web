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
            <el-form-item label="是否开启全库备份">
              <el-switch
                v-model="form.is_all_dbBak"
                :active-value="1"
                :inactive-value="0"
              />
              <span style="color:#606266;font-weight: 700;">&nbsp;&nbsp;&nbsp;是否发送钉钉通知&nbsp;&nbsp;</span>
              <el-switch
                v-model="form.is_ding_send"
                :active-value="1"
                :inactive-value="0"
              />
              <span style="color:#606266;font-weight: 700;">&nbsp;&nbsp;&nbsp;是否保存至OSS&nbsp;&nbsp;</span>
              <el-switch
                v-model="form.is_oss_save"
                :active-value="1"
                :inactive-value="0"
              />
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
                <el-radio :label="1">七牛云</el-radio>
                <el-radio :label="2">MyCloud</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.is_oss_save===1" label="OssEndpoint">
              <el-input v-model="form.endpoint" placeholder="OssEndpoint" />
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
              <el-input v-model="form.directory" placeholder="OSS目录" />
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
import { taskAdd, taskDetail, taskUpdate } from '@/api/task'
export default {
  name: 'TaskAddUpdate',
  data() {
    return {
      submitButDisabled: false,
      isEdit: false,
      form: {
        id: '',
        host: '',
        password: '',
        user: '',
        db_name: '',
        backup_cycle: '',
        keep_number: '',
        is_all_dbBak: 0,
        is_ding_send: 0,
        is_oss_save: 0,
        ding_access_token: '',
        ding_secret: '',
        oss_type: 0,
        endpoint: '',
        oss_access: '',
        oss_secret: '',
        bucket_name: '',
        directory: ''
      }
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    if (id > 0) {
      this.isEdit = true
      this.fetchData(id)
    }
  },
  methods: {
    fetchData(id) {
      const query = { 'id': id }
      taskDetail(query).then(response => {
        this.form.id = Number(id)
        this.form.keep_number = response.data.task_info.keep_number
        this.form.db_name = response.data.task_info.db_name
        this.form.host = response.data.task_info.host
        this.form.is_all_dbbak = response.data.task_info.is_all_dbbak
        this.form.user = response.data.task_info.user
        this.form.password = response.data.task_info.password
        this.form.backup_cycle = response.data.task_info.backup_cycle
        this.form.is_ding_send = response.data.ding.is_ding_send
        this.form.ding_secret = response.data.ding.ding_secret
        this.form.ding_access_token = response.data.ding.ding_access_token
        this.form.is_oss_save = response.data.oss.is_oss_save
        this.form.oss_type = response.data.oss.oss_type
        this.form.oss_secret = response.data.oss.oss_secret
        this.form.oss_access = response.data.oss.oss_access
        this.form.endpoint = response.data.oss.endpoint
        this.form.directory = response.data.oss.directory
        this.form.bucket_name = response.data.oss.bucket_name
      }).catch(() => {
      })
    },
    handleSubmit() {
      this.submitButDisabled = true
      const query = Object.assign({}, this.form)
      query.keep_number = Number(query.keep_number)
      console.log(query)
      if (this.isEdit) {
        taskUpdate(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '修改成功',
            type: 'success',
            duration: 2000
          })
        }).catch(() => {
          this.submitButDisabled = false
        })
      } else {
        taskAdd(query).then(response => {
          this.submitButDisabled = false
          this.$notify({
            title: 'Success',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
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

.component-item {
  min-height: 100px;
}
</style>
