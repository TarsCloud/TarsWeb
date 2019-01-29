<template>
  <section class="">
    <!-- 服务列表 -->
    <let-table v-if="serverList" :data="serverList" :title="$t('serverList.title.serverList')"
               :empty-msg="$t('common.nodata')" ref="serverListLoading">
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
          <span
            :class="scope.row.present_state === 'active' ? 'status-active' : scope.row.present_state === 'activating' ? 'status-activating' : 'status-off'"></span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.time')">
        <template slot-scope="scope">
          <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" width="260px">
        <template slot-scope="{row}">
          <let-table-operation @click="editServerConfig(row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="checkServerConfigList(row)">{{$t('operate.view')}}</let-table-operation>
          <let-table-operation @click="addServerConfig(row)">{{$t('operate.add')}}</let-table-operation>
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
          <let-input size="small" v-model="row.modify_value"></let-input>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" >
        <template slot-scope="{row}">
          <let-table-operation @click="saveConfig(row)">{{$t('operate.save')}}</let-table-operation>
          <let-table-operation @click="deleteConfig(row)" class="danger">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <!-- 查看服务列表配置-->
    <let-modal
      v-model="serverConfigListVisible"
      :footShow="false"
      :closeOnClickBackdrop="true"
      width="80%"
      height="80%"
      :title="$t('cache.config.tableTitle')"
      class="server_config_list_modal"
    >
      <server-config-list v-if="serverConfigListVisible" :moduleName="moduleName" v-bind="checkServer"></server-config-list>
    </let-modal>

    <!-- 修改服务配置-->
    <let-modal
      v-model="serverConfigVisible"
      :footShow="false"
      :closeOnClickBackdrop="true"
      width="80%"
      height="80%"
      :title="$t('cache.config.tableTitle')"
      class="server_config_list_modal"
    >
      <server-config v-if="serverConfigVisible" v-bind="checkServer"></server-config>
    </let-modal>

    <!-- 添加服务配置-->
    <let-modal
      v-model="addServerConfigVisible"
      :footShow="false"
      :closeOnClickBackdrop="true"
    >
      <add-server-config v-if="addServerConfigVisible" v-bind="checkServer"></add-server-config>
    </let-modal>

  </section>
</template>
<script>
  import ServerConfigList from './ServerConfigList.vue'
  import ServerConfig from './ServerConfig.vue'
  import addServerConfig from './addServerConfig.vue'
  export default {
    components: {
      ServerConfigList,
      ServerConfig,
      addServerConfig
    },
    data () {
      return {
        moduleName: this.$route.params.treeid,
        configList: [],
        serverList: [],
        serverConfigListVisible: false,
        serverConfigVisible: false,
        addServerConfigVisible: false,
        checkServer: {}
      }
    },
    methods: {
      async getModuleConfig () {
        try {
          let configItemList = await this.$ajax.getJSON('/server/api/cache/getModuleConfig', {moduleName: this.moduleName});
          // 添加被修改的空值
          configItemList.forEach(item => item.modify_value="");
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
      async saveConfig (row) {
        console.log(row);
        let {id, modify_value} = row;
        try {
          let configItemList = await this.$ajax.getJSON('/server/api/cache/updateServerConfigItem', {id, configValue: modify_value});
          await this.getModuleConfig();
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
      checkServerConfigList (row) {
        this.serverConfigListVisible = true;
        this.checkServer = {
          serverName: row.server_name,
          nodeName: row.node_name
        }
      },
      editServerConfig(row) {
        this.serverConfigVisible = true;
        this.checkServer = {
          serverName: row.server_name,
          nodeName: row.node_name
        }
      },
      addServerConfig(row) {
        this.addServerConfigVisible = true;
        this.checkServer = {
          serverName: row.server_name,
          nodeName: row.node_name
        }
      },

    },
    created () {
      this.getModuleConfig();
      this.getServerList();
    }
  }
</script>

<style>
.server_config_list_modal .let_modal__body{
  max-height: 500px;
  overflow-y: auto;
  margin-top: 20px;
}
</style>
