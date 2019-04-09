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
          <let-table-operation v-if="row.status === 3" @click="ensureStop(row)">{{$t('operate.stop')}}</let-table-operation>
          <let-table-operation v-if="row.status !== 3" @click="ensureDelete(row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
      <let-pagination slot="pagination" align="right"
                                        :total="total" :page="page" @change="changePage">
      </let-pagination>
    </let-table>
  </div>
</template>
<script>
import Router from 'vue-router';
import {getSwitchInfo} from '@/dcache/interface.js'
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
    },
  },
  methods: {
    /**
     * 获取 列表数据
     */
    async getSwitchInfo () {
      try {

        let { totalNum, switchRecord } = await getSwitchInfo({});
        this.list = switchRecord.map(item => {
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
  },
  created () {
    this.getSwitchInfo();
  },
}
</script>
