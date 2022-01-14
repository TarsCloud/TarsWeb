<template>
  <div>
    <el-dialog title="安装" :visible.sync="dialogVisible" width="70%">
      <el-alert
        style="margin: 5px 0 5px 0"
        title="请根据实际情况变更app/server"
        type="error"
      >
      </el-alert>
      <el-alert
        style="margin: 5px 0 5px 0"
        title="如果有配置文件, 请根据实际情况调整配置文件"
        type="error"
      >
      </el-alert>
      <el-alert
        style="margin: 5px 0 5px 0"
        title="请不要随意变更servants配置信息和镜像地址"
        type="error"
      >
      </el-alert>
      <el-alert
        style="margin: 5px 0 5px 0"
        title="为了顺利拉取镜像, 请在K8S集群中配置好仓库的secret: cloud-market-secret"
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
        <el-button type="primary" @click="doInstall">安装</el-button>
      </span>
    </el-dialog>

    <upgrade
      v-if="upgradeServiceVersion"
      ref="upgrade"
      @upgradeSucc="upgradeSucc"
      :serviceVersion="upgradeServiceVersion"
    ></upgrade>
  </div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import YamlEditor from "@/components/editor/yaml-editor";
import jsYaml from "js-yaml";
import upgrade from "./upgrade";
export default {
  name: "Install",
  components: {
    YamlEditor,
    upgrade,
  },
  props: ["serviceVersion"],
  data() {
    return {
      dialogVisible: false,
      upgradeServiceVersion: null,
      deploy: "",
    };
  },
  methods: {
    showInstall() {
      this.dialogVisible = true;
    },
    upgradeSucc() {},
    doInstall() {
      this.$confirm("确定安装该服务么?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$ajax
            .postJSON("/market/api/install", {
              deploy: this.deploy,
              serviceVersion: this.serviceVersion,
            })
            .then((res) => {
              this.$message({
                message: `${this.$t("common.success")}`,
                type: "success",
              });

              this.dialogVisible = false;
            })
            .catch((err) => {
              if (err.ret_code == 201) {
                this.$confirm("服务已经存在, 是否覆盖安装?", "提示", {
                  confirmButtonText: "覆盖安装",
                  cancelButtonText: "取消",
                  type: "warning",
                })
                  .then(() => {
                    this.dialogVisible = false;
                    this.upgradeServiceVersion = this.serviceVersion;
                    let deploy = jsYaml.load(this.deploy);
                    this.upgradeServiceVersion.installData = {
                      group: deploy.app,
                      name: deploy.server,
                    };

                    this.$nextTick(() => {
                      this.$refs.upgrade.show();
                    });
                  })
                  .catch();
              } else {
                this.$message({
                  message: `${this.$t("common.error")}: ${err.message ||
                    err.err_msg}`,
                  type: "error",
                });
              }
            });
        })
        .catch(() => {});
    },
    fetchDeploy() {
      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy)
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              let y = jsYaml.load(content);
              delete y.cloud;
              y.repo.id = "";

              this.deploy = jsYaml.dump(y);
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
  mounted() {
    this.fetchDeploy();
  },
};
</script>
