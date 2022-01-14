<template>
  <div class="page_base_node">
    <template v-if="!showDetail">
      <let-form inline itemWidth="200px" @submit.native.prevent="search">
        <let-form-item :label="$t('filter.title.node')">
          <el-input size="small" v-model="query.NodeName"></el-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.app')">
          <el-select
            v-model="query.ServerApp"
            clearable
            @change="queryAppChange"
            size="small"
            filterable
          >
            <el-option
              v-for="item in appList"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')">
          <el-select
            v-model="query.ServerName"
            style="width: 100%"
            clearable
            size="small"
          >
            <el-option
              v-for="item in serList"
              :key="item"
              :label="item"
              filterable
              :value="item"
            ></el-option>
          </el-select>
        </let-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{
            $t("filter.btn.searchAffinity")
          }}</let-button>
        </let-form-item>
        <let-form-item itemWidth="600px">
          <el-tag effect="plain" style="margin-right: 10px">
            {{ $t("filter.title.CommonTag") }}
          </el-tag>
          <el-tag effect="plain" type="warning" style="margin-right: 10px">
            {{ $t("filter.title.FrameWorkTag") }}
          </el-tag>
        </let-form-item>
        <div style="float: right;margin-top: 30px">
          <let-button
            size="small"
            type="submit"
            theme="primary"
            style="margin-right: 10px"
            @click="batchEditCommon"
            :disabled="!batchEnabled"
          >
            {{ $t("filter.btn.editTag") }}
          </let-button>
          <let-button
            size="small"
            type="submit"
            theme="primary"
            :disabled="!batchEnabled"
            @click="batchEditAffinity"
          >
            {{ $t("filter.btn.editAffinity") }}
          </let-button>
        </div>
      </let-form>

      <br />
      <!--列表-->
      <el-table
        ref="table"
        :data="items"
        width="100%"
        border
        stripe
        @selection-change="handleSelectionChange"
        highlight-current-row
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          :label="$t('filter.title.nodeName')"
          prop="NodeName"
          width="150"
        ></el-table-column>
        <el-table-column :label="$t('common.status')" width="100">
          <template slot-scope="scope">
            <el-tag
              size="small"
              effect="plain"
              type="success"
              v-if="scope.row.status == 'Active'"
            >
              {{ scope.row.status }}
            </el-tag>
            <el-tag
              size="small"
              effect="plain"
              type="danger"
              v-if="scope.row.status == 'Unavailable'"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Version" width="100">
          <template slot-scope="scope">
            {{ scope.row.NodInfo.kubeletVersion }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('filter.title.nodeFramework')" width="100">
          <template slot-scope="scope">
            <let-switch
              v-model="scope.row.NodePublic"
              @change="changeStatus(scope.row)"
            >
              <span slot="open">开</span>
              <span slot="close">关</span>
            </let-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('filter.title.nodeLabels')">
          <template slot-scope="scope">
            <el-tag
              style="margin: 2px 2px"
              v-for="(item, key) in scope.row.commonLabels"
              :key="key"
              effect="plain"
              :type="key | tagType"
            >
              {{ key + ":" + item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('filter.title.AbilityTag')" width="200">
          <template slot-scope="scope">
            <el-tag
              style="margin: 2px 2px"
              v-for="item in scope.row.NodeAbility"
              :key="item"
              effect="plain"
              :type="item | abilityType"
            >
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('filter.title.nodeAddress')" width="210">
          <template slot-scope="scope">
            <div
              v-for="item in scope.row.NodeAddress"
              :key="item.NodeName"
              style="margin: 2px 2px"
            >
              <el-tag effect="plain" type="info"
                >{{ item.type + ":" + item.address }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operate.operates')" width="150px">
          <template slot-scope="scope">
            <let-table-operation @click="viewItem(scope.row)">
              {{ $t("operate.view") }}
            </let-table-operation>
            <br />
            <let-table-operation @click="editCommonTag(scope.row)">
              {{ $t("filter.btn.editTag") }}
            </let-table-operation>
            <br />
            <let-table-operation @click="editAbilityTag(scope.row)">
              {{ $t("filter.btn.editAffinity") }}
            </let-table-operation>
          </template>
        </el-table-column>
      </el-table>
      <let-pagination
        align="right"
        style="float: right"
        :page="pagination.page"
        @change="gotoPage"
        :total="pagination.total"
      >
      </let-pagination>

      <!--操作普通标签-->
      <el-dialog
        :title="$t('filter.dialog.editCommonTag')"
        :visible.sync="commonTagDialog.show"
        width="40%"
        :before-close="closeCommonTagDialog"
        :close-on-click-modal="false"
      >
        <el-form :model="commonTagDialog.model" ref="commonForm" inline-message>
          <el-table :data="commonTagDialog.model.commonArr" border>
            <template slot="empty">
              <let-table-operation
                @click="addCommonTag(0, commonTagDialog.model.commonArr)"
              >
                {{ $t("deployService.form.labelMatch.addLabel") }}
              </let-table-operation>
            </template>
            <el-table-column :label="$t('filter.title.tagName')">
              <template slot-scope="scope">
                <el-form-item
                  :prop="'commonArr.' + scope.$index + '.name'"
                  :rules="[
                    {
                      validator: (rule, value, callback) => {
                        validateTagName(rule, value, callback, scope.row.name);
                      },
                      trigger: 'blur',
                    },
                  ]"
                >
                  <el-input v-model="scope.row.name"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('filter.title.tagName')">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value"></el-input>
              </template>
            </el-table-column>
            <el-table-column :label="$t('operate.operates')" width="120px">
              <template slot-scope="scope">
                <let-table-operation
                  @click="
                    addCommonTag(scope.$index, commonTagDialog.model.commonArr)
                  "
                >
                  {{ $t("operate.add") }}
                </let-table-operation>
                <let-table-operation
                  @click="
                    delCommonTag(scope.$index, commonTagDialog.model.commonArr)
                  "
                >
                  {{ $t("operate.delete") }}
                </let-table-operation>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeCommonTagDialog">{{
            $t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="saveCommonTag">{{
            $t("common.submit")
          }}</el-button>
        </span>
      </el-dialog>

      <!--操作亲和性标签-->
      <el-dialog
        :title="$t('filter.dialog.editAbilityTag')"
        :visible.sync="abilityTagDialog.show"
        width="40%"
        :before-close="closeAbilityTagDialog"
        :close-on-click-modal="false"
      >
        <el-form
          :model="abilityTagDialog.model"
          ref="abilityForm"
          inline-message
        >
          <!--                    <el-tag effect="plain" style="margin-bottom: 2px">-->
          <!--                        {{ $t('filter.tip.affinityRemark') }}-->
          <!--                    </el-tag>-->
          <el-table :data="abilityTagDialog.model.abilityArr" border>
            <template slot="empty">
              <let-table-operation
                @click="addAbilityTag(0, abilityTagDialog.model.abilityArr)"
              >
                {{ $t("filter.tip.addAffinityGroup") }}
              </let-table-operation>
            </template>
            <el-table-column :label="$t('filter.title.app')">
              <template slot-scope="scope">
                <el-form-item
                  :prop="'abilityArr.' + scope.$index + '.application'"
                  :rules="[
                    {
                      validator: (rule, value, callback) => {
                        validateAppName(
                          rule,
                          value,
                          callback,
                          scope.row.application
                        );
                      },
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-select
                    v-model="scope.row.application"
                    :placeholder="$t('pub.dlg.defaultValue')"
                    style="width: 100%"
                    filterable
                    @change="changeApp(scope.$index, scope.row.application)"
                  >
                    <el-option
                      v-for="item in appList"
                      :key="item"
                      :label="item"
                      :value="item"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('filter.title.serverName')">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.serverName"
                  :placeholder="$t('pub.dlg.defaultValue')"
                  style="width: 100%"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in scope.row.serverNames"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('operate.operates')" width="120px">
              <template slot-scope="scope">
                <let-table-operation
                  @click="
                    addAbilityTag(
                      scope.$index,
                      abilityTagDialog.model.abilityArr
                    )
                  "
                >
                  {{ $t("operate.add") }}
                </let-table-operation>
                <let-table-operation
                  @click="
                    delAbilityTag(
                      scope.$index,
                      abilityTagDialog.model.abilityArr
                    )
                  "
                >
                  {{ $t("operate.delete") }}
                </let-table-operation>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeAbilityTagDialog">{{
            $t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="saveAbilityTag">{{
            $t("common.submit")
          }}</el-button>
        </span>
      </el-dialog>
    </template>

    <!-- 展示详情 -->
    <node-detail
      v-if="showDetail"
      @closeDetail="closeDetail"
      :nodeDetail="nodeDetail"
    ></node-detail>
  </div>
</template>

<script>
import _ from "lodash";
import nodeDetail from "./components/node-detail";

export default {
  name: "BaseBusiness",
  components: { nodeDetail },
  data() {
    return {
      multipleSelection: [],
      query: {
        NodeName: "",
      },
      items: [],
      pagination: { page: 1, size: 10, total: 1 },
      commonTagDialog: { flag: "one", show: false, model: {} },
      abilityTagDialog: { flag: "one", show: false, model: {} },
      appList: [],
      serList: [],

      showDetail: false,
      nodeDetail: {},
    };
  },
  filters: {
    tagType(val) {
      if (val.startsWith("taf.io/node")) {
        return "warning";
      } else {
        return "";
      }
    },
    abilityType(val) {
      if (val.indexOf(".") != -1) {
        return "success";
      } else {
        return "";
      }
    },
  },
  computed: {
    batchEnabled() {
      return this.multipleSelection.length > 0;
    },
  },
  mounted() {
    this.fetchData();
    this.getAppList();
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    gotoPage(num) {
      this.pagination.page = num;
      this.getServerList();
    },
    fetchData() {
      return this.$ajax
        .getJSON(
          "/k8s/api/node_select",
          Object.assign(this.query, {
            page: this.pagination.page,
            size: this.pagination.size,
          })
        )
        .then((data) => {
          data.Data.forEach((item) => {
            let status = "";
            item.Conditions.forEach((v) => {
              if (v.Type == "Ready") {
                status = v.status;
              }
            });
            status == "False"
              ? (item.status = "Unavailable")
              : (item.status = "Active");
          });
          this.items = data.Data;
          this.pagination.total = Math.ceil(
            data.Count.AllCount / this.pagination.size
          );
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    search() {
      this.pagination.page = 1;
      this.fetchData();
    },

    editCommonTag(row) {
      this.commonTagDialog.show = true;
      this.commonTagDialog.flag = "one";
      this.commonTagDialog.model = _.cloneDeep(row);
      this.commonTagDialog.model.commonArr = [];
      for (let key in row.Labels) {
        if (
          !key.startsWith("taf.io/node") &&
          !key.startsWith("taf.io/ability")
        ) {
          this.commonTagDialog.model.commonArr.push({
            name: key,
            value: row.Labels[key],
          });
        }
      }
    },
    batchEditCommon() {
      if (this.multipleSelection.length == 1) {
        this.editCommonTag(this.multipleSelection[0]);
      } else {
        this.commonTagDialog.show = true;
        this.commonTagDialog.flag = "batch";
        this.commonTagDialog.model.nodes = this.multipleSelection;
        this.commonTagDialog.model.commonArr = [{ name: "", value: "" }];
      }
    },
    saveCommonTag() {
      if (!this.validate(this.$refs.commonForm)) {
        return;
      }
      let nodeNames = [];
      if (this.commonTagDialog.model.nodes) {
        nodeNames = this.commonTagDialog.model.nodes.map((item) => {
          return item.NodeName;
        });
      }
      let url = "",
        queryData = {};
      if (this.commonTagDialog.flag == "one") {
        url = "/k8s/api/edit_common_tag";
        queryData = {
          nodeName: this.commonTagDialog.model.NodeName,
          tags: this.commonTagDialog.model.commonArr,
        };
      } else {
        url = "/k8s/api/batch_edit_common_tag";
        queryData = {
          nodeNames: nodeNames,
          tags: this.commonTagDialog.model.commonArr,
        };
      }
      this.$ajax
        .postJSON(url, queryData)
        .then(() => {
          this.$message.success(`${this.$t("common.success")}`);
          this.closeCommonTagDialog();
          this.fetchData();
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    closeCommonTagDialog() {
      this.commonTagDialog = { flag: "one", show: false, model: {} };
    },

    async editAbilityTag(row) {
      this.abilityTagDialog.show = true;
      this.abilityTagDialog.flag = "one";
      this.abilityTagDialog.model = _.cloneDeep(row);
      this.abilityTagDialog.model.abilityArr = [];
      for (let item of row.NodeAbility) {
        this.abilityTagDialog.model.abilityArr.push({
          application: item.split(".")[0],
          serverName: item.split(".")[1] || "",
          serverNames: await this.getServerList(item.split(".")[0]),
        });
      }
    },
    async batchEditAffinity() {
      if (this.multipleSelection.length == 1) {
        await this.editCommonTag(this.multipleSelection[0]);
      } else {
        this.abilityTagDialog.show = true;
        this.abilityTagDialog.flag = "batch";
        this.abilityTagDialog.model.nodes = this.multipleSelection;
        this.abilityTagDialog.model.abilityArr = [
          { application: "", serverName: "", serverNames: "" },
        ];
      }
    },
    saveAbilityTag() {
      if (!this.validate(this.$refs.abilityForm)) {
        return;
      }
      let nodeNames = [];
      if (this.abilityTagDialog.model.nodes) {
        nodeNames = this.abilityTagDialog.model.nodes.map((item) => {
          return item.NodeName;
        });
      }
      let tags = this.abilityTagDialog.model.abilityArr.map((item) => {
        return { application: item.application, serverName: item.serverName };
      });
      let url = "",
        queryData = {};
      if (this.abilityTagDialog.flag == "one") {
        url = "/k8s/api/edit_ability_tag";
        queryData = { nodeName: this.abilityTagDialog.model.NodeName, tags };
      } else {
        url = "/k8s/api/batch_edit_ability_tag";
        queryData = { nodeNames: nodeNames, tags };
      }
      this.$ajax
        .postJSON(url, queryData)
        .then(() => {
          this.$message.success(`${this.$t("common.success")}`);
          this.closeAbilityTagDialog();
          this.fetchData();
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    closeAbilityTagDialog() {
      this.abilityTagDialog = { flag: "one", show: false, model: {} };
    },
    validate(form) {
      let validate = true;
      form.validate((valid) => {
        if (!valid) {
          validate = false;
        }
      });
      return validate;
    },
    viewItem(row) {
      this.showDetail = true;
      this.nodeDetail = _.cloneDeep(row);
    },
    closeDetail() {
      this.showDetail = false;
      this.fetchData();
    },
    // taf框架节点开关
    changeStatus(val) {
      if (val.NodePublic) {
        if (val.Labels.hasOwnProperty("node-role.kubernetes.io/master")) {
          this.fetchData();
          return;
        } else {
          this.addTafTag(val.NodeName);
        }
      } else {
        this.delTafTag(val.NodeName);
      }
    },
    addTafTag(NodeName) {
      this.$ajax
        .postJSON("/k8s/api/taf_ability_open", {
          NodeName,
        })
        .then(() => {
          this.$tip.success(this.$t("common.success"));
          this.fetchData();
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    delTafTag(NodeName) {
      this.$ajax
        .postJSON("/k8s/api/taf_ability_close", {
          NodeName,
        })
        .then(() => {
          this.$tip.success(this.$t("common.success"));
          this.fetchData();
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    //获取应用列表
    getAppList() {
      this.$ajax
        .getJSON("/k8s/api/application_select", {})
        .then((data) => {
          this.appList = data.Data.map((item) => {
            return item.ServerApp;
          });
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    async getServerList(app) {
      let servers = await this.$ajax.getJSON("/k8s/api/server_list", {
        ServerApp: app,
        isAll: true,
      });
      let serverNames = servers.Data.map((item) => {
        return item.ServerName;
      });
      return serverNames;
    },
    async changeApp(index, app) {
      let servers = await this.getServerList(app);
      this.$set(
        this.abilityTagDialog.model.abilityArr[index],
        "serverNames",
        servers
      );
    },
    async queryAppChange() {
      let serList = await this.getServerList(this.query.ServerApp);
      this.$set(this.query, "ServerName", "");
      this.serList = serList;
    },
    addCommonTag(index, obj) {
      obj.splice(index + 1, 0, { name: "", value: "" });
      this.$forceUpdate();
    },
    delCommonTag(index, obj) {
      obj.splice(index, 1);
      this.$forceUpdate();
    },
    addAbilityTag(index, obj) {
      obj.splice(index + 1, 0, {
        application: "",
        serverName: "",
        serverNames: [],
      });
      this.$forceUpdate();
    },
    delAbilityTag(index, obj) {
      obj.splice(index, 1);
      this.$forceUpdate();
    },
    validateTagName(rule, value, callback, pars) {
      // 默认的方式新增的会不校验
      if (pars === "") {
        callback(new Error(`${this.$t("filter.tip.notNull")}`));
      } else if (pars.toLowerCase().startsWith("taf.io")) {
        callback(new Error(`${this.$t("filter.tip.notTaf")}`));
      } else {
        callback();
      }
    },
    validateAppName(rule, value, callback, pars) {
      if (pars === "") {
        callback(new Error(`${this.$t("filter.tip.application")}`));
      } else {
        callback();
      }
    },
  },
};
</script>

<style scoped>
pre {
  color: #909fa3;
  margin-top: 32px;
}

/deep/ .el-form-item {
  margin-bottom: 0px !important;
}

/deep/ .el-dialog__body {
  padding: 10px 20px !important;
}
</style>

<style>
.el-form--label-top .el-form-item__label {
  /*elementui 当formitem 在上方的时候padding过大*/
  padding: 0 0 0px !important;
}
</style>
