<!--
* @author: fanmei
* @date: 2022-01-04 11:23
* @description：集群配置管理
-->
<template>
  <div class="page_framework_config">
    <template>
      <span>
        <el-button
          size="mini"
          style="width:100px; margin: 10px 0 5px 0;"
          type="primary"
          @click="showYaml"
          >{{ $t("operate.yaml") }}
        </el-button>
        <span>
          <i
            class="icon iconfont el-icon-third-shuaxin"
            style="font-family: iconfont  !important;margin:10px"
            @click="getTfc()"
          ></i>
        </span>
      </span>
      <el-table :data="config" style="width: 100%" stripe border>
        <el-table-column
          prop="column"
          label="key"
          width="300"
        ></el-table-column>
        <el-table-column
          prop="remark"
          label="remark"
          width="300"
        ></el-table-column>
        <el-table-column label="value">
          <template slot-scope="scope">
            <el-select
              v-if="scope.row.column == 'nodeImage.image'"
              size="small"
              v-model="scope.row.value"
              style="width: 100%"
            >
              <el-option v-for="d in nodeList" :key="d.Image" :value="d.Image">
                <span>{{ d.Image }}</span>
              </el-option>
            </el-select>
            <el-input
              v-else
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 8 }"
              placeholder="请输入内容"
              v-model="scope.row.value"
            >
            </el-input>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operate.operates')" width="150">
          <template slot-scope="scope">
            <let-table-operation @click="saveTfcItem(scope.row)">
              {{ $t("operate.save") }}
            </let-table-operation>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        title="Framework config"
        width="50%"
        top="50px"
        :visible.sync="showDialog"
        :before-close="closeDialog"
        :close-on-click-modal="false"
      >
        <k8s-yaml-edit ref="yamlEdit" @successFun="closeDialog"></k8s-yaml-edit>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import K8sYamlEdit from "../../components/k8s-yaml-edit";

export default {
  name: "frameworkConfig",
  data() {
    return {
      showDialog: false,
      config: [],
      nodeList: [], // tafnode
    };
  },
  components: { K8sYamlEdit },
  mounted() {
    this.getTfc();
    this.getTafNodeList();
  },
  methods: {
    getTfc() {
      this.$ajax
        .getJSON("/k8s/api/get_tfc")
        .then((data) => {
          this.config = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    getTafNodeList() {
      this.$ajax.getJSON("/k8s/api/image_node_select").then((data) => {
        this.nodeList = data.Data;
      });
    },
    saveTfcItem(row) {
      this.$ajax
        .postJSON("/k8s/api/save_tfc_item", row)
        .then((data) => {
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    showYaml() {
      this.showDialog = true;
      this.$nextTick(() => {
        this.$refs.yamlEdit.show("111", "tframeworkconfigs"); // 点击yaml编辑自动刷新结构
        this.$refs.yamlEdit.refresh();
      });
    },
    closeDialog() {
      this.showDialog = false;
      this.getTfc();
    },
  },
};
</script>

<style scoped>
.page_framework_config {
}
</style>
