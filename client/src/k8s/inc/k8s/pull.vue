<template>
  <el-card style="padding: 5px">
    <el-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :columns="2"
      class="two-columns"
    >
      <div>
        <el-form-item :label="$t('operate.pull')" itemWidth="45%" required>
          <el-select v-model="inputValue" size="small" style="width: 100%">
            <el-option v-for="item in pulls" :key="item" :value="item">{{
              item
            }}</el-option>
          </el-select>
        </el-form-item>
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
  props: ["pull", "install"],
  name: "PullK8S",
  data() {
    return {
      inputValue: this.pull,
      pulls: ["Always", "IfNotPresent", "Never"],
    };
  },
  methods: {
    // 保存 k8s
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.$emit("savePull", this.inputValue);
      }
    },
  },
};
</script>
