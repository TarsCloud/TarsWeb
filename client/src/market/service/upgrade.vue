<template>
  <div>
    <el-dialog title="升级" :visible.sync="dialogVisible" width="70%">
      <el-alert
        style="margin: 5px 0 5px 0"
        title="版本切换不会变更配置文件, 如有需要请自己变更配置"
        type="error"
      >
      </el-alert>
      <el-alert
        style="margin: 5px 0 5px 0"
        title="版本切换不会变更服务模板, 如有需要请自己变更服务模板"
        type="error"
      >
      </el-alert>
      <yaml-editor
        v-model="deploy"
        style="margin: 1px; height: 70%"
        ref="yamlEdit"
      ></yaml-editor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doUpgrade">切换版本</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import YamlEditor from "@/components/editor/yaml-editor";
import jsYaml from "js-yaml";
export default {
  name: "Upgrade",
  components: {
    YamlEditor,
  },
  props: ["serviceVersion"],
  data() {
    return {
      dialogVisible: false,
      deploy: "",
    };
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.fetchDeploy();
    },
    doGet(app, server, callback) {
      this.$ajax
        .postJSON("/market/api/get", {
          app,
          server,
        })
        .then((res) => {
          callback(res);
        })
        .catch((err) => {
          this.$message({
            message: `${this.$t("common.error")}: ${err.message ||
              err.err_msg}`,
            type: "error",
          });
        });
    },
    doUpgrade() {
      this.$ajax
        .postJSON("/market/api/upgrade", {
          deploy: this.deploy,
          serviceVersion: this.serviceVersion,
        })
        .then((res) => {
          this.$message({
            message: `${this.$t("common.success")}`,
            type: "success",
          });

          this.dialogVisible = false;

          this.$emit("upgradeSucc");
        })
        .catch((err) => {
          this.$message({
            message: `${this.$t("common.error")}: ${err.message ||
              err.err_msg}`,
            type: "error",
          });
        });
    },
    fetchDeploy() {
      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy)
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              let y = jsYaml.load(content);
              delete y.cloud;
              delete y.config;
              delete y.appConfig;
              delete y.nodeConfig;
              y.repo.id = "";

              y.app = this.serviceVersion.installData.group;
              y.server = this.serviceVersion.installData.name;

              this.doGet(y.app, y.server, (res) => {
                //use real config
                y.replicas = res.spec.k8s.replicas;
                y.hostNetwork = res.spec.k8s.hostNetwork;
                y.hostIPC = res.spec.k8s.hostIpc;
                y.hostPorts = res.spec.k8s.hostPorts || [];
                y.mounts = res.spec.k8s.mounts;
                y.nodeSelector = res.spec.k8s.nodeSelector;
                y.notStacked = res.spec.k8s.notStacked;
                y.abilityAffinity = res.spec.k8s.abilityAffinity;

                if (y.profile == "") {
                  y.profile = res.spec.tars.profile;
                }

                y.asyncThread = res.spec.tars.asyncThread;
                y.template = res.spec.tars.template;
                res.spec.tars.servants.forEach((servant) => {
                  let s = y.servants.filter((s) => {
                    return s.name == servant.name;
                  });

                  if (!s) {
                    y.servants.push(servant);
                  }
                });

                this.deploy = jsYaml.dump(y);
              });
            });
          }
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },
  created() {},
  mounted() {},
};
</script>
