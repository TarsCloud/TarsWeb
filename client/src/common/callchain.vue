<template>
  <el-tabs v-model="activeName">
    <el-tab-pane
      :label="$t('index.rightView.tab.averageDuration')"
      name="first"
    >
      <homes></homes>
    </el-tab-pane>
    <el-tab-pane
      :label="$t('index.rightView.tab.trackingNumber')"
      name="second"
    >
      <times></times>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import homes from "./callchain/homeMain"; //平均时长
import times from "./callchain/all"; //调用链明细

export default {
  data() {
    return {
      activeName: "first",
    };
  },
  components: {
    homes: homes,
    times: times,
  },
};
</script>
<style>
.el-card .el-card__body {
  padding: 0;
}
</style>
