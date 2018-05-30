<template>
  <div class="page_server_publish">
    <!-- 服务列表 -->
    <div v-if="!showHistory">
      <let-table ref="table" v-if="serverList && serverList.length > 0" :data="serverList" title="服务列表" empty-msg="暂无服务数据">
        <let-table-column>
          <template slot="head" slot-scope="props">
            <let-checkbox v-model="isCheckedAll"></let-checkbox>
          </template>
          <template slot-scope="scope">
            <let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>
          </template>
        </let-table-column>
        <let-table-column title="节点" prop="node_name"></let-table-column>
        <let-table-column title="启用Set">
          <template slot-scope="scope">
            <span>{{ scope.row.enable_set ? '是' : '否' }}</span>
          </template>
        </let-table-column>
        <let-table-column title="set名" prop="set_name"></let-table-column>
        <let-table-column title="set区域" prop="set_area"></let-table-column>
        <let-table-column title="set组" prop="set_group"></let-table-column>
        <let-table-column title="设置状态">
          <template slot-scope="scope">
            <span :class="scope.row.setting_state == 'active' ? 'status-active' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column title="当前状态">
           <template slot-scope="scope">
            <span :class="scope.row.present_state == 'active' ? 'status-active' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column title="版本" prop="patch_version"></let-table-column>
        <let-table-column title="发布时间">
          <template slot-scope="scope">
            <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
          </template>
        </let-table-column>
        <let-pagination slot="pagination" align="right"
          :total="totalPage" :page="page" @change="changePage">
        </let-pagination>
        <div slot="operations" style="margin-left: -15px;">
          <let-button theme="primary" size="small" @click="openPublishModal">发布选中节点</let-button>
          <let-button size="small" v-if="serverList && serverList.length > 0" @click="gotoHistory">发布历史</let-button>
        </div>
      </let-table>
      <!-- 发布服务弹出框 -->
      <let-modal
        v-model="publishModal.show"
        title="发布服务"
        width="880px"
        @on-cancel="closePublishModal"
        @on-confirm="savePublishServer">
          <let-form
            v-if="publishModal.model"
            ref="publishForm"
            itemWidth="100%">
              <let-form-item label="应用·服务">
                {{publishModal.model.application}}·{{publishModal.model.server_name}}
              </let-form-item>
              <let-form-item label="待发布节点">
                <div v-for="server in publishModal.model.serverList" :key="server.id">{{server.node_name}}</div>
              </let-form-item>
              <let-form-item label="选择发布版本">
                <let-select
                  size="small"
                  v-model="publishModal.model.patch_id"
                  required
                  required-tip="请选择发布版本"
                >
                  <let-option v-for="d in publishModal.model.patchList" :key="d.id" :value="d.id">
                    {{d.id}} | {{d.posttime}} | {{d.comment}}
                  </let-option>
                </let-select>
                <let-button theme="primary" size="small" class="mt10" @click="showUploadModal">上传发布包</let-button>
              </let-form-item>
              <let-form-item label="备注">
                <let-input
                  type="textarea"
                  :rows="3"
                  v-model="publishModal.model.update_text"
                >
                </let-input>
              </let-form-item>
            </let-form>
      </let-modal>

     <!-- 上传发布包弹出框 -->
      <let-modal
        v-model="uploadModal.show"
        title="上传发布包"
        width="880px"
        :footShow="false"
        @on-cancel="closeUploadModal">
        <let-form
          v-if="uploadModal.model"
          ref="uploadForm"
          itemWidth="100%"
          @submit.native.prevent="uploadPatchPackage">
            <let-form-item label="发布包" itemWidth="400px">
               <let-uploader
                placeholder="请选择任意格式的文件"
                @upload="uploadFile">选择文件
                </let-uploader>
                <span v-if="uploadModal.model.file">{{uploadModal.model.file.name}}</span>
            </let-form-item>
            <let-form-item label="备注">
              <let-input
                type="textarea"
                :rows="3"
                v-model="uploadModal.model.comment"
              >
              </let-input>
            </let-form-item>
            <let-button type="submit" theme="primary">上传</let-button>
        </let-form>
      </let-modal>

     <!-- 发布结果弹出框 -->
     <let-modal
        v-model="finishModal.show"
        title="发布结果"
        width="880px"
        :footShow="false"
        @on-cancel="closeFinishModal">
        <let-table
          v-if="finishModal.model"
          :title="'任务ID:' + finishModal.model.task_no"
          :data="finishModal.model.items">
          <let-table-column title="节点" prop="node_name"></let-table-column>
          <let-table-column title="状态">
            <template slot-scope="scope">
              <let-tag
                :theme="scope.row.status == 2 ? 'success' : (scope.row.status == 3 ? 'danger' : '')" checked>
                {{statusConfig[scope.row.status] + (scope.row.status != 2 && scope.row.status != 3 ? '...' : '')}}
              </let-tag>
            </template>
          </let-table-column>
        </let-table>
      </let-modal>
    </div>

    <!-- 发布历史 -->
    <div v-if="showHistory">
      <let-form inline itemWidth="300px" @submit.native.prevent="getHistoryList">
        <let-form-item label="日期">
          <let-date-range-picker :start.sync="startTime" :end.sync="endTime"></let-date-range-picker>
        </let-form-item>
        <let-form-item>
          <let-button type="submit" theme="primary">查询</let-button>
        </let-form-item>
      </let-form>
      <let-table ref="historyTable" v-if="historyList && historyList.length > 0" :data="historyList" title="发布历史" empty-msg="暂无历史数据">
        <let-table-column title="任务ID" prop="task_no"></let-table-column>
        <let-table-column title="是否串行">
          <template slot-scope="scope">
            <span>{{scope.row.serial ? '是': '否'}}</span>
          </template>
        </let-table-column>
        <let-table-column title="任务状态">
          <template slot-scope="scope">
            <span>{{ statusMap[scope.row.status] || '-'}}</span>
          </template>
        </let-table-column>
        <let-table-column title="子任务详情">
          <template slot-scope="scope">
            <let-table-operation @click="viewTask(scope.row.task_no)">查看</let-table-operation>
          </template>
        </let-table-column>
        <let-pagination slot="pagination" align="right"
          :total="historyTotalPage" :page="historyPage" @change="changeHistoryPage">
        </let-pagination>
        <div slot="operations" style="margin-left: -15px;">
          <let-button theme="primary" size="small" @click="showHistory=false">返回服务列表</let-button>
        </div>
      </let-table>

      <!-- 子任务详情弹出框 -->
      <let-modal
        v-model="taskModal.show"
        title="子任务详情"
        width="880px"
        :footShow="false"
        @on-cancel="taskModal.show = false">
        <let-table
          v-if="taskModal.model"
          :data="taskModal.model.items">
          <let-table-column title="子任务ID" prop="item_no"></let-table-column>
          <let-table-column title="应用" prop="application"></let-table-column>
          <let-table-column title="服务" prop="server_name"></let-table-column>
          <let-table-column title="节点" prop="node_name"></let-table-column>
          <let-table-column title="命令" prop="command"></let-table-column>
          <let-table-column title="开始时间" prop="start_time"></let-table-column>
          <let-table-column title="结束时间" prop="end_time"></let-table-column>
          <let-table-column title="状态信息" prop="status_info"></let-table-column>
          <let-table-column title="执行信息" prop="execute_info"></let-table-column>
        </let-table>
      </let-modal>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ServerPublish',
  data() {
    return {
      activeKey: '',
      treeData: [],
      totalServerList: [],
      serverList: [],
      isCheckedAll: false,
      totalPage: 0,
      pageSize: 20,
      page: 1,
      publishModal: {
        show: false,
        model: null,
      },
      finishModal: {
        show: false,
        model: true,
      },
      statusConfig: {
        0: '未开始',
        1: '执行中',
        2: '成功',
        3: '失败',
        4: '取消',
        5: '部分成功',
      },
      statusMap: {
        0: 'EM_T_NOT_START',
        1: 'EM_T_RUNNING',
        2: 'EM_T_SUCCESS',
        3: 'EM_T_FAILED',
        4: 'EM_T_CANCEL',
        5: 'EM_T_PARIAL',
      },
      showHistory: false,
      startTime: '',
      endTime: '',
      totalHistoryList: [],
      historyList: [],
      historyTotalPage: 0,
      historyPage: 1,
      historyPageSize: 20,
      taskModal: {
        show: false,
        modal: true,
      },
      uploadModal: {
        show: false,
        model: null,
      },
    };
  },
  methods: {
    getServerList() {
      // 获取服务列表
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/server/api/server_list', {
        tree_node_id: this.$route.params.treeid,
      }).then((data) => {
        loading.hide();
        const items = data || [];
        items.forEach((item) => {
          item.isChecked = false;
        });
        this.totalServerList = items;
        this.totalPage = Math.ceil(this.totalServerList.length / this.pageSize);
        this.page = 1;
        this.updateServerList();
      }).catch((err) => {
        loading.hide();
        this.$confirm(err.err_msg || err.message || '加载服务列表失败', '是否重试？').then(() => {
          this.getServerList();
        });
      });
    },
    changePage(page) {
      this.page = page;
    },
    openPublishModal() {
      const checkedServerList = this.serverList.filter(item => item.isChecked);
      if (checkedServerList.length <= 0) {
        this.$tip.warning('请至少选择一个服务节点');
        return;
      }
      const first = checkedServerList[0];
      this.publishModal.model = {
        application: first.application,
        server_name: first.server_name,
        serverList: checkedServerList,
        patchList: [],
        patch_id: '',
        update_text: '',
      };
      this.getPatchList(first.application, first.server_name).then((data) => {
        this.publishModal.model.patchList = data;
      });
      this.publishModal.show = true;
    },
    getPatchList(application, serverName) {
      return this.$ajax.getJSON('/server/api/server_patch_list', {
        application,
        module_name: serverName,
      }).then(data => data);
    },
    closePublishModal() {
      // 关闭发布弹出框
      this.publishModal.show = false;
      this.publishModal.modal = null;
      this.$refs.publishForm.resetValid();
    },
    savePublishServer() {
      // 发布
      if (this.$refs.publishForm.validate()) {
        const items = [];
        this.publishModal.model.serverList.forEach((item) => {
          items.push({
            server_id: item.id,
            command: 'patch_tars',
            parameters: {
              patch_id: this.publishModal.model.patch_id,
              bak_flag: item.bak_flag,
              update_text: this.publishModal.model.update_text,
            },
          });
        });
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/add_task', {
          serial: true,
          items,
        }).then((data) => {
          loading.hide();
          this.closePublishModal();
          this.finishModal.model = data;
          this.finishModal.show = true;
          // 实时更新状态
          data.items.forEach((item) => {
            const status = parseInt(item.status, 10);
            if (status !== 2 && status !== 3) {
              this.getTaskRepeat(item.task_no);
            }
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`发布失败: ${err.message || err.err_msg}`);
        });
      }
    },
    closeFinishModal() {
      // 关闭发布结果弹出框
      this.finishModal.show = false;
      this.finishModal.modal = null;
      this.$refs.finishForm.resetValid();
    },
    getTaskRepeat(taskId) {
      let timerId;
      const getTask = () => {
        this.$ajax.getJSON('/server/api/task', {
          task_no: taskId,
        }).then((data) => {
          this.finishModal.model = data;
          data.items.forEach((item) => {
            if (parseInt(item.status, 10) === 2 || parseInt(item.status, 10) === 3) {
              clearTimeout(timerId);
            }
          });
        }).catch((err) => {
          clearTimeout(timerId);
          this.$tip.error(`获取任务信息失败: ${err.message || err.err_msg}`);
        });
      };
      timerId = setTimeout(getTask, 3000);
    },
    updateServerList() {
      // 更新服务列表
      const start = (this.page - 1) * this.pageSize;
      const end = this.page * this.pageSize;
      this.serverList = this.totalServerList.slice(start, end);
    },
    gotoHistory() {
      // 切换到发布历史
      this.showHistory = true;
      this.getHistoryList();
    },
    getHistoryList() {
      // 更新历史记录
      const loading = this.$Loading.show();
      const params = {
        application: this.serverList[0].application || '',
        server_name: this.serverList[0].server_name || '',
        from: this.startTime,
        to: this.endTime,
      };
      this.$ajax.getJSON(`/server/api/task_list`, params).then((data) => {
        loading.hide();
        this.totalHistoryList = data || [];
        this.historyTotalPage = Math.ceil(this.totalHistoryList.length / this.historyPageSize);
        this.historyPage = 1;
        this.updateHistoryList();
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`获取历史记录失败: ${err.message || err.err_msg}`);
      });
    },
    updateHistoryList() {
      // 更新服务列表
      const start = (this.historyPage - 1) * this.historyPageSize;
      const end = this.historyPage * this.historyPageSize;
      this.historyList = this.totalHistoryList.slice(start, end);
    },
    viewTask(taskId) {
      this.$ajax.getJSON('/server/api/task', {
        task_no: taskId,
      }).then((data) => {
        this.taskModal.model = data;
        this.taskModal.show = true;
      });
    },
    changeHistoryPage(page) {
      this.historyPage = page;
    },
    showUploadModal() {
      if (this.serverList.length <= 0) {
        this.$tip.warning('请至少选择一个服务节点');
      }
      this.uploadModal.model = {
        application: this.serverList[0].application || '',
        server_name: this.serverList[0].server_name || '',
        file: null,
        comment: '',
      };
      this.uploadModal.show = true;
    },
    closeUploadModal() {
      // 关闭上传文件弹出框
      this.uploadModal.show = false;
      this.uploadModal.model = null;
      this.$refs.uploadForm.resetValid();
    },
    uploadFile(file) {
      this.uploadModal.model.file = file;
    },
    uploadPatchPackage() {
      // 上传发布包
      if (this.$refs.uploadForm.validate()) {
        const loading = this.$Loading.show();
        const formdata = new FormData();
        formdata.append('application', this.uploadModal.model.application);
        formdata.append('module_name', this.uploadModal.model.server_name);
        formdata.append('suse', this.uploadModal.model.file);
        formdata.append('comment', this.uploadModal.model.comment);
        this.$ajax.postForm('/server/api/upload_patch_package', formdata).then(() => {
          this.getPatchList(this.uploadModal.model.application, this.uploadModal.model.server_name).then((data) => {
            loading.hide();
            this.publishModal.model.patchList = data;
            this.closeUploadModal();
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`上传发布包失败: ${err.message || err.err_msg}`);
        });
      }
    },

    // 处理未发布时间显示
    handleNoPublishedTime(timeStr, noPubTip = '未发布') {
      if (timeStr === '0000:00:00 00:00:00') {
        return noPubTip;
      }
      return timeStr;
    },
  },
  mounted() {
    this.getServerList();
  },
  watch: {
    isCheckedAll() {
      const isCheckedAll = this.isCheckedAll;
      this.serverList.forEach((item) => {
        item.isChecked = isCheckedAll;
      });
    },
    page() {
      this.updateServerList();
    },
    historyPage() {
      this.updateHistoryList();
    },
  },
};
</script>

<style>
@import '../../assets/css/variable.css';

.page_server_publish {
  padding-bottom: 32px;
  .mt10 {
    margin-top: 10px;
  }
}
</style>
