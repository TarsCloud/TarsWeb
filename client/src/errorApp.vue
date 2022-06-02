<template>
  <div style="width:100%; ">
    <div style="width:30%; margin:200px auto ">
      <el-alert
        title="加载错误!"
        type="error"
        description="加载服务市场错误, 请检查网络连接是否正常"
        show-icon
        :closable="false"
      >
      </el-alert>
      <div style="width:100%">
        <el-button
          type="primary"
          style="position: absolute; left: 50%; transform: translate(-50%, 30px);"
          @click="reload"
          >重新加载</el-button
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
