<template>
  <div class="page_operation">
    <let-tabs @click="onTabClick" :activekey="$route.path">
      <let-tab-pane tab="部署服务" tabkey="/operation/deploy"></let-tab-pane>
      <let-tab-pane tab="扩容" tabkey="/operation/expand"></let-tab-pane>
      <let-tab-pane tab="模板管理" tabkey="/operation/templates"></let-tab-pane>
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
