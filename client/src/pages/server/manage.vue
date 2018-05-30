<template>
  <div class="page_server_manage">

    <!-- 服务列表 -->
    <let-table v-if="serverList" :data="serverList" title="服务列表" empty-msg="暂无数据" ref="serverListLoading">
      <let-table-column title="服务" prop="server_name"></let-table-column>
      <let-table-column title="节点" prop="node_name" width="140px"></let-table-column>
      <let-table-column title="Set">
        <template slot-scope="scope">
          <span v-if="!scope.row.enable_set">未启用</span>
          <p v-else style="max-width: 200px">
            Set 名：{{scope.row.set_name}}<br>
            Set 区：{{scope.row.set_area}}<br>
            Set 组：{{scope.row.set_group}}
          </p>
        </template>
      </let-table-column>
      <let-table-column title="设置状态" width="72px">
        <template slot-scope="scope">
          <span :class="scope.row.setting_state === 'active' ? 'status-active' : 'status-off'"></span>
        </template>
      </let-table-column>
      <let-table-column title="当前状态" width="72px">
        <template slot-scope="scope">
          <span :class="scope.row.present_state === 'active' ? 'status-active' : 'status-off'"></span>
        </template>
      </let-table-column>
      <let-table-column title="进程 ID" prop="process_id" width="68px"></let-table-column>
      <let-table-column title="版本" prop="patch_version" width="68px"></let-table-column>
      <let-table-column title="发布时间">
        <template slot-scope="scope">
          <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.posttime)}}</span>
        </template>
      </let-table-column>
      <let-table-column title="操作" width="260px">
        <template slot-scope="scope">
          <let-table-operation @click="configServer(scope.row.id)">编辑</let-table-operation>
          <let-table-operation @click="restartServer(scope.row.id)">重启</let-table-operation>
          <let-table-operation class="danger" @click="stopServer(scope.row.id)">停止</let-table-operation>
          <let-table-operation @click="manageServant(scope.row)">管理Servant</let-table-operation>
          <let-table-operation @click="showMoreCmd(scope.row)">更多命令</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <!-- 服务实时状态 -->
    <let-table v-if="showingList && showOthers"
      :data="showingList" title="服务实时状态" empty-msg="暂无数据" ref="serverNotifyListLoading">
      <let-table-column title="时间" prop="notifytime"></let-table-column>
      <let-table-column title="服务ID" prop="server_id"></let-table-column>
      <let-table-column title="线程ID" prop="thread_id"></let-table-column>
      <let-table-column title="结果" prop="result"></let-table-column>
    </let-table>
    <let-pagination v-if="serverNotifyList && serverNotifyList.length && serverNotifyList.length > 20"
      :page="pageNum" @change="gotoPage" style="margin-bottom: 32px;"
      :total="Math.ceil(serverNotifyList.length / 20)">
    </let-pagination>


    <!-- 编辑服务弹窗 -->
    <let-modal
      v-model="configModal.show"
      title="编辑服务"
      width="800px"
      :footShow="!!(configModal.model && configModal.model.server_name)"
      @on-confirm="saveConfig"
      @close="closeConfigModal"
      @on-cancel="closeConfigModal">
      <let-form
        v-if="!!(configModal.model && configModal.model.server_name)"
        ref="configForm" itemWidth="360px" :columns="2" class="two-columns">
        <let-form-item label="服务名">{{configModal.model.server_name}}</let-form-item>
        <let-form-item label="部署节点">{{configModal.model.node_name}}</let-form-item>
        <let-form-item label="是否备机" required>
          <let-radio-group
            size="small"
            v-model="configModal.model.bak_flag"
            :data="[{ value: true, text: '是' }, { value: false, text: '否' }]">
          </let-radio-group>
        </let-form-item>
        <let-form-item label="模板名称" required>
          <let-select
            size="small"
            v-model="configModal.model.template_name"
            v-if="configModal.model.templates && configModal.model.templates.length"
            required>
            <let-option v-for="t in configModal.model.templates" :key="t" :value="t">{{t}}</let-option>
          </let-select>
          <span v-else>{{configModal.model.template_name}}</span>
        </let-form-item>
        <let-form-item label="服务类型" required>
          <let-select
            size="small"
            v-model="configModal.model.server_type"
            required>
            <let-option v-for="t in serverTypes" :key="t" :value="t">{{t}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item label="启用 Set" required>
          <let-radio-group
            size="small"
            v-model="configModal.model.enable_set"
            :data="[{ value: true, text: '是' }, { value: false, text: '否' }]">
          </let-radio-group>
        </let-form-item>
        <let-form-item label="Set 名" required v-if="configModal.model.enable_set">
          <let-input
            size="small"
            v-model="configModal.model.set_name"
            placeholder="Set 名只能包含英文小写字母"
            required
            pattern="^[a-z]+$"
            pattern-tip="Set 名只能包含英文小写字母"
          ></let-input>
        </let-form-item>
        <let-form-item label="Set 区" required v-if="configModal.model.enable_set">
          <let-input
            size="small"
            v-model="configModal.model.set_area"
            placeholder="Set 区只能包含英文小写字母"
            required
            pattern="^[a-z]+$"
            pattern-tip="Set 区只能包含英文小写字母"
          ></let-input>
        </let-form-item>
        <let-form-item label="Set 组" required v-if="configModal.model.enable_set">
          <let-input
            size="small"
            v-model="configModal.model.set_group"
            placeholder="Set 组只能包含数字或者 * 号"
            required
            pattern="^[0-9\*]+$"
            pattern-tip="Set 组只能包含数字或者 * 号"
          ></let-input>
        </let-form-item>

        <let-form-item label="异步线程数" required>
          <let-input
            size="small"
            v-model="configModal.model.async_thread_num"
            placeholder="nodejs >=1，其他 >= 3"
            required
            :pattern="configModal.model.server_type === 'tars_nodejs' ? '^[1-9][0-9]*$' : '^([3-9]|[1-9][0-9]+)$'"
            pattern-tip="nodejs >=1，其他 >= 3"
          ></let-input>
        </let-form-item>
        <let-form-item label="缺省路径">
          <let-input
            size="small"
            v-model="configModal.model.base_path"
          ></let-input>
        </let-form-item>
        <let-form-item label="EXE 路径">
          <let-input
            size="small"
            v-model="configModal.model.exe_path"
          ></let-input>
        </let-form-item>
        <let-form-item label="启动脚本">
          <let-input
            size="small"
            v-model="configModal.model.start_script_path"
          ></let-input>
        </let-form-item>
        <let-form-item label="停止脚本">
          <let-input
            size="small"
            v-model="configModal.model.stop_script_path"
          ></let-input>
        </let-form-item>
        <let-form-item label="监控脚本" itemWidth="724px">
          <let-input
            size="small"
            v-model="configModal.model.monitor_script_path"
          ></let-input>
        </let-form-item>
        <let-form-item label="私有模板" itemWidth="724px">
          <let-input
            size="large"
            type="textarea"
            :rows="4"
            v-model="configModal.model.profile"
          ></let-input>
        </let-form-item>
      </let-form>
      <div v-else class="loading-placeholder" ref="configFormLoading"></div>
    </let-modal>

    <!-- Servant管理弹窗 -->
    <let-modal
      v-model="servantModal.show"
      title="Servant 管理"
      width="1200px"
      :footShow="false"
      @close="closeServantModal">
      <let-button size="small" theme="primary" class="tbm16" @click="configServant()">添加 Servant</let-button>
      <let-table v-if="servantModal.model" :data="servantModal.model" empty-msg="暂无数据">
        <let-table-column title="Servant 名" prop="servant"></let-table-column>
        <let-table-column title="绑定地址" prop="endpoint"></let-table-column>
        <let-table-column title="线程数" prop="thread_num"></let-table-column>
        <let-table-column title="最大连接数" prop="max_connections"></let-table-column>
        <let-table-column title="队列最大长度" prop="queuecap"></let-table-column>
        <let-table-column title="队列超时时间(ms)" prop="queuetimeout"></let-table-column>
        <let-table-column title="操作" width="90px">
          <template slot-scope="scope">
            <let-table-operation @click="configServant(scope.row.id)">编辑</let-table-operation>
            <let-table-operation class="danger" @click="deleteServant(scope.row.id)">删除</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <div v-else class="loading-placeholder" ref="servantModalLoading"></div>
    </let-modal>

    <!-- Servant新增、编辑弹窗 -->
    <let-modal
      v-model="servantDetailModal.show"
      :title="servantDetailModal.isNew ? '添加 Servant' : '编辑 Servant'"
      width="800px"
      :footShow="!!servantDetailModal.model"
      @on-confirm="saveServantDetail"
      @close="closeServantDetailModal"
      @on-cancel="closeServantDetailModal">
      <let-form
        v-if="servantDetailModal.model"
        ref="servantDetailForm" itemWidth="360px" :columns="2" class="two-columns">
        <let-form-item label="应用·服务名" itemWidth="724px">
          <span>{{servantDetailModal.model.application}}·{{servantDetailModal.model.server_name}}</span>
        </let-form-item>
        <let-form-item label="OBJ 名称" required>
          <let-input
            size="small"
            v-model="servantDetailModal.model.obj_name"
            placeholder="全英文，前面不加应用·服务名"
            required
            pattern="^[A-Za-z]+$"
            pattern-tip="OBJ 名称只能包含英文字母"
          ></let-input>
        </let-form-item>
        <let-form-item label="线程数" required>
          <let-input
            size="small"
            v-model="servantDetailModal.model.thread_num"
            placeholder="必须为数字且大于 0"
            required
            pattern="^[1-9][0-9]*$"
            pattern-tip="线程数必须为数字且大于 0"
          ></let-input>
        </let-form-item>
        <let-form-item label="绑定地址" required itemWidth="724px">
          <let-input
            ref="endpoint"
            size="small"
            v-model="servantDetailModal.model.endpoint"
            placeholder="范例：tcp -h 172.27.205.40 -t 60000 -p 12000"
            required
            :extraTip="isEndpointValid ? '' :
              '绑定地址必须以 tcp 或者 udp 开头，有 -h -t -p 三个参数，-p 0-65535 -t 大于 0 -h ip格式'"
          ></let-input>
        </let-form-item>
        <let-form-item label="最大连接数">
          <let-input
            size="small"
            v-model="servantDetailModal.model.max_connections"
          ></let-input>
        </let-form-item>
        <let-form-item label="队列长度">
          <let-input
            size="small"
            v-model="servantDetailModal.model.queuecap"
          ></let-input>
        </let-form-item>
        <let-form-item label="队列超时(ms)">
          <let-input
            size="small"
            v-model="servantDetailModal.model.queuetimeout"
          ></let-input>
        </let-form-item>
        <let-form-item label="允许 IP">
          <let-input
            size="small"
            v-model="servantDetailModal.model.allow_ip"
          ></let-input>
        </let-form-item>
        <let-form-item label="协议" required>
          <let-radio-group
            size="small"
            v-model="servantDetailModal.model.protocol"
            :data="[{ value: 'tars', text: 'TARS' }, { value: 'not_tars', text: ' 非 TARS' }]">
          </let-radio-group>
        </let-form-item>
        <let-form-item label="处理组">
          <let-input
            size="small"
            v-model="servantDetailModal.model.handlegroup"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 更多命令弹窗 -->
    <let-modal
      v-model="moreCmdModal.show"
      title="更多命令"
      width="700px"
      class="more-cmd"
      @on-confirm="invokeMoreCmd"
      @close="closeMoreCmdModal"
      @on-cancel="closeMoreCmdModal">
      <let-form v-if="moreCmdModal.model" ref="moreCmdForm">
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="setloglevel">设置日志等级</let-radio>
          <let-select
            size="small"
            :disabled="moreCmdModal.model.selected !== 'setloglevel'"
            v-model="moreCmdModal.model.setloglevel">
            <let-option v-for="l in logLevels" :key="l" :value="l">{{l}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="loadconfig">PUSH 配置文件</let-radio>
          <let-select
            size="small"
            :placeholder="moreCmdModal.model.configs && moreCmdModal.model.configs.length ? '请选择' : '暂无配置文件'"
            :disabled="!(moreCmdModal.model.configs && moreCmdModal.model.configs.length)
              || moreCmdModal.model.selected !== 'loadconfig'"
            v-model="moreCmdModal.model.loadconfig"
            :required="moreCmdModal.model.selected === 'loadconfig'">
            <let-option v-for="l in moreCmdModal.model.configs" :key="l.filename" :value="l.filename">{{l.filename}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="command">发送自定义命令</let-radio>
          <let-input
            size="small"
            :disabled="moreCmdModal.model.selected !== 'command'"
            v-model="moreCmdModal.model.command"
            :required="moreCmdModal.model.selected === 'command'"
          ></let-input>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="connection">查看服务链接</let-radio>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="undeploy_tars" class="danger">下线服务</let-radio>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'ServerManage',
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
      serverList: [],

      // 操作历史列表
      serverNotifyList: [],
      showingList: [],
      pageNum: 1,

      // 编辑服务
      serverTypes: [
        'tars_cpp',
        'tars_java',
        'tars_php',
        'tars_nodejs',
        'not_tars',
      ],
      configModal: {
        show: false,
        model: null,
      },

      // 编辑servant
      servantModal: {
        show: false,
        model: null,
        currentServer: null,
      },
      servantDetailModal: {
        show: false,
        isNew: true,
        model: null,
      },

      // 更多命令
      logLevels: [
        'NONE',
        'DEBUG',
        'INFO',
        'WARN',
        'ERROR',
      ],
      moreCmdModal: {
        show: false,
        model: null,
        currentServer: null,
      },
    };
  },
  computed: {
    showOthers() {
      return this.serverData.level === 5;
    },
    isEndpointValid() {
      if (!this.servantDetailModal.model || !this.servantDetailModal.model.endpoint) {
        return false;
      }
      return this.checkServantEndpoint(this.servantDetailModal.model.endpoint);
    },
  },
  methods: {
    // 获取服务列表
    getServerList() {
      const loading = this.$refs.serverListLoading.$loading.show();

      this.$ajax.getJSON('/server/api/server_list', {
        tree_node_id: this.$route.params.treeid,
      }).then((data) => {
        loading.hide();
        this.serverList = data;
      }).catch((err) => {
        loading.hide();
        this.$confirm(err.err_msg || err.message || '加载服务列表失败', '是否重试？', '提示').then(() => {
          this.getServerList();
        });
      });
    },
    // 获取服务实时状态
    getServerNotifyList() {
      if (!this.showOthers) return;
      const loading = this.$refs.serverNotifyListLoading.$loading.show();

      this.$ajax.getJSON('/server/api/server_notify_list', {
        tree_node_id: this.$route.params.treeid,
        page_size: 100,
        cur_page: 1,
      }).then((data) => {
        loading.hide();
        this.pageNum = 1;
        this.serverNotifyList = data;
        this.showingList = data.concat([]).splice(0, 20);
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`服务实时状态加载失败: ${err.err_msg || err.message}`);
      });
    },
    // 切换服务实时状态页码
    gotoPage(num) {
      this.pageNum = num;
      this.showingList = this.serverNotifyList.concat([]).splice((num - 1) * 20, 20);
    },

    // 获取模版列表
    getTemplateList() {
      this.$ajax.getJSON('/server/api/template_name_list').then((data) => {
        if (this.configModal.model) {
          this.configModal.model.templates = data;
        } else {
          this.configModal.model = { templates: data };
        }
      }).catch((err) => {
        this.$tip.error(`获取模版列表失败: ${err.err_msg || err.message}`);
      });
    },
    // 获取服务数据
    getServerConfig(id) {
      const loading = this.$loading.show({
        target: this.$refs.configFormLoading,
      });

      this.$ajax.getJSON('/server/api/server', {
        id,
      }).then((data) => {
        loading.hide();
        if (this.configModal.model) {
          this.configModal.model = Object.assign({}, this.configModal.model, data);
        } else {
          data.templates = [];
          this.configModal.model = data;
        }
      }).catch((err) => {
        loading.hide();
        this.closeConfigModal();
        this.$tip.error(`获取服务信息失败: ${err.err_msg || err.message}`);
      });
    },
    // 编辑服务
    configServer(id) {
      this.configModal.show = true;
      this.getTemplateList();
      this.getServerConfig(id);
    },
    saveConfig() {
      if (this.$refs.configForm.validate()) {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/update_server', {
          isBak: this.configModal.model.bak_flag,
          ...this.configModal.model,
        }).then((res) => {
          loading.hide();
          this.serverList = this.serverList.map((item) => {
            if (item.id === res.id) {
              return res;
            }
            return item;
          });
          this.closeConfigModal();
          this.$tip.success('服务更新成功');
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`服务更新失败: ${err.message || err.err_msg}`);
        });
      }
    },
    closeConfigModal() {
      if (this.$refs.configForm) this.$refs.configForm.resetValid();
      this.configModal.show = false;
      this.configModal.model = null;
    },

    // 检查任务状态
    checkTaskStatus(taskid, isRetry) {
      return new Promise((resolve, reject) => {
        this.$ajax.getJSON('/server/api/task', {
          task_no: taskid,
        }).then((data) => {
          // 进行中，1秒后重试
          if (data.status === 1) {
            setTimeout(() => {
              resolve(this.checkTaskStatus(taskid));
            }, 1000);
          // 成功
          } else if (data.status === 2) {
            resolve(`taskid: ${data.task_no}`);
          // 失败
          } else {
            reject(new Error(`taskid: ${data.task_no}`));
          }
        }).catch((err) => {
          // 网络问题重试1次
          if (isRetry) {
            reject(new Error(err.err_msg || err.message || '网络错误'));
          } else {
            setTimeout(() => {
              resolve(this.checkTaskStatus(taskid, true));
            }, 1000);
          }
        });
      });
    },
    // 添加任务
    addTask(id, command, tipObj) {
      const loading = this.$Loading.show();
      this.$ajax.postJSON('/server/api/add_task', {
        serial: true, // 是否串行
        items: [{
          server_id: id,
          command,
        }],
      }).then((res) => {  // eslint-disable-line
        return this.checkTaskStatus(res.task_no).then((info) => {
          loading.hide();
          // 任务成功重新拉取列表
          this.getServerList();
          this.$tip.success({
            title: tipObj.success,
            message: info,
          });
        }).catch((err) => {
          throw err;
        });
      }).catch((err) => {
        loading.hide();
        // 任务失败也重新拉取列表
        this.getServerList();
        this.$tip.error({
          title: tipObj.error,
          message: err.err_msg || err.message || '网络错误',
        });
      });
    },
    // 重启服务
    restartServer(id) {
      this.addTask(id, 'restart', {
        success: '服务重启成功',
        error: '服务重启失败',
      });
    },
    // 停止服务
    stopServer(id) {
      this.$confirm('您确定要停止此服务？', '提示').then(() => {
        this.addTask(id, 'stop', {
          success: '停止服务成功',
          error: '停止服务失败',
        });
      });
    },
    // 下线服务
    undeployServer(id) {
      this.$confirm('您确定要下线此服务？', '提示').then(() => {
        this.addTask(id, 'undeploy_tars', {
          success: '下线服务成功',
          error: '下线服务失败',
        });
        this.closeMoreCmdModal();
      });
    },

    // 管理Servant弹窗
    manageServant(server) {
      this.servantModal.show = true;

      const loading = this.$loading.show({
        target: this.$refs.servantModalLoading,
      });

      this.$ajax.getJSON('/server/api/adapter_conf_list', {
        id: server.id,
      }).then((data) => {
        loading.hide();
        this.servantModal.model = data;
        this.servantModal.currentServer = server;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`获取 Servant 列表失败: ${err.err_msg || err.message}`);
      });
    },
    closeServantModal() {
      this.servantModal.show = false;
      this.servantModal.model = null;
      this.servantModal.currentServer = null;
    },
    // 新增、编辑 servant
    configServant(id) {
      // 新增
      this.servantDetailModal.model = {
        application: this.servantModal.currentServer.application,
        server_name: this.servantModal.currentServer.server_name,
        obj_name: '',
        node_name: '',
        endpoint: '',
        servant: '',
        thread_num: '',
        max_connections: '200000',
        queuecap: '10000',
        queuetimeout: '60000',
        allow_ip: '',
        protocol: 'not_tars',
        handlegroup: '',
      };
      this.servantDetailModal.isNew = true;
      // 编辑
      if (id) {
        const old = this.servantModal.model.find(item => item.id === id);
        old.obj_name = old.servant.split('.')[2];
        this.servantDetailModal.model = Object.assign({}, this.servantDetailModal.model, old);
        this.servantDetailModal.isNew = false;
      }
      this.servantDetailModal.show = true;
    },
    closeServantDetailModal() {
      if (this.$refs.servantDetailForm) this.$refs.servantDetailForm.resetValid();
      this.servantDetailModal.show = false;
      this.servantDetailModal.model = null;
    },
    // 检查绑定地址
    checkServantEndpoint(endpoint) {
      const tmp = endpoint.split(/\s-/);
      const regProtocol = /^tcp|udp$/i;
      let regHost = /^h\s(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/i;
      let regT = /^t\s([1-9]|[1-9]\d+)$/i;
      let regPort = /^p\s\d{4,5}$/i;

      let check = true;
      if (regProtocol.test(tmp[0])) {
        let flag = 0;
        for (let i = 1; i < tmp.length; i++) {  // eslint-disable-line
          // 验证 -h
          if (regHost && regHost.test(tmp[i])) {
            flag++;  // eslint-disable-line
            // 提取参数
            this.servantDetailModal.model.node_name = tmp[i].split(/\s/)[1];
            regHost = null;
          }
          // 验证 -t
          if (regT && regT.test(tmp[i])) {
            flag++;  // eslint-disable-line
            regT = null;
          }
          // 验证 -p
          if (regPort && regPort.test(tmp[i])) {
            const port = tmp[i].substring(2);
            if (!(port < 0 || port > 65535)) {
              flag++;  // eslint-disable-line
            }
            regPort = null;
          }
        }
        check = flag === 3;
      } else {
        check = false;
      }
      return check;
    },
    // 保存 servant
    saveServantDetail() {
      if (this.$refs.servantDetailForm.validate()) {
        const loading = this.$Loading.show();
        // 新建
        if (this.servantDetailModal.isNew) {
          const query = this.servantDetailModal.model;
          query.servant = [query.application, query.server_name, query.obj_name].join('.');
          this.$ajax.postJSON('/server/api/add_adapter_conf', query).then((res) => {
            loading.hide();
            this.servantModal.model.unshift(res);
            this.$tip.success('新建 Servant 成功');
            this.closeServantDetailModal();
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`新建 Servant 失败: ${err.err_msg || err.message}`);
          });
        // 修改
        } else {
          this.$ajax.postJSON('/server/api/update_adapter_conf', this.servantDetailModal.model).then((res) => {
            loading.hide();
            this.servantModal.model = this.servantModal.model.map((item) => {
              if (item.id === res.id) {
                return res;
              }
              return item;
            });
            this.$tip.success('修改 Servant 成功');
            this.closeServantDetailModal();
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`修改 Servant 失败: ${err.err_msg || err.message}`);
          });
        }
      }
    },
    // 删除 servant
    deleteServant(id) {
      this.$confirm('您确定要删除这个 Servant?', '提示').then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_adapter_conf', {
          id,
        }).then((res) => {
          loading.hide();
          this.servantModal.model = this.servantModal.model.map((item) => {  // eslint-disable-line
            if (item.id !== res) return item;
          }).filter(item => item);
          this.$tip.success('删除 Servant 成功');
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`删除 Servant 失败: ${err.err_msg || err.message}`);
        });
      });
    },

    // 显示更多命令
    showMoreCmd(server) {
      this.moreCmdModal.model = {
        selected: 'setloglevel',
        setloglevel: 'NONE',
        loadconfig: '',
        command: '',
        configs: null,
      };
      this.moreCmdModal.unwatch = this.$watch('moreCmdModal.model.selected', () => {
        if (this.$refs.moreCmdForm) this.$refs.moreCmdForm.resetValid();
      });
      this.moreCmdModal.show = true;
      this.moreCmdModal.currentServer = server;

      this.$ajax.getJSON('/server/api/config_file_list', {
        level: 5,
        application: server.application,
        server_name: server.server_name,
      }).then((data) => {
        if (this.moreCmdModal.model) this.moreCmdModal.model.configs = data;
      }).catch((err) => {
        this.$tip.error(`获取配置文件列表失败: ${err.err_msg || err.message}`);
      });
    },
    sendCommand(id, command, hold) {
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/server/api/send_command', {
        server_ids: id,
        command,
      }).then((res) => {
        loading.hide();
        const msg = res[0].err_msg.replace(/\n/g, '<br>');
        if (res[0].ret_code === 0) {
          const opt = {
            title: '执行命令成功',
            message: msg,
          };
          if (hold) opt.duration = 0;
          this.$tip.success(opt);
        } else {
          throw new Error(msg);
        }
      }).catch((err) => {
        loading.hide();
        this.$tip.error({
          title: '执行命令失败',
          message: err.err_msg || err.message,
        });
      });
    },
    invokeMoreCmd() {
      const model = this.moreCmdModal.model;
      const server = this.moreCmdModal.currentServer;
      // 下线服务
      if (model.selected === 'undeploy_tars') {
        this.undeployServer(server.id);
      // 设置日志等级
      } else if (model.selected === 'setloglevel') {
        this.sendCommand(server.id, `${server.application}.setloglevel ${model.setloglevel}`);
      // push 日志文件
      } else if (model.selected === 'loadconfig' && this.$refs.moreCmdForm.validate()) {
        this.sendCommand(server.id, `${server.application}.loadconfig ${model.loadconfig}`);
      // 发送自定义命令
      } else if (model.selected === 'command' && this.$refs.moreCmdForm.validate()) {
        this.sendCommand(server.id, model.command);
      // 查看服务链接
      } else if (model.selected === 'connection') {
        this.sendCommand(server.id, `${server.application}.connection`, true);
      }
    },
    closeMoreCmdModal() {
      if (this.$refs.moreCmdForm) this.$refs.moreCmdForm.resetValid();
      if (this.moreCmdModal.unwatch) this.moreCmdModal.unwatch();
      this.moreCmdModal.show = false;
      this.moreCmdModal.model = null;
    },

    // 处理未发布时间显示
    handleNoPublishedTime(timeStr, noPubTip = '未发布') {
      if (timeStr === '0000:00:00 00:00:00') {
        return noPubTip;
      }
      return timeStr;
    },
  },
  created() {
    this.serverData = this.$parent.getServerData();
  },
  mounted() {
    this.getServerList();
    this.getServerNotifyList();
  },
};
</script>

<style>
@import '../../assets/css/variable.css';

.page_server_manage {
  .tbm16 {
    margin: 16px 0;
  }
  .danger {
    color: var(--off-color);
  }

  .more-cmd {
    .let-form-item__content {
      display: flex;
      align-items: center;
    }
    span.let-radio {
      margin-right: 5px;
    }
    label.let-radio {
      width: 200px;
    }
  }
}

</style>
