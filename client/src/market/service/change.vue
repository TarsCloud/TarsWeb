<template>
  <div>
    <el-dialog title="切换版本" :visible.sync="dialogVisible" width="70%">
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
  name: "Change",
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
    showInstall() {
      this.dialogVisible = true;
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
