<template>
  <el-card style="padding: 5px">
    <let-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :columns="2"
      class="two-columns"
    >
      <div>
        <let-form-item :label="$t('operate.jobModel')" itemWidth="45%" required>
          <let-switch size="small" v-model="inputValue">
            <span slot="open">DaemonSet</span>
            <span slot="close">StatefullSet</span>
          </let-switch>
        </let-form-item>
      </div>
    </let-form>
    <el-row type="flex" justify="end" style="margin-top:15px" v-if="!install">
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
  props: ["daemonSet", "install"],
  name: "JobModel",
  data() {
    return {
      inputValue: this.daemonSet,
    };
  },
  methods: {
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.$emit("saveJobModel", this.inputValue);
      }
    },
  },
};
</script>
