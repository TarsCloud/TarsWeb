<template>
  <div style="width: 100%">
    <div style="width: 30%; margin: 200px auto">
      <el-alert
        :title="$t('error.loadError')"
        type="error"
        :description="$t('error.errorInfo')"
        show-icon
        :closable="false"
      >
      </el-alert>
      <div style="width: 100%">
        <el-button
          type="primary"
          style="
            position: absolute;
            left: 50%;
            transform: translate(-50%, 30px);
          "
          @click="reload"
          >{{ $t("error.reload") }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {},
  methods: {
    reload() {
      parent.document.reloadFrame();
    },
  },
};
</script>

<style></style>
