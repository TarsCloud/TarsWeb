<template>
  <section class="container">
    <let-form inline ref="detailForm">
      <let-form-group  inline label-position="top">
        <let-table ref="table" :data="servers" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('module.name')" prop="module_name" >
            <template slot-scope="{row}">
              {{row.module_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.serverGroup')" prop="group_name" >
            <template slot-scope="{row}">
              {{row.group_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverName')" prop="server_name" >
            <template slot-scope="{row}">
              {{row.server_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverIp')" prop="server_ip">
            <template slot-scope="scope">
              <let-input
                size="small"
                v-model="scope.row.server_ip"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              />
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.deployArea')" prop="area">
            <template slot-scope="{row}">
              {{row.area}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.serviceType')" prop="server_type">
            <template slot-scope="{row}">
              {{mapServerType(row.server_type)}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.memorySize')" prop="memory">
            <template slot-scope="{row}">
              {{row.memory}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.shmKey')" prop="shmKey">
            <template slot-scope="scope">
              <let-input
                size="small"
                v-model="scope.row.shmKey"
                :placeholder="$t('module.shmKeyRule')"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              />
            </template>
          </let-table-column>
        </let-table>
      </let-form-group>
      <div>
        <let-button size="small" theme="primary" @click="submitServerConfig">{{$t('common.submit')}}</let-button>
      </div>
    </let-form>
    <!-- 发布日志 -->
    <let-modal
      :title="$t('publishLog.title')"
      v-model="releaseing"
      :footShow="false"
      :closeOnClickBackdrop="false"
      :width="'1000px'"
      >
      <release-progress @done-fn='releaseSuccess' v-if="releaseing" :release-id="releaseId"></release-progress>
    </let-modal>
  </section>
</template>

<script>
  import {expandModule, configTransfer} from '@/dcache/interface.js'
  import ReleaseProgress from './../components/releaseProgress.vue'
  export default {
  	components: {ReleaseProgress},
    props: {
      expandServers: {
        required: true,
        type: Array
      }
    },
    data () {
      return {
      	servers: [],
        releaseId: '',
        releaseing: false,
        abc: true
      }
    },
    computed: {
      appName () {
        return this.expandServers[0].app_name
      },
      moduleName () {
        return this.expandServers[0].module_name
      },
      cache_version () {
        return this.expandServers[0].cache_version
      },
      groupName () {
        return this.servers[0].group_name
      }

    },
    methods: {
      async submitServerConfig () {
        if (this.$refs.detailForm.validate()) {
          let {servers, appName, moduleName, cache_version} = this;
          try {

          	// 扩容取到发布 id
            let {releaseId} = await expandModule({servers, appName, moduleName, cache_version});

            // 打开日志发布 modal
            this.releaseId = releaseId;
            this.releaseing = true;
          } catch (err) {

          	console.error(err);
          	this.$tip.error(err.message)
          }
        }
      },
      getServers () {
        let servers = this.expandServers.map((item, index) => {
          let {group_name, server_name} = item;

          //  **********name1    => *******name2
          group_name = group_name.replace(/^(.*?)(\d+)$/, function () {
            return arguments[1] + (+arguments[2] + 1)
          });

          // **********name1-1   =>  8888888888name2-1
          server_name = server_name.replace(/^(.*?)(\d+)-\d+$/, function () {
            return arguments[1] + (+arguments[2] + 1) + '-' + (index + 1)
          });

          return Object.assign({}, item, {group_name, server_name, server_ip: '', shmKey: ''})
        });
        this.servers = servers;
      },

      mapServerType (key) {
        if (key === 0) return this.$t('module.mainServer');
        else if (key === 1) return this.$t('module.backServer');
        else return this.$t('module.mirror');
      },
      async releaseSuccess () {
        let {appName, moduleName, groupName} = this;
        try {
          let option = {
            appName,
            moduleName,
            type: '1',
            srcGroupName: [],
            dstGroupName: [groupName]
          }
          let rsp = await configTransfer(option);
        } catch (err) {
          console.error(err);
          this.$tip.error(err.message);
        }
        
      }
    },
    created () {
    	this.getServers();
    }
  }
</script>

<style>

</style>
