<template>
  <div class="operation-manage">
    <let-tabs @click="onTabClick" :active="$route.matched[1] ? $route.matched[1].path : '/operationManage/expand'">
      <let-tab-pane :tab="$t('dcache.operationManage.expand')" tabkey="/operationManage/expand"></let-tab-pane>
      <let-tab-pane :tab="$t('dcache.operationManage.shrinkage')" tabkey="/operationManage/shrinkage"></let-tab-pane>
      <let-tab-pane :tab="$t('dcache.operationManage.migration')" tabkey="/operationManage/migration"></let-tab-pane>
    </let-tabs>
    <router-view class="operation-manage-children"></router-view>
  </div>
</template>
<script>
export default{
  methods: {
    onTabClick (tabkey) {
      this.$router.replace(tabkey)
    }
  }
}
</script>
<style>
.operation-manage .let-tabs__content{
  padding-top: 20px;
}
</style>
