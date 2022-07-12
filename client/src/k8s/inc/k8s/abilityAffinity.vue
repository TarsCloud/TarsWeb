<template>
  <el-card style="padding: 5px" v-if="k8sModelData">
    <el-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :model="this"
      :columns="2"
      class="two-columns"
    >
      <!--nodeSelect 节点选择-->
      <div>
        <el-form-item
          :label="$t('deployService.form.affinity')"
          itemWidth="100%"
        >
          <el-select
            v-model="k8sModelData.abilityAffinity"
            size="small"
            style="width: 100%"
          >
            <el-option
              v-for="item in abilityAffinities"
              :key="item"
              :value="item"
              >{{ item }}</el-option
            >
          </el-select>

          <el-alert size="small" type="warning" style="margin: 5px"
            >AppRequired:在满足其他条件后,节点必须有tars.io/ability.${namespace}.${App}
            标签</el-alert
          >
          <el-alert type="warning" style="margin: 5px"
            >ServerRequired:
            在满足其他条件后,节点必须有tars.io/ability.${namespace}.${App}-${Server}
            标签</el-alert
          >
          <el-alert type="warning" style="margin: 5px"
            >AppOrServerPreferred:
            在满足其他条件后,优先选择有tars.io/ability.${namespace}.${App}-${Server},
            tars.io/ability.${namespace}.${App} 标签的节点</el-alert
          >
          <el-alert type="warning" style="margin: 5px"
            >None: 不对节点标签做要求</el-alert
          >
        </el-form-item>
        <el-form-item itemWidth="45%" v-if="labelMatchArrData.length == 0">
          <el-button
            type="text"
            size="mini"
            @click="addItems(0, labelMatchArrData)"
            style="margin-left: 20px"
          >
            {{ $t("deployService.form.labelMatch.addLabel") }}
          </el-button>
        </el-form-item>

        <!--labelMatch 标签-->
        <div v-for="(item, index) in labelMatchArrData" :key="index">
          <el-form-item
            :label="$t('deployService.table.th.label')"
            itemWidth="30%"
          >
            <el-input
              size="small"
              v-model="item.key"
              :placeholder="$t('deployService.table.th.label')"
              :pattern-tip="$t('deployService.form.labelMatch.labelValid')"
            ></el-input>
          </el-form-item>
          <el-form-item label="operator" itemWidth="15%">
            <el-select
              v-model="item.operator"
              size="small"
              @change="changeLabelOperator"
            >
              <el-option
                v-for="item in LabelMatchOperator"
                :key="item"
                :value="item"
                >{{ item }}</el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('deployService.table.th.value')"
            itemWidth="40%"
          >
            <el-select
              :disabled="item.disableValue"
              style="width: 95%"
              v-model="item.values"
              multiple
              filterable
              allow-create
              :multiple-limit="63"
              default-first-option
              :placeholder="$t('deployService.form.labelMatch.labelValue')"
              size="small"
              @change="
                (val) => {
                  addLabelValues(val, index);
                }
              "
            >
              <el-option
                v-for="item in item.values"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            circle
            @click="addItems(index, labelMatchArrData)"
          ></el-button>
          <el-button
            type="danger"
            icon="el-icon-minus"
            size="mini"
            circle
            @click="delItems(index, labelMatchArrData)"
          ></el-button>
        </div>
      </div>
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
  props: ["k8sModel", "labelMatchArr", "LabelMatchOperator", "install"],
  name: "AbilityAffinity",
  data() {
    return {
      k8sModelData: null,
      abilityAffinities: [
        "AppRequired",
        "ServerRequired",
        "AppOrServerPreferred",
        "None",
      ],
    };
  },
  mounted() {
    this.k8sModelData = this.k8sModel;
    this.labelMatchArrData = this.labelMatchArr;
  },
  methods: {
    changeKind() {
      this.$forceUpdate();
    },
    adapterServerK8S(model) {
      let data = Object.assign({}, model);
      let labelMatchArrData = this.labelMatchArrData.map((item) => {
        return { key: item.key, operator: item.operator, values: item.values };
      });
      // delete data.NodeSelector.nodeBind;
      data.NodeSelector = labelMatchArrData;
      return data;
    },
    // 保存 k8s
    save() {
      if (this.$refs.k8sDetailForm.validate() && this.validateLabels()) {
        let data = this.adapterServerK8S(this.k8sModelData);

        this.$emit("saveAffinity", data);
      }
    },
    validateLabels(data) {
      let flag = true;
      // if (data.NodeSelector.Kind === "LabelMatch") {
      for (let item of this.labelMatchArrData) {
        if (item.key.trim() == "") {
          this.$message.error(
            `${this.$t("deployService.form.labelMatch.errorKey")}`
          );
          flag = false;
          break;
        }
        if (
          "Exists,DoesNotExist".indexOf(item.operator) == -1 &&
          item.values.length == 0
        ) {
          this.$message.error(
            `${this.$t("deployService.form.labelMatch.errorValue")}`
          );
          flag = false;
          break;
        }
      }
      return flag;
      // } else {
      //   return true;
      // }
    },
    addLabelValues(val, index) {
      let reg = /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]?$/;
      this.labelMatchArrData[index].values.forEach((item, index) => {
        if (!reg.test(item)) {
          this.labelMatchArrData[index].values.splice(index, 1);
          this.$message.error(
            `${this.$t("deployService.form.labelMatch.labelValueValid")}`
          );
        }
      });
    },
    changeLabelOperator(val) {
      this.labelMatchArrData.forEach((item) => {
        if (item.operator == "Exists" || item.operator == "DoesNotExist") {
          this.$set(item, "disableValue", true);
          this.$set(item, "values", []);
        } else {
          this.$set(item, "disableValue", false);
        }
      });
    },
    addItems(index, obj) {
      if (obj.length >= 63) {
        this.$message.error(
          `${this.$t("deployService.form.labelMatch.labelMax")}`
        );
        return;
      }
      obj.splice(index + 1, 0, { key: "", operator: "In", values: [] });
      this.$forceUpdate();
    },
    delItems(index, obj) {
      obj.splice(index, 1);
      this.$forceUpdate();
    },
  },
};
</script>
