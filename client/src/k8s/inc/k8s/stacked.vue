<template>
  <el-card style="padding: 5px">
    <let-form
      ref="k8sDetailForm"
      itemWidth="360px"
      :columns="2"
      class="two-columns"
    >
      <div>
        <let-form-item :label="$t('operate.stacked')" itemWidth="60%">
          <let-switch size="small" v-model="inputValue">
            <span slot="open">ON</span>
            <span slot="close">OFF</span>
          </let-switch>

          <el-alert
            style="margin-top:5px;margin-bottom:5px"
            :title="$t('operate.stackedInvalid')"
            show-icon
            :closable="false"
            type="warning"
          >
          </el-alert>

          <el-alert
            :title="$t('operate.stackedInfo')"
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
  props: ["notStacked", "install"],
  name: "stacked",
  data() {
    return {
      inputValue: !this.notStacked,
    };
  },
  methods: {
    // 保存 k8s
    save() {
      if (this.$refs.k8sDetailForm.validate()) {
        this.$emit("saveStacked", !this.inputValue);
      }
    },
  },
};
</script>
