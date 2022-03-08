<template>
  <div>
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="30%"
      v-if="deployObj"
      @submit.native.prevent="next"
    >
      <let-form-item :label="$t('deployService.form.app')" required>
        <let-select
          size="small"
          v-model="deployObj.app"
          :placeholder="$t('deployService.form.placeholder')"
          required
          :required-tip="$t('deployService.form.appTips')"
          pattern="^[a-zA-Z0-9]+$"
          :pattern-tip="$t('deployService.form.placeholder')"
        >
          <let-option
            v-for="d in appList"
            :key="d.ServerApp"
            :value="d.ServerApp"
            >{{ d.ServerApp }}</let-option
          >
        </let-select>

        <!-- <let-input
          size="small"
          v-model="deployObj.app"
          :placeholder="$t('deployService.form.appAdd')"
          required
          :required-tip="$t('deployService.form.appTips')"
          pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
          :pattern-tip="$t('deployService.form.applicationTip')"
        ></let-input> -->
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
          <let-option
            v-for="d in templates"
            :key="d.TemplateId"
            :value="d.TemplateId"
            >{{ d.TemplateId }}</let-option
          >
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
              :disabled="!deployObj.new"
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
            <let-radio
              :disabled="!deployObj.new"
              v-model="props.row.isTcp"
              :label="true"
              >TCP</let-radio
            >
            <let-radio
              :disabled="!deployObj.new"
              v-model="props.row.isTcp"
              :label="false"
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
            <let-radio
              :disabled="!deployObj.new"
              v-model="props.row.isTars"
              :label="true"
              >TARS</let-radio
            >
            <let-radio
              :disabled="!deployObj.new"
              v-model="props.row.isTars"
              :label="false"
              >{{ $t("serverList.servant.notTARS") }}</let-radio
            >
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
          width="100px"
        >
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.timeout"
              style="padding-right:20px"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('operate.operates')"
          width="60px"
          v-if="deployObj.new"
        >
          <template slot-scope="props">
            <let-table-operation
              @click="addAdapter(props.row)"
              v-if="props.$index === 0"
              >{{ $t("operate.add") }}
            </let-table-operation>
            <let-table-operation
              v-if="props.$index"
              class="danger"
              @click="deployObj.servants.splice(props.$index, 1)"
              >{{ $t("operate.delete") }}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <let-button type="submit" theme="primary">{{
        $t("common.submit")
      }}</let-button>
    </let-form>
  </div>
</template>

<script>
import install from "@/k8s/inc/k8s/install";
export default {
  name: "Base",
  components: {
    install,
  },
  data() {
    return {
      appList: [],

      templates: [],
      // deployObj: null,
    };
  },
  props: ["deployObj"],
  mounted() {
    this.getServerTemplate();
    this.getAppList();
  },
  methods: {
    addAdapter(row) {
      row = this.deployObj.servants[this.deployObj.servants.length - 1];
      const Port = row.Port + 1;
      const newObj = Object.assign({}, row, { Port });
      this.deployObj.servants.push(Object.assign({}, newObj));
    },
    getAppList() {
      this.$ajax
        .getJSON("/k8s/api/application_select", { isAll: true })
        .then((data) => {
          this.appList = data.Data;

          let pos = this.appList.find((v) => {
            return v.ServerApp == this.deployObj.app;
          });

          if (pos == -1) {
            this.appList.push({
              ServerApp: this.deployObj.app,
            });
          }
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    getServerTemplate() {
      this.$ajax
        .getJSON("/k8s/api/template_select", {
          isAll: true,
        })
        .then((data) => {
          this.templates = data.Data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    // initialModelK8S(deployObj) {
    //   if (deployObj.config && deployObj.config.length > 0) {
    //     this.activeName = deployObj.config[0].name;
    //   }
    // },
    // doInstall() {
    //   this.$confirm(this.$t("cloud.deploy.install"), "Hint", {
    //     confirmButtonText: this.$t("cloud.deploy.confirm"),
    //     cancelButtonText: this.$t("cloud.deploy.cancel"),
    //     type: "warning",
    //   })
    //     .then(() => {
    //       const loading = this.$Loading.show();
    //       this.$ajax
    //         .postJSON("/market/api/install", {
    //           deploy: this.deployObj,
    //           serviceVersion: this.serviceVersion,
    //           k8s: this.k8s,
    //         })
    //         .then((res) => {
    //           loading.hide();
    //           this.$message({
    //             message: `${this.$t("common.success")}`,
    //             type: "success",
    //           });
    //           this.dialogVisible = false;
    //           this.$refs.install.closeDetailModel();
    //         })
    //         .catch((err) => {
    //           loading.hide();
    //           if (err.ret_code == 201) {
    //             this.$message({
    //               showClose: true,
    //               message: this.$t("cloud.deploy.existsK8S"),
    //               type: "warning",
    //             });
    //           } else {
    //             this.$message({
    //               message: err,
    //               type: "error",
    //             });
    //           }
    //         });
    //     })
    //     .catch(() => {});
    // },
    next() {
      this.$ajax
        .getJSON("/k8s/api/exists", {
          app: this.deployObj.app,
          server: this.deployObj.server,
        })
        .then((data) => {
          if (data) {
            this.$message({
              showClose: true,
              message: this.$t("cloud.deploy.existsK8S"),
              type: "warning",
            });
            return;
          }

          this.$emit("next", this.deployObj);
        })
        .catch((err) => {});

      // this.$refs.install.show();
    },
  },
};
</script>
