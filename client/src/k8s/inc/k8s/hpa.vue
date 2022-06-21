<!--HPA(Horizontal Pod Autoscaler) -  POD水平自动伸缩-->
<template>
  <el-card style="padding: 5px">
    <el-form
      label-position="top"
      size="small"
      ref="hpaForm"
      :model="hpaModelData"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('deployService.hpa.form.minReplicas')"
            prop="minReplicas"
            :rules="[
              {
                required: true,
                message: $t('deployService.hpa.tip.minReplicas'),
                trigger: 'blur',
              },
            ]"
          >
            <el-input
              v-model="hpaModelData.minReplicas"
              oninput="value=value.replace(/[^\d]/g,'')"
              :placeholder="$t('deployService.hpa.tip.minReplicas')"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('deployService.hpa.form.maxReplicas')"
            prop="maxReplicas"
            :rules="[
              {
                required: true,
                message: $t('deployService.hpa.tip.maxReplicas'),
              },
            ]"
          >
            <el-input
              v-model="hpaModelData.maxReplicas"
              oninput="value=value.replace(/[^\d]/g,'')"
              :placeholder="$t('deployService.hpa.tip.maxReplicas')"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">{{
        $t("inf.benchmark.detail")
      }}</el-divider>
      <el-card
        shadow="hover"
        v-for="(item, index) in hpaModelData.indicatorData"
        :key="index"
        style="margin-bottom: 5px"
      >
        <el-alert
          type="warning"
          :title="$t('deployService.hpa.tip.t2')"
          show-icon
          :closable="false"
        ></el-alert>
        <el-row :gutter="20">
          <el-col :span="24"
            ><!--指标名称  -->
            <el-form-item
              :label="$t('deployService.hpa.form.IndicatorName')"
              :prop="`indicatorData.${index}.name`"
              :rules="[
                {
                  required: true,
                  message: $t('deployService.hpa.tip.IndicatorName'),
                  trigger: 'change',
                },
              ]"
            >
              <el-select
                v-model="item.name"
                style="width: 100%"
                filterable
                @change="changeType(index, item.name)"
              >
                <el-option
                  v-for="d in customTargets"
                  :key="d"
                  :label="d"
                  :value="d"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              :label="$t('deployService.hpa.form.targetType')"
              :prop="`indicatorData.${index}.targetType`"
              :rules="[
                {
                  required: true,
                  message: $t('deployService.hpa.tip.targetType'),
                  trigger: 'change',
                },
              ]"
            >
              <el-select
                v-model="item.targetType"
                @change="$forceUpdate()"
                style="width: 100%"
              >
                <el-option
                  v-for="(value, key) in getTargetTypes(item.name)"
                  :key="key"
                  :label="value"
                  :value="key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('deployService.hpa.form.value')"
              :prop="`indicatorData.${index}.value`"
              :rules="[
                {
                  required: true,
                  message: $t('deployService.hpa.tip.value'),
                  trigger: 'change',
                },
              ]"
            >
              <el-input
                v-model="item.value"
                onkeyup="value=value.replace(/[^\d]/g,'')"
              >
                <template slot="append">{{
                  item.targetType | getValueUnit
                }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!--对象类型展示信息-->
        <el-row type="flex" justify="end">
          <el-col :span="3">
            <el-button
              size="mini"
              type="primary"
              @click="addItems(index, hpaModelData.indicatorData)"
            >
              {{ $t("deployService.hpa.form.addIndicator") }}
            </el-button>
          </el-col>
          <el-col :span="3">
            <el-button
              size="mini"
              type="danger"
              @click="delItems(index, hpaModelData.indicatorData)"
            >
              {{ $t("deployService.hpa.form.delIndicator") }}
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <el-row type="flex" justify="end" style="margin-top: 15px" v-if="!install">
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
  props: ["hpaModel", "serverData", "sourceModel", "indicators", "install"],
  name: "hpaK8S",
  data() {
    return {
      customTargets: ["cpu", "memory"],
    };
  },
  mounted() {
    this.hpaModelData = this.hpaModel;

    // master版本目前不放出自定义指标,只留系统指标
    // this.$ajax.getJSON('/k8s/api/get_hpa_target', {}).then((data) => {
    //     this.customTargets = data
    // }).catch((err) => {
    //     this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
    // });
  },
  filters: {
    getValueUnit(val) {
      if (val.toLowerCase() == "averagevalue") return "MiB";
      if (val.toLowerCase() == "averageutilization") return "%";
      else return "MiB";
    },
  },
  methods: {
    save() {
      if (
        !this.sourceModel.limitCpu &&
        !this.sourceModel.limitMem &&
        !this.sourceModel.requestCpu &&
        !this.sourceModel.requestMem
      ) {
        this.$message.error(
          `${this.$t("deployService.resources.tip.resources")}`
        );
        return;
      }
      this.$refs.hpaForm.validate((valid) => {
        let data = Object.assign({}, this.hpaModelData, {
          serverData: this.serverData,
        });
        if (valid) {
          this.$emit("saveHpa", data);
          //     this.$ajax.postJSON('/k8s/api/create_hpa', data).then((res) => {
          //         this.$message.success(`${this.$t('common.success')}`);
          //     }).catch((err) => {
          //         this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
          //     });
          // } else {
          //     this.$message.warning(`${this.$t('deployService.hpa.tip.checkForm')}`);
        }
      });
    },
    addItems(index, obj) {
      obj.splice(index + 1, 0, {
        name: "cpu",
        targetType: "AverageUtilization",
        value: "",
      });
      this.$forceUpdate();
    },
    delItems(index, obj) {
      if (obj.length === 1) {
        return;
      }
      obj.splice(index, 1);
      this.$forceUpdate();
    },

    changeType(index, val) {
      let matchIndicators = this.getMatchIndicators(val);
      this.$set(
        this.hpaModelData.indicatorData[index],
        "targetType",
        matchIndicators.target[0].type
      );
      this.$forceUpdate();
    },
    getMatchIndicators(indicator) {
      let res;
      for (let item of this.indicators) {
        if (item.matchType == "exact") {
          if (item.match.toLowerCase() == indicator.toLowerCase()) {
            res = item;
            break;
          }
        }
        if (item.matchType == "regex") {
          let reg = new RegExp(item.match);
          if (reg.test(indicator)) {
            res = item;
            break;
          }
        }
      }
      if (!res) {
        this.$message.error(`${this.$t("deployService.hpa.tip.noIndicator")}`);
      }
      return res;
    },
    getTargetTypes(val) {
      let matchIndicator = this.getMatchIndicators(val);
      let res = {};
      matchIndicator.target.forEach((item) => {
        if (item.type.toLowerCase() == "AverageValue".toLowerCase()) {
          res[item.type] = this.$t("deployService.hpa.form.averageValue");
        }
        if (item.type.toLowerCase() == "AverageUtilization".toLowerCase()) {
          res[item.type] = this.$t("deployService.hpa.form.averageUtilization");
        }
      });
      return res;
    },
  },
};
</script>

<style scoped>
/deep/ .el-form-item__label {
  line-height: 10px;
}
</style>
