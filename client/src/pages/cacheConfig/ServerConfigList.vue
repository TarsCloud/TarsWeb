<template>
  <section>
    <let-table :data="configList" :title="$t('cache.config.tableTitle')" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('cache.config.remark')" prop="remark"></let-table-column>
      <let-table-column :title="$t('cache.config.path')" prop="path"></let-table-column>
      <let-table-column :title="$t('cache.config.item')" prop="item"></let-table-column>
      <let-table-column :title="$t('cache.config.config_value')" prop="config_value"></let-table-column>
    </let-table>
  </section>
</template>

<script>
  export default {
    data () {
      return {
        configList: []
      }
    },
    created () {

    }
  }
</script>

<style>

</style>
