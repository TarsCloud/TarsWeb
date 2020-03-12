<template>
  <div class="page_operation">
    <let-tabs @click="onTabClick" :activekey="$route.path">
      <let-tab-pane :tab="$t('deployService.title.deploy')" tabkey="/operation/deploy"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.expand')" tabkey="/operation/expand"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.template')" tabkey="/operation/templates"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.nodes')" tabkey="/operation/nodes"></let-tab-pane>
      <let-tab-pane :tab="$t('deployService.title.check')" tabkey="/operation/check"></let-tab-pane>
    </let-tabs>

    <router-view class="page_operation_children"></router-view>
  </div>
</template>

<script>
let oldPath = '/operation/deploy';

export default {
  name: 'Oparetion',

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

  methods: {
    onTabClick(tabkey) {
      this.$router.replace(tabkey);
    },
  },
};
</script>

<style>
.page_operation {
  padding-top: 30px;
  padding-bottom: 40px;

  &_children {
    padding: 20px 0;
  }
}
</style>
