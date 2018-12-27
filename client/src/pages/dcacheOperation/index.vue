<template>
  <div class="page_operation">
    <let-tabs @click="onTabClick" :activekey="$route.matched[1]? $route.matched[1].path : '/operation/apply'">
      <let-tab-pane :tab="$t('apply.title')" tabkey="/operation/apply"></let-tab-pane>
      <let-tab-pane :tab="$t('module.title')" tabkey="/operation/module"></let-tab-pane>
      <let-tab-pane :tab="$t('region.title')" tabkey="/operation/region"></let-tab-pane>
    </let-tabs>

    <router-view class="page_operation_children"></router-view>
  </div>
</template>

<script>

export default {
  name: 'Oparetion',
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
