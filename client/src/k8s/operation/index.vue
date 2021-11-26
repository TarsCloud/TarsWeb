<template>
  <div class="page_operation">
    <let-tabs @click="onTabClick" :activekey="$route.path">
      <let-tab-pane :tab="$t('deployService.title.deploy')" tabkey="/operation/deploy"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.approval')" tabkey="/operation/approval"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.history')" tabkey="/operation/history"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.undeploy')" tabkey="/operation/undeploy"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.template')" tabkey="/operation/templates"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.business')" tabkey="/operation/business"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.application')" tabkey="/operation/application"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.node')" tabkey="/operation/node"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.event')" tabkey="/operation/event"></let-tab-pane>
<!--      <let-tab-pane :tab="$t('deployService.title.affinity')" tabkey="/operation/affinity"></let-tab-pane>-->
      <let-tab-pane :tab="$t('deployService.title.image')" tabkey="/operation/image"></let-tab-pane>

    </let-tabs>

    <router-view class="page_operation_children"></router-view>

  </div>
</template>

<script>
let oldPath = '/operation/deploy';

export default {
  name: 'Operation',

  data() {
    return {
      // treeData: [],
    }
  },

  beforeRouteEnter(to, from, next) {
    if (to.path === '/operation') {
      next(oldPath);
    } else {
      next();
    }
  },

  beforeRouteLeave(to, from, next) {
    oldPath = from.path;
    next();
  },
  mounted() {
    // this.loadData()
  },
  methods: {
    // loadData() {
    //   this.treeData = operationTree || []
    // },
    selectTree(nodeKey) {
      // console.log('selectTree', nodeKey);

      if (this.$route.path === '/operation') {
        this.$router.push(oldPath);
      } else {
        this.$router.push({
          params: {
            treeid: nodeKey,
          }
        });
      }
    },
    onTabClick(tabkey) {
      this.$router.replace(tabkey);
    },
    // clickEvent(tabkey) {
    //   this.$router.replace(tabkey);
    // },
  },
};
</script>


<style>
.page_operation {
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow: hidden;
  padding-top: 30px;
  padding-bottom: 20px;
  width: 100%;

  &_children {
    display: flex;
    flex: 1;
    flex-flow: column;
    margin-top: 20px;
    overflow: auto;
    padding:0 40px 20px 0;
    position: relative;
  }
  &_children::-webkit-scrollbar{border-radius:10px;}
}
</style>
