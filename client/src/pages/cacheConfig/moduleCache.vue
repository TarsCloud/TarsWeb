<template>
  <section class="">
    <!-- 服务列表 -->
    <let-table v-if="serverList" :data="serverList" :title="$t('serverList.title.serverList')" :empty-msg="$t('common.nodata')" ref="serverListLoading">
      <let-table-column :title="$t('serverList.table.th.service')" prop="server_name"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name" width="140px"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.ip')" width="140px">
        <template slot-scope="{row:{cache_server_type}}">
          <span v-if="cache_server_type===0">{{$t('cache.mainEngine')}}</span>
          <span v-else-if="cache_server_type===1">{{$t('cache.standByEngine')}}</span>
          <span v-else-if="cache_server_type===2">{{$t('cache.mirror')}}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.configStatus')" width="90px">
        <template slot-scope="scope">
          <span :class="scope.row.setting_state === 'active' ? 'status-active' : 'status-off'"></span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.currStatus')" width="65px">
        <template slot-scope="scope">
          <span :class="scope.row.present_state === 'active' ? 'status-active' : scope.row.present_state === 'activating' ? 'status-activating' : 'status-off'"></span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.time')">
        <template slot-scope="scope">
          <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" width="260px">
        <template slot-scope="scope">
          <let-table-operation >{{$t('operate.update')}}</let-table-operation>
          <let-table-operation >{{$t('operate.view')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>
    <let-table :data="configList" :title="$t('cache.config.tableTitle')" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('cache.config.remark')" prop="remark"></let-table-column>
      <let-table-column :title="$t('cache.config.path')" prop="path"></let-table-column>
      <let-table-column :title="$t('cache.config.item')" prop="item"></let-table-column>
      <let-table-column :title="$t('cache.config.config_value')" prop="config_value"></let-table-column>
      <let-table-column :title="$t('cache.config.modify_value')" prop="period">
        <template slot-scope="{row}">
          <let-input size="small"></let-input>
        </template>
      </let-table-column>
    </let-table>

    <!-- 查看服务列表配置-->
    <let-modal
      v-model="serverCacheVisible"
      :footShow="false"
      :closeOnClickBackdrop="true"
    ></let-modal>
  </section>
</template>
<script>
  export default {
    data () {
      return {
        moduleName: this.$route.params.treeid,
        configList: [],
        serverList: [],
        serverCacheVisible: false
      }
    },
    methods: {
      async getModuleConfig () {
        try {
          let configItemList = await this.$ajax.getJSON('/server/api/cache/getModuleConfig', {moduleName: this.moduleName});
          this.configList = configItemList;
        } catch (err) {
          console.error(err)
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        }
      },
      // 获取服务列表
      async getServerList() {
        try {
          let data = await this.$ajax.getJSON('/server/api/get_cache_server_list', {tree_node_id: this.moduleName});
          this.serverList = data;
        } catch (err) {
          console.error(err)
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        }
      },
      // 处理未发布时间显示
      handleNoPublishedTime(timeStr, noPubTip = this.$t('pub.dlg.unpublished')) {
        if (timeStr === '0000:00:00 00:00:00') {
          return noPubTip;
        }
        return timeStr;
      },
    },
    created () {
      this.getModuleConfig();
      this.getServerList();
    }
  }
</script>

<style>

</style>
