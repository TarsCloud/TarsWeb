<template>
  <div class="page_server_config">
    <div style="margin-bottom:10px">
      <h4 style="float: left">
        {{ this.$t("cfg.title.a") }}
        <i
          class="icon iconfont el-icon-third-shuaxin"
          style="font-family: iconfont !important; cursor: pointer"
          @click="getConfigList()"
        ></i>
      </h4>

      <span style="float:right;">
        <let-button size="mini" theme="sub-primary" @click="addConfig">{{
          $t("cfg.btn.add")
        }}</let-button>
        &nbsp;&nbsp;
        <let-button
          size="mini"
          theme="primary"
          @click="nodeConfigAdd(configList, checkedConfigId)"
          >{{ $t("filter.btn.addNode") }}</let-button
        >
        &nbsp;&nbsp;
        <let-button
          size="mini"
          theme="primary"
          @click="
            changeConfig(
              configList,
              'ConfigName',
              checkedConfigId,
              'configList'
            )
          "
          >{{ $t("operate.update") }}</let-button
        >
        &nbsp;&nbsp;
        <let-button
          size="mini"
          theme="primary"
          @click="deleteConfig(configList, 'ConfigName', checkedConfigId)"
          >{{ $t("operate.delete") }}</let-button
        >
        &nbsp;&nbsp;
        <let-button
          size="mini"
          theme="primary"
          @click="showDetail(configList, 'ConfigName', checkedConfigId)"
          >{{ $t("cfg.title.viewConf") }}</let-button
        >
        &nbsp;&nbsp;
        <let-button
          size="mini"
          theme="primary"
          @click="showHistory(configList, 'ConfigName', checkedConfigId)"
          >{{ $t("pub.btn.history") }}</let-button
        >
      </span>
    </div>
    <!-- 服务列表 -->
    <wrapper v-if="configList" ref="configListLoading">
      <let-table :data="configList" :empty-msg="$t('common.nodata')">
        <let-table-column width="40px">
          <template slot-scope="scope">
            <let-radio v-model="checkedConfigId" :label="scope.row.ConfigName"
              ><span style="font-size:0;">{{
                scope.row.ConfigName
              }}</span></let-radio
            >
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.service')"
          width="250px"
          prop="ServerId"
        ></let-table-column>
        <let-table-column
          :title="$t('cfg.btn.fileName')"
          width="250px"
          prop="ConfigName"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.version')"
          prop="ConfigVersion"
        ></let-table-column>
        <let-table-column
          :title="$t('cfg.btn.lastUpdate')"
          prop="CreateTime"
          width="250px"
        ></let-table-column>
      </let-table>
    </wrapper>

    <!-- 引用文件列表 -->
    <!-- <wrapper v-if="refFileList && showOthers && false" ref="refFileListLoading">
      <let-button size="small" theme="primary" class="add-btn" @click="openRefFileModal">{{$t('cfg.btn.addRef')}}</let-button>

      <let-table :data="refFileList" :title="$t('cfg.title.b')" :empty-msg="$t('common.nodata')">
        <let-table-column :title="$t('serverList.table.th.service')" prop="server_name"></let-table-column>
        <let-table-column :title="$t('cfg.btn.fileName')" prop="filename"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name"></let-table-column>
        <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="posttime"></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="260px">
          <template slot-scope="scope">
            <let-table-operation @click="deleteRef(scope.row.id)">{{$t('operate.delete')}}</let-table-operation>
            <let-table-operation @click="showDetail(scope.row)">{{$t('operate.view')}}</let-table-operation>
            <let-table-operation @click="showHistory(scope.row)">{{$t('pub.btn.history')}}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </wrapper> -->

    <!-- 节点配置列表 -->
    <wrapper v-if="nodeConfigList && showOthers" ref="nodeConfigListLoading">
      <!-- <let-button size="small" theme="primary" class="add-btn" @click="pushNodeConfig">{{$t('cfg.btn.pushFile')}}</let-button> -->
      <div class="btn_group">
        <let-button
          size="mini"
          theme="primary"
          @click="
            changeConfig(
              nodeConfigList,
              'ConfigId',
              nodeCheckList,
              'nodeConfigList'
            )
          "
          >{{ $t("cfg.table.modCfg") }}</let-button
        >
        <let-button
          size="mini"
          theme="primary"
          @click="showMergedDetail(nodeConfigList, 'ConfigId', nodeCheckList)"
          >{{ $t("cfg.table.viewMerge") }}</let-button
        >
        <let-button
          size="mini"
          theme="primary"
          @click="deleteConfig(nodeConfigList, 'ConfigId', nodeCheckList)"
          >{{ $t("operate.delete") }}</let-button
        >
        <let-button
          size="mini"
          theme="primary"
          @click="showDetail(nodeConfigList, 'ConfigId', nodeCheckList)"
          >{{ $t("cfg.table.viewIpContent") }}</let-button
        >
        <let-button
          size="mini"
          theme="primary"
          @click="showHistory(nodeConfigList, 'ConfigId', nodeCheckList)"
          >{{ $t("pub.btn.history") }}</let-button
        >
      </div>

      <let-checkbox
        class="check-all"
        v-model="nodeCheckAll"
        v-if="nodeConfigList.length"
      ></let-checkbox>
      <let-table
        :data="nodeConfigList"
        :title="$t('cfg.title.c')"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column width="40px">
          <template slot-scope="scope">
            <let-checkbox
              v-model="nodeCheckList"
              :label="scope.row.ConfigId"
            ></let-checkbox>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.service')"
          width="250px"
          prop="ServerId"
        ></let-table-column>
        <let-table-column
          :title="$t('cfg.btn.fileName')"
          width="250px"
          prop="ConfigName"
        ></let-table-column>
        <let-table-column :title="$t('serverList.table.th.ip')" prop="PodSeq">
          <template slot-scope="scope">
            {{ scope.row.ServerId.replace(/\./g, "-").toLocaleLowerCase() }}-{{
              scope.row.PodSeq
            }}
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('cfg.btn.lastUpdate')"
          prop="CreateTime"
          width="180px"
        ></let-table-column>
      </let-table>
    </wrapper>

    <!-- 添加、修改配置弹窗 -->
    <let-modal
      v-model="configModal.show"
      :title="
        configModal.isNew
          ? `${$t('operate.title.add')} ${$t('common.config')}`
          : `${$t('operate.title.update')} ${$t('common.config')}`
      "
      width="80%"
      @on-confirm="configDiff"
      @close="closeConfigModal"
      @on-cancel="closeConfigModal"
    >
      <!-- @on-confirm="updateConfigFile" -->
      <let-form v-if="configModal.model" ref="configForm" itemWidth="100%">
        <let-form-item :label="$t('cfg.btn.fileName')" required>
          <let-input
            size="small"
            :disabled="!configModal.isNew"
            v-model="configModal.model.ConfigName"
            required
          ></let-input>
        </let-form-item>
        <let-form-item
          :label="$t('cfg.btn.reason')"
          v-if="!configModal.isNew"
          required
        >
          <let-input
            size="small"
            v-model="configModal.model.ConfigMark"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('cfg.btn.content')" required>
          <let-input
            size="large"
            type="textarea"
            :rows="16"
            v-model="configContent"
            required
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 添加、修改配置弹窗 -->
    <let-modal
      v-model="nodeConfigModal.show"
      :title="
        nodeConfigModal.isNew
          ? `${$t('operate.title.add')} ${$t('common.config')}`
          : `${$t('operate.title.update')} ${$t('common.config')}`
      "
      width="80%"
      @on-confirm="updateNodeConfigFile"
      @close="closeNodeConfigModal"
      @on-cancel="closeNodeConfigModal"
    >
      <let-form
        v-if="nodeConfigModal.model"
        ref="nodeConfigForm"
        itemWidth="100%"
      >
        <let-form-item :label="$t('cfg.btn.fileName')" required>
          <let-input
            disabled
            size="small"
            v-model="nodeConfigModal.model.ConfigName"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('serverList.table.th.ip')" required>
          <div style="display:flex;">
            <span style="display:block;"
              >{{
                nodeConfigModal.model.ServerId.replace(
                  /\./g,
                  "-"
                ).toLocaleLowerCase()
              }}-</span
            >
            <let-input
              style="display:block;flex:1;"
              type="number"
              :min="0"
              :max="20"
              size="small"
              v-model="nodeConfigModal.model.PodSeq"
              required
            ></let-input>
          </div>
        </let-form-item>
        <let-form-item :label="$t('cfg.btn.content')" required>
          <let-input
            size="large"
            type="textarea"
            :rows="16"
            v-model="nodeConfigModal.model.ConfigContent"
            required
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 配置对比弹窗 -->
    <let-modal
      v-model="configDiffModal.show"
      :title="$t('filter.title.diffTxt')"
      width="1200px"
      @on-confirm="updateConfigDiff"
      @close="closeConfigDiffModal"
      @on-cancel="closeConfigDiffModal"
    >
      <div v-if="configDiffModal.model" style="padding-top:30px;">
        <div class="codediff_head">
          <div class="codediff_th">OLD:</div>
          <div class="codediff_th">NEW:</div>
        </div>
        <diff
          :old-string="configDiffModal.model.oldData"
          :new-string="configDiffModal.model.newData"
          :context="10"
          output-format="side-by-side"
        ></diff>
      </div>
    </let-modal>

    <!-- 查看弹窗 -->
    <let-modal
      v-model="detailModal.show"
      :title="detailModal.title"
      width="1200px"
      :footShow="false"
      @close="closeDetailModal"
    >
      <let-button
        theme="primary"
        size="small"
        @click="backConfig"
        style="margin-top:20px;"
        v-if="detailModal.model && detailModal.model.table"
        >恢复</let-button
      >
      <let-table
        class="history-table"
        v-if="detailModal.model && detailModal.model.table"
        :data="detailModal.model.table"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column width="40px">
          <template slot-scope="scope">
            <let-radio v-model="backConfigId" :label="scope.row.ConfigId">{{
              ""
            }}</let-radio>
          </template>
        </let-table-column>
        <let-table-column :title="$t('common.time')" prop="CreateTime">
          <template slot-scope="scope">
            <div @click="historyClick(scope.row)">
              {{ scope.row.CreateTime }}
            </div>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.version')"
          prop="ConfigVersion"
        >
          <template slot-scope="scope">
            <div @click="historyClick(scope.row)">
              {{ scope.row.ConfigVersion }}
            </div>
          </template>
        </let-table-column>
        <let-table-column
          width="400px"
          :title="$t('cfg.btn.reason')"
          prop="ConfigMark"
        >
          <template slot-scope="scope">
            <div @click="historyClick(scope.row)">
              {{ scope.row.ConfigMark || "&nbsp;" }}
            </div>
          </template>
        </let-table-column>
        <let-table-column :title="$t('cfg.btn.content')" width="90px">
          <template slot-scope="scope">
            <let-table-operation @click="showTableDeatil(scope.row)">{{
              $t("operate.view")
            }}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <pre
        v-if="
          (detailModal.model && !detailModal.model.table) ||
            (detailModal.model &&
              detailModal.model.table &&
              detailModal.model.detail)
        "
        >{{ detailModal.model.detail || $t("cfg.msg.empty") }}</pre
      >
      <div class="detail-loading" ref="detailModalLoading"></div>
    </let-modal>
  </div>
</template>

<script>
import { formatDate } from "@/lib/date";
import wrapper from "@/components/section-wrappper";
import diff from "@/components/diff/index";

export default {
  name: "ServerConfig",
  components: {
    wrapper,
    diff,
  },
  data() {
    return {
      oldStr: "old code",
      newStr: "new code",

      // 当前页面信息
      serverData: {
        // level: 5,
        // application: '',
        // server_name: '',
        // set_name: '',
        // set_area: '',
        // set_group: '',
        ServerId: "",
      },

      // 服务列表
      checkedConfigId: "",
      backConfigId: "",
      configList: [],

      // 引用文件列表
      // refFileList: null,

      // 节点配置列表
      nodeConfigList: null,
      nodeCheckList: [],

      // 添加、修改配置弹窗
      configContent: "",
      configModal: {
        show: false,
        isNew: true,
        model: null,
      },

      nodeConfigContent: "",
      nodeConfigModal: {
        show: false,
        isNew: true,
        model: null,
      },

      configDiffModal: {
        type: "",
        show: false,
        isNew: true,
        model: null,
      },

      // 查看弹窗
      detailModal: {
        show: false,
        title: "",
        model: null,
      },

      // 引用文件弹窗
      refFileModal: {
        show: false,
        model: { fileList: [] },
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
  props: ["treeid"],
  computed: {
    showOthers() {
      return this.serverData.level === 5;
    },
    nodeCheckAll: {
      get() {
        return this.nodeConfigList && this.nodeConfigList.length
          ? this.nodeCheckList.length === this.nodeConfigList.length
          : false;
      },
      set(value) {
        if (value) {
          this.nodeCheckList = this.nodeConfigList.map((item) => item.ConfigId);
        } else {
          this.nodeCheckList = [];
        }
      },
    },
  },
  watch: {
    checkedConfigId() {
      this.$nextTick(() => {
        // this.getRefFileList();
        this.getNodeConfigList();
      });
    },
  },
  methods: {
    getServerId() {
      return this.treeid;
    },
    // 配置列表
    getConfigList(query) {
      const loading = this.$refs.configListLoading.$loading.show();

      let ServerId = this.getServerId();
      this.$ajax
        .getJSON("/k8s/api/server_config_select", {
          ServerId,
        })
        .then((data) => {
          loading.hide();
          this.configList = [];
          this.refFileList = [];
          this.nodeConfigList = [];
          if (data.hasOwnProperty("Data")) {
            if (data.Data[0] && data.Data[0].ConfigId) {
              this.checkedConfigId = data.Data[0].ConfigName;
              // this.getRefFileList();
              this.getNodeConfigList();
            }
            data.Data.forEach((item) => {
              item.CreateTime = formatDate(item.CreateTime);
            });
            this.configList = data.Data;
          }
        })
        .catch((err) => {
          loading.hide();
          this.$confirm(
            err.err_msg || err.message || this.$t("common.error"),
            this.$t("common.retry"),
            this.$t("common.alert")
          ).then(() => {
            this.getConfigList();
          });
        });
    },
    addConfig() {
      const serverName = this.getServerId().split(".")[1] || "";
      this.configContent = "";
      this.configModal.model = {
        ConfigName: (serverName && `${serverName}.conf`) || "",
        ConfigContent: "",
      };
      this.configModal.isNew = true;
      this.configModal.show = true;
    },
    changeConfig(data, key, val, array) {
      // console.log(data, key, val, array);

      let newData = data.filter(
        (item) => item[key] === val || item[key] === val[0]
      );
      if (!val || val.length === 0 || newData.length == 0) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }

      // console.log(newData);

      this.configContent = newData[0].ConfigContent;
      this.configModal.model = Object.assign(newData[0], {
        ConfigMark: "",
      });
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
          const query = Object.assign(
            {
              ServerId: this.getServerId(),
            },
            model
          );
          this.$ajax
            .postJSON("/k8s/api/server_config_create", query)
            .then((res) => {
              loading.hide();
              // this.configList.unshift(res);
              // if (this.configList.length === 1) {
              //   this.checkedConfigId = res.id;
              // }
              this.$tip.success(this.$t("common.success"));
              this.getConfigList();
              this.closeConfigModal();
              this.closeConfigDiffModal();
            })
            .catch((e) => {
              loading.hide();
              this.$tip.error(this.$t("common.error"));
            });
          // 修改
        } else {
          this.$ajax
            .postJSON("/k8s/api/server_config_update", {
              ConfigId: model.ConfigId,
              ConfigMark: model.ConfigMark,
              ConfigContent: model.ConfigContent,
            })
            .then((res) => {
              loading.hide();
              this.$tip.success(this.$t("common.success"));
              this.getConfigList();
              this.closeConfigModal();
              this.closeConfigDiffModal();
            })
            .catch((e) => {
              loading.hide();
              this.$tip.error(this.$t("common.error"));
            });
        }
      }
    },
    updateNodeConfigFile() {
      if (this.$refs.nodeConfigForm.validate()) {
        const loading = this.$Loading.show();
        const model = this.nodeConfigModal.model;
        // 新增
        if (this.nodeConfigModal.isNew) {
          const query = Object.assign(
            {
              ServerId: this.getServerId(),
            },
            model
          );
          this.$ajax
            .postJSON("/k8s/api/server_config_create", query)
            .then((res) => {
              loading.hide();
              // this.configList.unshift(res);
              // if (this.configList.length === 1) {
              //   this.checkedConfigId = res.id;
              // }
              this.$tip.success(this.$t("common.success"));
              this.getConfigList();
              this.closeNodeConfigModal();
            })
            .catch((e) => {
              loading.hide();
              this.$tip.error(e.err_msg);
            });
          // 修改
        } else {
        }
      }
    },
    backConfig() {
      const backConfigId = this.backConfigId;
      if (!backConfigId) {
        return this.$tip.error("请先选择一项");
      }

      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_config_history_back", {
          HistoryId: backConfigId,
        })
        .then((res) => {
          loading.hide();
          this.$tip.success(this.$t("common.success"));
          this.getConfigList();
          this.closeDetailModal();
        })
        .catch(() => {
          loading.hide();
          this.$tip.error(this.$t("common.error"));
        });
    },
    closeConfigModal() {
      if (this.$refs.configForm) this.$refs.configForm.resetValid();
      this.configModal.show = false;
    },
    closeNodeConfigModal() {
      if (this.$refs.nodeConfigForm) this.$refs.nodeConfigForm.resetValid();
      this.nodeConfigModal.show = false;
    },
    deleteConfig(data, key, val) {
      if (!val) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }
      let newData = data.filter(
        (item) => item[key] === val || item[key] === val[0]
      );
      this.$confirm(
        this.$t("cfg.msg.confirmCfg"),
        this.$t("common.alert")
      ).then(() => {
        const loading = this.$Loading.show();
        this.$ajax
          .getJSON("/k8s/api/server_config_delete", {
            ConfigId: newData[0].ConfigId,
          })
          .then((res) => {
            loading.hide();
            this.getConfigList(this.serverData);
            // this.getNodeConfigList();
            this.$tip.success(this.$t("common.success"));
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.err_msg || err.message}`
            );
          });
      });
    },
    // 节点配置列表
    getNodeConfigList() {
      if (!this.showOthers) return;
      // const loading = this.$refs.nodeConfigListLoading.$loading.show();

      const query = {
        ServerId: this.getServerId(),
        ConfigName: this.checkedConfigId,
      };
      this.$ajax
        .getJSON("/k8s/api/server_config_select", query)
        .then((data) => {
          // loading.hide();

          data.Data.forEach((item) => {
            item.CreateTime = formatDate(item.CreateTime);
          });
          this.nodeCheckList = [];
          this.nodeConfigList = data.Data;
        })
        .catch((err) => {
          // loading.hide();
          this.nodeConfigList = [];
          this.$tip.error({
            title: this.$t("common.error"),
            message: err.err_msg || err.message || this.$t("common.networkErr"),
          });
        });
    },
    nodeConfigAdd(data, key) {
      if (!key) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }
      let newData = data.filter((item) => item.ConfigName === key);

      this.nodeConfigModal.model = {
        ServerId: newData[0].ServerId,
        ConfigName: newData[0].ConfigName,
        ConfigContent: "",
      };
      this.nodeConfigModal.isNew = true;
      this.nodeConfigModal.show = true;
    },
    // pushNodeConfig() {
    //   if (!this.nodeCheckList.length) {
    //     this.$tip.warning(this.$t('cfg.msg.selectNode'));
    //     return;
    //   }
    //   const loading = this.$Loading.show();
    //   this.$ajax.getJSON('/k8s/api/push_config_file', {
    //     ids: this.nodeCheckList.join(';'),
    //   }).then((res) => {
    //     loading.hide();
    //     this.pushResultModal.model = res;
    //     this.pushResultModal.show = true;
    //   }).catch((err) => {
    //     loading.hide();
    //     this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
    //   });
    // },
    // closePushResultModal() {
    //   this.pushResultModal.model = null;
    //   this.pushResultModal.show = false;
    // },

    // 显示详情弹窗
    showDetail(data, key, val) {
      if (!val || val.length === 0) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }
      let newData = data.filter(
        (item) => item[key] === val || item[key] === val[0]
      );

      this.detailModal.title = this.$t("cfg.title.viewConf");
      this.detailModal.model = {
        detail: newData[0].ConfigContent,
      };
      this.detailModal.show = true;
    },
    showMergedDetail(data, key, val) {
      if (!val || val.length === 0) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }
      let newData = data.filter(
        (item) => item[key] === val || item[key] === val[0]
      );

      this.detailModal.title = this.$t("cfg.title.viewMerged");
      this.detailModal.show = true;
      const loading = this.$loading.show({
        target: this.$refs.detailModalLoading,
      });

      this.$ajax
        .getJSON("/k8s/api/merged_node_config", {
          ServerId: newData[0].ServerId,
          ConfigName: newData[0].ConfigName,
          PodSeq: newData[0].PodSeq,
        })
        .then((data) => {
          loading.hide();
          this.detailModal.model = {
            detail: data,
          };
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    showHistory(data, key, val) {
      if (!val || val.length === 0) {
        return this.$tip.warning(this.$t("dialog.tips.item"));
      }
      let newData = data.filter(
        (item) => item[key] === val || item[key] === val[0]
      );

      this.detailModal.title = this.$t("cfg.title.viewHistory");
      this.detailModal.show = true;
      const loading = this.$loading.show({
        target: this.$refs.detailModalLoading,
      });

      this.$ajax
        .getJSON("/k8s/api/server_config_history_select", {
          ConfigId: newData[0].ConfigId,
        })
        .then((data) => {
          loading.hide();

          data.Data.forEach((item) => {
            item.CreateTime = formatDate(item.CreateTime);
          });

          this.detailModal.model = {
            currentVersion: newData[0].ConfigVersion,
            ConfigId: newData[0].ConfigId,
            table: data.Data,
            detail: "",
          };
          // console.log(this.detailModal.model);
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    showTableDeatil(item) {
      this.detailModal.model.detail = item.ConfigContent;
    },
    closeDetailModal() {
      this.backConfigId = "";
      this.detailModal.show = false;
      this.detailModal.model = null;
    },
    configDiff() {
      if (this.$refs.configForm.validate()) {
        this.configDiffModal.type = "config";
        this.configDiffModal.show = true;
        this.configDiffModal.isNew = false;
        this.configDiffModal.model = {
          oldData: this.configModal.model.ConfigContent,
          newData: this.configContent,
        };
      }
    },
    updateConfigDiff() {
      let { type } = this.configDiffModal;
      const model = this.configModal.model;
      if (model.ConfigName.toLowerCase().endsWith(".json")) {
        //json格式, 检查配置文件格式
        try {
          JSON.parse(this.configContent);
        } catch (e) {
          alert("config format error:" + e.toString());
          return;
        }
      }

      if (model.ConfigName.toLowerCase().endsWith(".xml")) {
        try {
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(this.configContent, "text/xml");
          var error = xmlDoc.getElementsByTagName("parsererror");
          let errorMessage = "";
          if (error.length > 0) {
            if (xmlDoc.documentElement.nodeName == "parsererror") {
              errorMessage = xmlDoc.documentElement.childNodes[0].nodeValue;
            } else {
              errorMessage = xmlDoc.getElementsByTagName("parsererror")[0]
                .innerHTML;
            }

            alert("config format error:" + errorMessage);
            return;
          }
        } catch (e) {
          alert("config format error:" + e.toString());
          return;
        }
      }

      if (type === "config") {
        this.configModal.model.ConfigContent = this.configContent;
        this.updateConfigFile();
      }
    },
    closeConfigDiffModal() {
      this.configDiffModal.show = false;
    },
    nodeConfigDiff() {
      if (this.$refs.nodeConfigForm.validate()) {
        this.configDiffModal.type = "nodeConfig";
        this.configDiffModal.show = true;
        this.configDiffModal.isNew = false;
        this.configDiffModal.model = {
          oldData: this.nodeConfigModal.model.ConfigContent,
          newData: this.nodeConfigContent,
        };
      }
    },
    historyClick(data) {
      this.backConfigId = data.HistoryId;
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
@import "../../assets/css/variable.css";

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
    color: #909fa3;
    margin-top: 32px;
    max-height: 800px;
    overflow: auto;
    white-space: pre-wrap;
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

  .btn_group {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }
  .btn_group .let-button + .let-button {
    margin-left: 10px;
  }

  .codediff_head {
    display: flex;
    flex: 1;
    margin-bottom: 5px;
  }
  .codediff_th {
    display: block;
    flex: 1;
  }
}
</style>
