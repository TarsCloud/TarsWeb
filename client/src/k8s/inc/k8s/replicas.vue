<template>
  <el-card style="padding: 5px">
    <let-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :columns="2"
      class="two-columns"
    >
      <div>
        <let-form-item :label="$t('deployService.table.th.replicas')">
          <let-input
            size="small"
            type="number"
            :min="0"
            v-model="inputValue"
            :placeholder="$t('deployService.form.placeholder')"
            required
            :required-tip="$t('deployService.table.tips.empty')"
            :pattern-tip="$t('deployService.form.placeholder')"
          ></let-input>
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
  props: ["replicas", "install"],
  name: "Replicas",
  data() {
    return { inputValue: this.replicas };
  },
  methods: {
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.$emit("saveReplicas", this.inputValue);
      }
    },
  },
};
</script>
