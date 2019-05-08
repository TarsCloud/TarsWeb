<template>
  <section style="display: inline">
    <let-button theme="primary" :disabled="disabled" @click="init">{{$t('dcache.offline')}}</let-button>
    <let-modal
      v-model="show"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t('dcache.offline')"
    >
      <p style="color: red">{{$t(tip)}}</p>
      <let-table ref="table" :data="offlineServers" :empty-msg="$t('common.nodata')">
        <!-- 模块名 -->
        <let-table-column :title="$t('module.name')" prop="module_name"></let-table-column>
        <let-table-column :title="$t('service.serverName')" prop="server_name"></let-table-column>
        <let-table-column :title="$t('service.serverIp')" prop="node_name"></let-table-column>
      </let-table>
      <let-button :disabled="!offlineServers.length" size="small" theme="primary" @click="sureOffline">{{$t('dcache.sureOffline')}}</let-button>
    </let-modal>
  </section>
</template>
<script>
  import { uninstall4DCache } from '@/dcache/interface.js'
  export default {
    props: {
      disabled: Boolean,
      serverList: Array
    },
    data() {
      return {
        show: false,
        offlineServers: [],
        tip: '',
        unType: 0
      }
    },
    computed: {
      checkedServers() {
        return this.serverList.filter(item => item.isChecked === true);
      },
      activeServers() {
        return this.checkedServers.filter(server => server.present_state === 'active' || server.setting_state === 'active')
      },
      // 选中的主机服务
      hostServers() {
        return this.checkedServers.filter(item => item.server_type === 0);
      },
      // 选中的备机服务
      backupServers() {
        return this.checkedServers.filter(item => item.server_type === 1);
      },
      allBackupServers() {
        return this.serverList.filter(item => item.server_type === 1);
      },
      // 选中的镜像服务
      mirrorServers() {
        return this.checkedServers.filter(item => item.server_type === 2);
      },
      allMirrorServers() {
        return this.serverList.filter(item => item.server_type === 2);
      },
      // 所有备机和镜像
      allBackupMirrorServers() {
        return this.serverList.filter(item => item.server_type !== 0);
      }

    },
    methods: {
      init() {
        this.offlineServers = [];
        this.unType = 0;
        const { activeServers, $t, hostServers, backupServers, allBackupServers, mirrorServers, allMirrorServers, allBackupMirrorServers } = this;


        // 选中的服务中，有存活的服务，请先停止， 再下线
        if (activeServers.length) return this.$tip.error($t('dcache.cantOffline'));

        if (hostServers.length) {
          // 选中的服务有主机， 下线该模块所有的服务
          this.tip = 'dcache.hostOfflineAllServers';
          this.offlineServers = this.serverList;
          this.unType = 2;
        } else {
          if (backupServers.length) {
            // 选中的服务有备机， 下线该模块所有的备机服务
            this.tip = 'dcache.offlineAllBackupServers';
            this.offlineServers = this.allBackupServers;
          } else if (mirrorServers.length) {
            // 选中的服务有镜像， 下线该模块所有的镜像服务
            this.tip = 'dcache.offlineMirrorServers';
            this.offlineServers = this.allMirrorServers;
          } else if (backupServers.length && mirrorServers.length) {
            // 选中的服务有备机和镜像，将下线该模块所有的备机和镜像服务
            this.tip = 'dcache.offlineBackupMirrorServers';
            this.offlineServers = this.allBackupMirrorServers;
          }
        }
        this.show = true;
      },
      async sureOffline() {
        const { offlineServers, unType } = this;
        const serverNames = offlineServers.map(server => `DCache.${server.server_name}`);
        const appName = offlineServers[0].app_name;
        const moduleName = offlineServers[0].module_name;
        const option = { unType, appName, moduleName, serverNames };
        let loading = this.$Loading({
          text: 'loading...'
        });
        loading.show();
        try {
          const data = await uninstall4DCache(option);
          this.$tip.success('下线成功!');
          this.show = false;
          this.$emit('success-fn');
        } catch(err) {
          this.$tip.error(err.message)
        } finally {
          loading.hide();
        }
      },
    }
  }
</script>
<style>

</style>
