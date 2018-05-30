<template>
  <div class="page_server_config">

    <!-- 服务列表 -->
    <wrapper v-if="configList" ref="configListLoading">
      <let-button size="small" theme="primary" class="add-btn" @click="addConfig">添加配置</let-button>

      <let-table :data="configList" title="配置列表" empty-msg="暂无数据">
        <let-table-column width="40px">
          <template slot-scope="scope">
            <let-radio v-model="checkedConfigId" :label="scope.row.id">&nbsp;</let-radio>
          </template>
        </let-table-column>
        <let-table-column title="服务名称" prop="server_name"></let-table-column>
        <let-table-column title="文件名称" prop="filename"></let-table-column>
        <let-table-column title="最后修改时间" prop="posttime"></let-table-column>
        <let-table-column title="操作" width="260px">
          <template slot-scope="scope">
            <let-table-operation @click="changeConfig(scope.row, 'configList')">修改配置</let-table-operation>
            <let-table-operation @click="deleteConfig(scope.row.id)">删除配置</let-table-operation>
            <let-table-operation @click="showDetail(scope.row)">查看内容</let-table-operation>
            <let-table-operation @click="showHistory(scope.row.id)">查看历史</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </wrapper>

    <!-- 引用文件列表 -->
    <wrapper v-if="refFileList && showOthers" ref="refFileListLoading">
      <let-button size="small" theme="primary" class="add-btn" @click="addRefFile">添加引用文件</let-button>

      <let-table :data="refFileList" title="引用文件列表" empty-msg="暂无数据">
        <let-table-column title="服务名称" prop="server_name"></let-table-column>
        <let-table-column title="文件名称" prop="filename"></let-table-column>
        <let-table-column title="节点" prop="node_name"></let-table-column>
        <let-table-column title="最后修改时间" prop="posttime"></let-table-column>
        <let-table-column title="操作" width="260px">
          <template slot-scope="scope">
            <!-- <let-table-operation @click="configServer(scope.row.id)">修改配置</let-table-operation>
            <let-table-operation @click="restartServer(scope.row.id)">删除配置</let-table-operation>
            <let-table-operation @click="manageServant(scope.row)">查看内容</let-table-operation>
            <let-table-operation @click="showMoreCmd(scope.row)">查看历史</let-table-operation> -->
          </template>
        </let-table-column>
      </let-table>
    </wrapper>

    <!-- 节点配置列表 -->
    <wrapper v-if="nodeConfigList && showOthers" ref="nodeConfigListLoading">
      <let-button size="small" theme="primary" class="add-btn" @click="pushNodeConfig">PUSH 配置文件</let-button>
      <let-checkbox
        class="check-all"
        v-model="nodeCheckAll"
        v-if="nodeConfigList.length"></let-checkbox>

      <let-table :data="nodeConfigList" title="节点配置列表" empty-msg="暂无数据">
        <let-table-column width="40px">
          <template slot-scope="scope">
            <let-checkbox v-model="nodeCheckList" :label="scope.row.id"></let-checkbox>
          </template>
        </let-table-column>
        <let-table-column title="服务名称" prop="server_name"></let-table-column>
        <let-table-column title="节点" prop="node_name"></let-table-column>
        <let-table-column title="文件名称" prop="filename"></let-table-column>
        <let-table-column title="最后修改时间" prop="posttime"></let-table-column>
        <let-table-column title="操作" width="400px">
          <template slot-scope="scope">
            <let-table-operation @click="changeConfig(scope.row, 'nodeConfigList')">修改配置</let-table-operation>
            <let-table-operation @click="showMergedDetail(scope.row.id)">查看合并后配置</let-table-operation>
            <let-table-operation @click="showDetail(scope.row)">查看节点内容</let-table-operation>
            <let-table-operation @click="showHistory(scope.row.id)">查看历史</let-table-operation>
            <let-table-operation @click="handleRefFiles(scope.row)">管理引用文件</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </wrapper>

    <!-- 添加、修改配置弹窗 -->
    <let-modal
      v-model="configModal.show"
      :title="configModal.isNew ? '添加配置' : '修改配置'"
      width="700px"
      @on-confirm="updateConfigFile"
      @close="closeConfigModal"
      @on-cancel="closeConfigModal">
      <let-form
        v-if="configModal.model"
        ref="configForm" itemWidth="100%">
        <let-form-item label="文件名称" required>
          <let-input
            size="small"
            :disabled="!configModal.isNew"
            v-model="configModal.model.filename"
            required
          ></let-input>
        </let-form-item>
        <let-form-item label="原因" v-if="!configModal.isNew">
          <let-input
            size="small"
            v-model="configModal.model.reason"
          ></let-input>
        </let-form-item>
        <let-form-item label="文件内容" required>
          <let-input
            size="large"
            type="textarea"
            :rows="4"
            v-model="configModal.model.config"
            required
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 查看弹窗 -->
    <let-modal
      v-model="detailModal.show"
      :title="detailModal.title"
      width="700px"
      :footShow="false"
      @close="closeDetailModal">
      <let-table
        class="history-table"
        v-if="detailModal.model && detailModal.model.table"
        :data="detailModal.model.table" empty-msg="暂无数据">
        <let-table-column title="时间" prop="posttime"></let-table-column>
        <let-table-column title="原因" prop="reason"></let-table-column>
        <let-table-column title="文件内容" width="90px">
          <template slot-scope="scope">
            <let-table-operation @click="showTableDeatil(scope.row)">点击查看</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <pre
        v-if="(detailModal.model && !detailModal.model.table) ||
          (detailModal.model && detailModal.model.table && detailModal.model.detail)"
        >{{detailModal.model.detail || '空'}}</pre>
      <div class="detail-loading" ref="detailModalLoading"></div>
    </let-modal>

    <!-- 节点配置列表的管理引用文件弹窗 -->
    <let-modal
      v-model="nodeRefFileListModal.show"
      :title="detailModal.title"
      width="700px"
      :footShow="false"
      @close="closeDetailModal">
      <wrapper v-if="refFileList">
        <let-button size="small" theme="primary" class="add-btn" @click="addRefFile">添加引用文件</let-button>

        <let-table :data="refFileList" title="引用文件列表" empty-msg="暂无数据">
          <let-table-column title="服务名称" prop="server_name"></let-table-column>
          <let-table-column title="文件名称" prop="filename"></let-table-column>
          <let-table-column title="节点" prop="node_name"></let-table-column>
          <let-table-column title="最后修改时间" prop="posttime"></let-table-column>
          <let-table-column title="操作" width="260px">
            <template slot-scope="scope">
              <!-- <let-table-operation @click="configServer(scope.row.id)">修改配置</let-table-operation>
              <let-table-operation @click="restartServer(scope.row.id)">删除配置</let-table-operation>
              <let-table-operation @click="manageServant(scope.row)">查看内容</let-table-operation>
              <let-table-operation @click="showMoreCmd(scope.row)">查看历史</let-table-operation> -->
            </template>
          </let-table-column>
        </let-table>
      </wrapper>
    </let-modal>

    <!-- 推送结果弹窗 -->
    <let-modal
      v-model="pushResultModal.show"
      width="700px"
      :footShow="false"
      @close="closePushResultModal">
      <let-table v-if="pushResultModal.model" :data="pushResultModal.model" title="PUSH 配置结果" empty-msg="暂无数据">
        <let-table-column title="服务">
          <template slot-scope="scope">
            <span :class="scope.row.ret_code !== 0 ? 'danger' : 'success'">{{scope.row.server_name}}</span>
          </template>
        </let-table-column>
        <let-table-column title="结果">
          <template slot-scope="scope">
            <span class="result" :class="scope.row.ret_code !== 0 ? 'danger' : 'success'">{{scope.row.err_msg}}</span>
          </template>
        </let-table-column>
      </let-table>
    </let-modal>

  </div>
</template>

<script>
import wrapper from '@/components/section-wrappper';

export default {
  name: 'ServerConfig',
  components: {
    wrapper,
  },
  data() {
    return {
      // 当前页面信息
      serverData: {
        level: 5,
        application: '',
        server_name: '',
        set_name: '',
        set_area: '',
        set_group: '',
      },

      // 服务列表
      checkedConfigId: '',
      configList: [],

      // 引用文件列表
      refFileList: null,

      // 节点配置列表
      nodeConfigList: null,
      nodeCheckList: [],

      // 添加、修改配置弹窗
      configModal: {
        show: false,
        isNew: true,
        model: null,
      },

      // 查看弹窗
      detailModal: {
        show: false,
        title: '',
        model: null,
      },

      // 节点配置列表的管理引用文件弹窗
      nodeRefFileListModal: {
        show: false,
        model: null,
      },

      // 节点配置列表的管理引用文件弹窗
      pushResultModal: {
        show: false,
        model: null,
      },
    };
  },
  computed: {
    showOthers() {
      return this.serverData.level === 5;
    },
    nodeCheckAll: {
      get() {
        return this.nodeConfigList && this.nodeConfigList.length ?
          this.nodeCheckList.length === this.nodeConfigList.length : false;
      },
      set(value) {
        if (value) {
          this.nodeCheckList = this.nodeConfigList.map(item => item.id);
        } else {
          this.nodeCheckList = [];
        }
      },
    },
  },
  watch: {
    checkedConfigId() {
      this.$nextTick(() => {
        this.getRefFileList();
        this.getNodeConfigList();
      });
    },
  },
  methods: {
    // 配置列表
    getConfigList(query) {
      const loading = this.$refs.configListLoading.$loading.show();

      this.$ajax.getJSON('/server/api/config_file_list', query).then((data) => {
        loading.hide();
        this.configList = data;
        this.refFileList = [];
        this.nodeConfigList = [];
        if (data[0] && data[0].id) this.checkedConfigId = data[0].id;
      }).catch((err) => {
        loading.hide();
        this.$confirm(err.err_msg || err.message || '加载配置列表失败', '是否重试？', '提示').then(() => {
          this.getConfigList();
        });
      });
    },
    addConfig() {
      this.configModal.model = {
        filename: '',
        config: '',
      };
      this.configModal.isNew = true;
      this.configModal.show = true;
    },
    changeConfig(config, array) {
      this.configModal.model = Object.assign({
        reason: '',
      }, config);
      this.configModal.target = array;
      this.configModal.isNew = false;
      this.configModal.show = true;
    },
    updateConfigFile() {
      if (this.$refs.configForm.validate()) {
        const loading = this.$Loading.show();
        const model = this.configModal.model;
        // 新增
        if (this.configModal.isNew) {
          const query = Object.assign({
            application: this.serverData.application,
            level: this.serverData.level,
            server_name: this.serverData.server_name,
          }, model);
          this.$ajax.postJSON('/server/api/add_config_file', query).then((res) => {
            loading.hide();
            this.configList.unshift(res);
            if (this.configList.length === 1) {
              this.checkedConfigId = res.id;
            }
            this.$tip.success('添加配置成功');
            this.closeConfigModal();
          }).catch(() => {
            loading.hide();
            this.$tip.error('添加配置失败');
          });
        // 修改
        } else {
          this.$ajax.postJSON('/server/api/update_config_file', {
            config: model.config,
            id: model.id,
            reason: model.reason,
          }).then((res) => {
            loading.hide();
            this[this.configModal.target] = this[this.configModal.target].map((item) => {
              if (item.id === res.id) {
                return res;
              }
              return item;
            });
            if (this.checkedConfigId === res.id) {
              this.getRefFileList();
              this.getNodeConfigList();
            }
            this.$tip.success('修改配置成功');
            this.closeConfigModal();
          }).catch(() => {
            loading.hide();
            this.$tip.error('修改配置失败');
          });
        }
      }
    },
    closeConfigModal() {
      if (this.$refs.configForm) this.$refs.configForm.resetValid();
      this.configModal.model = null;
      this.configModal.show = false;
    },
    deleteConfig(id) {
      this.$confirm('您确定要删除这条配置吗？', '提示').then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_config_file', {
          id,
        }).then((res) => {
          loading.hide();
          this.configList = this.configList.map((item) => {  // eslint-disable-line
            if (item.id !== res[0]) return item;
          }).filter(item => item);

          if (this.configList && this.configList.length) {
            if (this.checkedConfigId === res[0]) {
              this.checkedConfigId = this.configList[0].id;
            }
          } else {
            this.refFileList = [];
            this.nodeConfigList = [];
          }

          this.$tip.success('删除配置成功');
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`删除配置失败: ${err.err_msg || err.message}`);
        });
      });
    },

    // 引用文件列表
    getRefFileList() {
      if (!this.showOthers) return;
      const loading = this.$refs.refFileListLoading.$loading.show();

      this.$ajax.getJSON('/server/api/config_ref_list', {
        config_id: this.checkedConfigId,
      }).then((data) => {
        loading.hide();
        this.refFileList = data;
      }).catch((err) => {
        loading.hide();
        this.refFileList = [];
        this.$tip.error({
          title: '加载引用文件列表失败',
          message: err.err_msg || err.message || '网络错误',
        });
      });
    },
    addRefFile() {
      // todo
    },

    // 节点配置列表
    getNodeConfigList() {
      if (!this.showOthers) return;
      const loading = this.$refs.nodeConfigListLoading.$loading.show();

      const query = Object.assign({
        config_id: this.checkedConfigId,
      }, this.serverData);
      this.$ajax.getJSON('/server/api/node_config_file_list', query).then((data) => {
        loading.hide();
        this.nodeConfigList = data;
      }).catch((err) => {
        loading.hide();
        this.nodeConfigList = [];
        this.$tip.error({
          title: '加载节点配置列表失败',
          message: err.err_msg || err.message || '网络错误',
        });
      });
    },
    pushNodeConfig() {
      if (!this.nodeCheckList.length) {
        this.$tip.warning('请先选择节点');
        return;
      }
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/server/api/push_config_file', {
        config_ids: this.nodeCheckList.join(';'),
      }).then((res) => {
        loading.hide();
        this.pushResultModal.model = res;
        this.pushResultModal.show = true;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`PUSH 配置文件失败: ${err.err_msg || err.message}`);
      });
    },
    closePushResultModal() {
      this.pushResultModal.model = null;
      this.pushResultModal.show = false;
    },

    // 显示详情弹窗
    showDetail(item) {
      this.detailModal.title = '查看配置文件内容';
      this.detailModal.model = {
        detail: item.config,
      };
      this.detailModal.show = true;
    },
    showMergedDetail(id) {
      this.detailModal.title = '查看合并后内容';
      this.detailModal.show = true;
      const loading = this.$loading.show({
        target: this.$refs.detailModalLoading,
      });

      this.$ajax.getJSON('/server/api/merged_node_config', {
        id,
      }).then((data) => {
        loading.hide();
        this.detailModal.model = {
          detail: data,
        };
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`获取合并后配置失败: ${err.err_msg || err.message}`);
      });
    },
    showHistory(id) {
      this.detailModal.title = '查看配置文件变更记录';
      this.detailModal.show = true;
      const loading = this.$loading.show({
        target: this.$refs.detailModalLoading,
      });

      this.$ajax.getJSON('/server/api/config_file_history_list', {
        config_id: id,
      }).then((data) => {
        loading.hide();
        this.detailModal.model = {
          table: data,
          detail: '',
        };
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`获取配置文件变更记录失败: ${err.err_msg || err.message}`);
      });
    },
    showTableDeatil(item) {
      this.detailModal.model.detail = item.content;
    },
    closeDetailModal() {
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    // 节点管理配置文件
    handleRefFiles() {
      // todo
    },
  },
  created() {
    this.serverData = this.$parent.getServerData();
  },
  mounted() {
    this.getConfigList(this.serverData);
  },
};
</script>

<style>
@import '../../assets/css/variable.css';

.page_server_config {
  .add-btn {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }
  .check-all {
    position: absolute;
    z-index: 2;
    top: 60px;
    left: 16px;
  }
  .let-table caption {
    padding-bottom: 16px;
  }
  .danger {
    color: var(--off-color);
  }
  .success {
    color: var(--active-color);
  }
  .result {
    display: inline-block;
    max-width: 420px;
    word-break: break-word;
    padding-right: 10px;
  }

  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .detail-loading {
    height: 28px;
    &:only-child {
      margin: 20px 0;
    }
  }
  .history-table {
    margin-top: 20px;
  }

  .let-checkbox {
    vertical-align: initial;
  }
}
</style>
