<template>
  <div>
    <el-dialog
      :title="$t('cloud.service.install')"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <baseInfo @next="next" v-if="deployObj" :deployObj="deployObj"></baseInfo>
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
import baseInfo from "@/k8s/inc/k8s/base";
import install from "@/k8s/inc/k8s/install";

export default {
  name: "Install",
  components: {
    install,
    baseInfo,
  },
  data() {
    return {
      dialogVisible: false,
      dialogConfigVisible: false,
      upgrade: false,
      deployObj: null,
      activeName: null,
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
        .postJSON("/k8s/api/upgrade", {
          deploy: this.deployObj,
          cloud: {
            installData: {
              group: this.serviceVersion.installData.group,
              name: this.serviceVersion.installData.name,
            },
            group: this.serviceVersion.group,
            name: this.serviceVersion.name,
            version: this.serviceVersion.version,
            logo: this.serviceVersion.logo,
            digest: this.serviceVersion.digest,
          },
          serviceVersion: this.serviceVersion,
          k8s: this.k8s,
        })
        .then((res) => {
          loading.hide();

          this.$common.showSucc();
        })
        .catch((err) => {
          loading.hide();
          this.$common.showError(err);
        });
    },
    showUpgrade() {
      this.$confirm(
        this.$t("cloud.deploy.upgradeInfo"),
        this.$t("cloud.deploy.upgrade"),
        {
          confirmButtonText: this.$t("cloud.deploy.upgrade"),
          cancelButtonText: this.$t("cloud.deploy.cancel"),
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

          this.$common.showError(err);
        });
    },
    doInstall() {
      this.$confirm(this.$t("cloud.deploy.install"), "Hint", {
        confirmButtonText: this.$t("cloud.deploy.confirm"),
        cancelButtonText: this.$t("cloud.deploy.cancel"),
        type: "warning",
      })
        .then(() => {
          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/k8s/api/install", {
              deploy: this.deployObj,
              cloud: {
                group: this.serviceVersion.group,
                name: this.serviceVersion.name,
                version: this.serviceVersion.version,
                logo: this.serviceVersion.logo,
                digest: this.serviceVersion.digest,
              },
            })
            .then((res) => {
              loading.hide();
              this.$common.showSucc();
              this.dialogVisible = false;
              this.$refs.install.closeDetailModel();
            })
            .catch((err) => {
              loading.hide();
              if (err.ret_code == 201) {
                this.$common.showWarning(this.$t("cloud.deploy.existsK8S"));
              } else {
                this.$common.showError(err);
              }
            });
        })
        .catch(() => {});
    },
    prevStep() {
      this.dialogVisible = true;
      this.dialogConfigVisible = false;
    },
    next(deployObj) {
      this.deployObj = deployObj;

      this.dialogVisible = false;

      if (this.activeName) {
        this.dialogConfigVisible = true;
      } else {
        this.save();
      }
    },
    save() {
      this.dialogConfigVisible = false;

      this.$refs.install.show();
    },
  },
};
</script>
