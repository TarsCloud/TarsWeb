<template>
  <section class="page_operation">
    <let-button theme="primary" size="small">{{$t('cache.config.add')}}</let-button>
    <let-table :data="list" :title="$t('cache.config.tableTitle')" :empty-msg="$t('common.nodata')">
      <let-table-column title="ID" prop="id"></let-table-column>
      <let-table-column title="备注" prop="remark"></let-table-column>
      <let-table-column title="路径" prop="path"></let-table-column>
      <let-table-column title="配置项" prop="AnalyseLog"></let-table-column>
      <let-table-column title="加载生效" prop="reload"></let-table-column>
      <let-table-column title="版本" prop="period"></let-table-column>
      <let-table-column title="操作" prop="id">
        <template slot-scope="scope">
          <let-table-operation >{{$t('operate.update')}}</let-table-operation>
          <let-table-operation class="danger" >{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>
  </section>
</template>

<script>
  export default {
    data () {
      return {
        list: []
      }
    },
    async created () {
        try {
          let {configItemList} = await this.$ajax.getJSON('/server/api/cache/getConfig');
          this.list = configItemList;
        } catch (err) {
            console.error(err)
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        }
    }
  }
</script>

<style>

</style>
