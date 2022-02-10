<template>
  <div>
    <el-dialog
      :title="$t('market.service.install')"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <let-form
        ref="form"
        inline
        label-position="top"
        itemWidth="30%"
        v-if="deployObj"
        @submit.native.prevent="next"
      >
        <let-form-item :label="$t('deployService.form.app')" required>
          <let-input
            size="small"
            v-model="deployObj.app"
            :placeholder="$t('deployService.form.appAdd')"
            required
            :required-tip="$t('deployService.form.appTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.applicationTip')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')" required>
          <let-input
            size="small"
            v-model="deployObj.server"
            :placeholder="$t('deployService.form.serviceFormatTips')"
            required
            :required-tip="$t('deployService.form.serviceTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.serviceFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.template')" required>
          <let-select
            size="small"
            v-model="deployObj.template"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in templates" :key="d" :value="d">{{
              d
            }}</let-option>
          </let-select>
        </let-form-item>
        <let-table :data="deployObj.servants">
          <let-table-column title="OBJ" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                disabled
                v-model="props.row.name"
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.form.objTips')"
                pattern="^[a-zA-Z0-9]+$"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.port')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                :max="65535"
                v-model="props.row.port"
                placeholder="0-65535"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.form.portType')"
            width="150px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.isTcp" :label="true"
                >TCP</let-radio
              >
              <let-radio disabled v-model="props.row.isTcp" :label="false"
                >UDP</let-radio
              >
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.protocol')"
            width="180px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.isTars" :label="true"
                >TARS</let-radio
              >
              <let-radio disabled v-model="props.row.isTars" :label="false">{{
                $t("serverList.servant.notTARS")
              }}</let-radio>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.threads')"
            width="60px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.thread"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.servant.connections')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.connection"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.capacity')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.capacity"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.timeout')"
            width="120px"
          >
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.timeout"
              ></let-input>
            </template>
          </let-table-column>
        </let-table>
        <let-button type="submit" theme="primary">{{
          $t("common.submit")
        }}</let-button>
      </let-form>
    </el-dialog>

    <el-dialog
      :title="$t('common.config')"
      :visible.sync="dialogConfigVisible"
      v-if="deployObj"
      width="80%"
      @submit.native.prevent="save"
    >
      <let-form ref="configForm" itemWidth="100%">
        <el-tabs v-model="activeName" type="border-card">
          <el-tab-pane
            v-for="config in deployObj.config"
            :key="config.name"
            :label="config.name"
            :name="config.name"
          >
            <let-form-item :label="$t('cfg.btn.fileName')" required>
              <let-input
                size="small"
                disabled
                v-model="config.name"
                required
              ></let-input>
            </let-form-item>
            <let-form-item :label="$t('cfg.btn.content')" required>
              <let-input
                size="large"
                type="textarea"
                :rows="16"
                v-model="config.content"
                required
              ></let-input>
            </let-form-item>
          </el-tab-pane>
        </el-tabs>
        <br />
        <let-button type="submit" theme="primary">{{
          $t("common.submit")
        }}</let-button>
        &nbsp;&nbsp;
        <let-button @click="prevStep">{{ $t("common.prevStep") }}</let-button>
      </let-form>
    </el-dialog>

    <install
      ref="install"
      v-if="deployObj"
      :deployObj="deployObj"
      @doInstall="doInstall"
    ></install>
  </div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import jsYaml from "js-yaml";
import install from "@/k8s/inc/k8s/install";

export default {
  name: "Install",
  components: {
    install,
  },
  data() {
    return {
      dialogVisible: false,
      dialogConfigVisible: false,
      upgrade: false,
      templates: [
        "tars.cpp",
        "tars.go",
        "tars.nodejs",
        "tars.java",
        "tars.php",
      ],
      abilityAffinities: [
        "AppRequired",
        "ServerRequired",
        "AppOrServerPreferred",
        "None",
      ],
      deployObj: null,
      activeName: null,
      enableLogin: false,
      k8s: true,
    };
  },
  props: ["serviceVersion"],
  mounted() {
    this.k8s = location.pathname == "/k8s.html";
  },
  methods: {
    show() {
      this.upgrade = false;
      this.dialogVisible = true;
      this.dialogConfigVisible = false;

      this.fetchDeployObj();
    },
    upgradeK8S() {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/market/api/upgrade", {
          deploy: this.deployObj,
          serviceVersion: this.serviceVersion,
          k8s: this.k8s,
        })
        .then((res) => {
          loading.hide();
          this.$message({
            message: `${this.$t("common.success")}`,
            type: "success",
          });
        })
        .catch((err) => {
          loading.hide();
        });
    },
    showUpgrade() {
      this.$confirm(
        this.$t("market.deploy.upgradeInfo"),
        this.$t("market.deploy.upgrade"),
        {
          confirmButtonText: this.$t("market.deploy.upgrade"),
          cancelButtonText: this.$t("market.deploy.cancel"),
          type: "warning",
        }
      )
        .then(() => {
          this.upgrade = true;

          this.fetchDeployObj(() => {
            this.upgradeK8S();
          });
        })
        .catch(() => {});
    },
    initialModelK8S(deployObj) {
      if (deployObj.config && deployObj.config.length > 0) {
        this.activeName = deployObj.config[0].name;
      }
    },
    fetchDeployObj(callback) {
      const loading = this.$Loading.show();

      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy)
        .then((data) => {
          loading.hide();

          if (data.ok) {
            data.text().then((content) => {
              this.deployObj = jsYaml.load(content);

              this.initialModelK8S(this.deployObj);

              if (callback) {
                callback();
              }
            });
          }
        })
        .catch((err) => {
          loading.hide();

          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    doInstall() {
      this.$confirm(this.$t("market.deploy.install"), "Hint", {
        confirmButtonText: this.$t("market.deploy.confirm"),
        cancelButtonText: this.$t("market.deploy.cancel"),
        type: "warning",
      })
        .then(() => {
          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/market/api/install", {
              deploy: this.deployObj,
              serviceVersion: this.serviceVersion,
              k8s: this.k8s,
            })
            .then((res) => {
              loading.hide();
              this.$message({
                message: `${this.$t("common.success")}`,
                type: "success",
              });
              this.dialogVisible = false;
              this.$refs.install.closeDetailModel();
            })
            .catch((err) => {
              loading.hide();
              if (err.ret_code == 201) {
                this.$message({
                  showClose: true,
                  message: this.$t("market.deploy.existsK8S"),
                  type: "warning",
                });
              } else {
                this.$message({
                  message: err,
                  type: "error",
                });
              }
            });
        })
        .catch(() => {});
    },
    prevStep() {
      this.dialogVisible = true;
      this.dialogConfigVisible = false;
    },
    next() {
      this.$ajax
        .postJSON("/market/api/exists", {
          app: this.deployObj.app,
          server: this.deployObj.server,
          k8s: this.k8s,
        })
        .then((data) => {
          if (data) {
            this.$message({
              showClose: true,
              message: this.$t("market.deploy.existsK8S"),
              type: "warning",
            });
            return;
          }

          this.dialogVisible = false;

          if (this.activeName) {
            this.dialogConfigVisible = true;
          } else {
            this.save();
          }
        })
        .catch((err) => {});
    },
    save() {
      this.dialogConfigVisible = false;

      this.$refs.install.show();
    },
  },
};
</script>

<style>
.set_inputer_item {
  float: left;
  margin-right: 8px;
  width: 126px;
}
</style>
