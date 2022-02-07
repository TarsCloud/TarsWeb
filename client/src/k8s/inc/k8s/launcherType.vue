<template>
  <el-card style="padding: 5px">
    <let-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :columns="2"
      class="two-columns"
    >
      <div>
        <let-form-item :label="$t('operate.launcherType')" itemWidth="45%">
          <el-select v-model="inputValue" size="small" style="width: 100%">
            <el-option
              v-for="item in launcherTypes"
              :key="item"
              :value="item"
              >{{ item }}</el-option
            >
          </el-select>

          <el-alert
            style="margin-top:5px;margin-bottom:5px"
            :title="$t('operate.backgroundInfo')"
            show-icon
            :closable="false"
            type="warning"
          >
          </el-alert>
          <el-alert
            :title="$t('operate.foregroundInfo')"
            show-icon
            :closable="false"
            type="warning"
          >
          </el-alert>
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
  props: ["launcherType", "install"],
  name: "LauncherType",
  data() {
    return {
      inputValue: this.launcherType,
      launcherTypes: ["background", "foreground"],
    };
  },
  methods: {
    // 保存 k8s
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.$emit("saveLauncherType", this.inputValue);
      }
    },
  },
};
</script>
