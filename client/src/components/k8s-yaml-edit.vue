<template>
  <el-card shadow="never">
    <div style="border:1px solid #595656;border-radius: 5px;">
      <yaml-editor
        v-model="yamlContent"
        style="margin: 1px"
        ref="yamlEdit"
      ></yaml-editor>
    </div>
    <div class="bottom">
      <el-upload
        :before-upload="uploadFile"
        :show-file-list="false"
        action=""
        list-type="yml/yaml"
      >
        <el-button size="mini" type="primary"
          >{{ $t("deployService.form.uploadConf") }}
        </el-button>
      </el-upload>
      <el-button
        type="primary"
        size="mini"
        @click="save"
        style="margin-left: 10px"
        >{{ $t("operate.save") }}
      </el-button>
    </div>
  </el-card>
</template>

<script>
import YamlEditor from "@/components/editor/yaml-editor";

export default {
  name: "k8sYamlEdit",
  components: { YamlEditor },
  data() {
    return {
      treeid: "",
      plural: "",
      yamlContent: "",
    };
  },
  methods: {
    refresh() {
      //用于编辑框需要点击一下才出数据时,可手动触发刷新
      this.$refs.yamlEdit.refresh();
    },
    readonly() {
      this.$refs.yamlEdit.readonly();
    },
    show(treeid, plural) {
      (this.treeid = treeid), (this.plural = plural);
      this.$ajax
        .getJSON("/k8s/api/get_object", {
          plural: plural,
          tree_node_id: this.treeid,
        })
        .then((data) => {
          this.yamlContent = data;
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    save() {
      this.$ajax
        .postJSON("/k8s/api/update_object", {
          plural: this.plural,
          tree_node_id: this.treeid,
          yamlContent: this.yamlContent,
        })
        .then((data) => {
          this.$emit("flushOthers", this.treeid);
          this.$message.success(`${this.$t("common.success")}`);
          this.$emit("successFun");
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    uploadFile(file) {
      let filename = file.name;
      if (filename.lastIndexOf(".") == -1) {
        this.$message.error(`${this.$t("deployService.batchDeploy.errFile")}`);
        return false;
      }
      let AllImgExt = ".yml|.yaml|";
      let extName = filename.substring(filename.lastIndexOf(".")).toLowerCase();
      if (AllImgExt.indexOf(extName + "|") == -1) {
        this.$message.error(`${this.$t("deployService.batchDeploy.errFile")}`);
        return false;
      }
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      let _this = this;
      reader.onload = function(evt) {
        let str = evt.target.result;
        _this.$nextTick(() => {
          _this.yamlContent = reader.result;
        });
      };
    },
  },
};
</script>

<style scoped>
.title {
  font-size: 16px;
}

.bottom {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
