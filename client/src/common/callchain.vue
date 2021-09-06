<template>
      <let-tabs activekey="$t('index.rightView.tab.averageDuration')" >
        <let-tab-pane :tab="$t('index.rightView.tab.averageDuration')" tabkey="$t('index.rightView.tab.averageDuration')">
            <homes style="margin-top:10px"></homes>
        </let-tab-pane>
        <let-tab-pane :tab="$t('index.rightView.tab.trackingNumber')" tabkey="$t('index.rightView.tab.trackingNumber')">
            <times style="margin-top:10px"></times>
        </let-tab-pane>
      </let-tabs>
</template>

<script>
import homes from "./callchain/homeMain";
import times from "./callchain/all";

export default {
  provide() {
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      isRouterAlive: true,
      activeIndex: "1",
      activeName: "first",
    };
  },
  components: {
    homes: homes,
    times: times
  },
  created() {
   
  },
  mounted() {},
  watch: {
    activeIndex: function (newVal, oldVal) {
      
    },
    $route(to, from) {},
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
    changeIndex(index) {
      this.activeIndex = index;
    },
  },
};
</script>

<style >

.el-card .el-card__body {
  padding: 0;
}
 
</style>
