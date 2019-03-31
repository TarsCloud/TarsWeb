<template>
  <div>
    <let-table :data="showList" :empty-msg="$t('common.nodata')" ref="pageTable">
      <let-table-column :title="$t('dcache.operationManage.appName')"  prop="appName"></let-table-column>
      <let-table-column :title="$t('dcache.operationManage.moduleName')"  prop="moduleName"></let-table-column>
      <let-table-column :title="$t('dcache.operationManage.srcGroupName')"  prop="srcGroupName"></let-table-column>
      <let-table-column :title="$t('dcache.operationManage.dstGroupName')"  prop="dstGroupName"></let-table-column>
      <let-table-column :title="$t('dcache.operationManage.status')"  prop="sgtatus">
        <template slot-scope="{row}">
          {{$t(row.statusText)}}
        </template>
      </let-table-column>
      <let-table-column :title="$t('dcache.operationManage.beginTime')"  prop="beginTime"></let-table-column>
      <let-table-column :title="$t('dcache.operationManage.progress')"  prop="progress">
        <template slot-scope="{row}">
          {{row.progressText}}
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')"  prop="appName" width="100px">
        <template slot-scope="{row}" >
          <let-table-operation @click="ensureStop(row)">{{$t('operate.stop')}}</let-table-operation>
          <let-table-operation @click="ensureDelete(row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
      <let-pagination slot="pagination" align="right"
                                        :total="total" :page="page" @change="changePage">
      </let-pagination>
    </let-table>
  </div>
</template>
<script>
import { getRouterChange } from '@/dcache/interface.js'
export default {
  data () {
    return {
      list: [],
      total: 0,
      page: 1,
    }
  },
  computed: {
    showList () {
      let {page, list} = this;
      return list.slice((page -1 ) * 10, page * 10);
    }
  },
  methods: {
    /**
     * 获取 列表数据
     */
    async getRouterChange () {
      try {

        let { totalNum, transferRecord } = await getRouterChange({type: '2'});
        this.list = transferRecord.map(item => {
          //  status: "0"-新增迁移任务，"1"-配置阶段完成，"2"-发布完成，"3"-正在迁移，"4"-完成，5""-停止
          item.statusText = 'dcache.operationManage.statusText.' + item.status;
          item.progressText = item.progress + '%';
          return item;
        });
        this.total = Math.ceil(totalNum/10);
      } catch (err) {

        console.error(err);
        this.$tip.error(err.message);
      }
    },
    /**
     * 改变页数
     * @page
     */
    changePage (page) {
      this.page = page;
    },
    /**
    * 确认停止
    */
    async ensureStop (row) {
      try {
        await this.$confirm(this.$t('dcache.operationManage.ensureStop'));
        console.log('ensure stop', row)
      } catch (err) {
        console.error(err)
      }
    },
    /**
    * 确认删除
    */
    async ensureDelete (row) {
      try {
        await this.$confirm(this.$t('dcache.operationManage.ensureDelete'));
        console.log('ensure delete', row)
      } catch (err) {
        console.error(err)
      }
    },
  },
  created () {
    this.getRouterChange();
  }
}
</script>
