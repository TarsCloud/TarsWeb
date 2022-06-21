<template>
  <el-card shadow="never" style="padding: 5px" v-if="k8sData">
    <el-form ref="k8sDetailForm" inline label-position="top">
      <div>
        <el-row :gutter="18">
          <el-col :span="6">
            <el-form-item
              :label="$t('deployService.table.th.hostIpc')"
              label-width="200px"
            >
              <el-radio-group v-model="k8sData.HostIpc" @change="changeKind">
                <el-radio :label="true">{{ $t("common.true") }}</el-radio>
                <el-radio :label="false">{{ $t("common.false") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              :label="$t('deployService.table.th.hostNetwork')"
              label-width="200px"
            >
              <el-radio-group
                v-model="k8sData.HostNetwork"
                @change="changeKind"
              >
                <el-radio :label="true">{{ $t("common.true") }}</el-radio>
                <el-radio :label="false">{{ $t("common.false") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              :label="$t('deployService.table.th.hostPort')"
              label-width="200px"
            >
              <el-radio-group
                v-model="k8sData.showHostPort"
                @change="changeKind"
              >
                <el-radio :label="true">{{ $t("common.true") }}</el-radio>
                <el-radio :label="false">{{ $t("common.false") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-table
          v-if="k8sData.showHostPort"
          :data="HostPortArr"
          style="padding-right: 30px"
        >
          <el-table-column title="OBJ">
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <el-input
                size="small"
                v-model="props.row.obj"
                disabled
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.form.objTips')"
                pattern="^[a-zA-Z0-9]+$"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column :title="$t('deployService.table.th.hostPort')">
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <el-input
                size="small"
                type="number"
                :min="1"
                :max="65535"
                v-model="props.row.HostPort"
                placeholder="1-65535"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="props">
              <el-button
                size="small"
                theme="primary"
                class="port-button"
                @click="generateHostPort(props.row)"
              >
                {{ $t("deployService.table.th.checkHostPort") }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column title="Open">
            <template slot-scope="props">
              <el-switch size="small" v-model="props.row.open" @change="change">
                <span slot="open">ON</span>
                <span slot="close">OFF</span>
              </el-switch>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <el-row type="flex" justify="end" v-if="!install">
      <el-col :span="2">
        <el-button size="mini" type="primary" @click="save">{{
          $t("operate.save")
        }}</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  props: ["k8sModel", "install"],
  name: "NetworkK8S",
  data() {
    return {
      k8sData: null,
      HostPortArr: [],
    };
  },
  mounted() {
    this.k8sData = this.k8sModel;
    this.HostPortArr = this.k8sData.HostPortArr;
  },
  methods: {
    changeKind() {
      if (this.k8sData.showHostPort) {
        let index = this.HostPortArr.findIndex((value) => {
          return value.open;
        });
        if (index == -1) {
          this.HostPortArr.forEach((h) => {
            h.open = true;
          });

          this.k8sData.HostPortArr = this.HostPortArr;
        }
      }

      this.$forceUpdate();
    },
    change() {
      let index = this.HostPortArr.findIndex((value) => {
        return value.open;
      });
      if (index == -1) {
        this.showHostPort = false;
      }

      this.$forceUpdate();
    },
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.k8sData.HostPortArr = this.HostPortArr;

        this.$emit("saveNetwork", this.k8sData);
      }
    },
    // 自动生成端口
    generateHostPort(hostPort) {
      this.$ajax
        .getJSON("/k8s/api/check_host_port", {
          NodePort: hostPort.HostPort,
        })
        .then((res) => {
          let msg = "";
          res.forEach((item) => {
            if (item.ret == -1) {
              //telnet 不通
              msg += `<p>${item.node}:${item.port}: can use</p>`;
            } else {
              msg += `<p style="color: #F56C6C">${item.node}:${item.port}: cannot use</p>`;
            }
          });
          this.$message.success({
            dangerouslyUseHTMLString: true,
            message: msg,
          });
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
  },
};
</script>
