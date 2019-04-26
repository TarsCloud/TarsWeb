<template>
  <section class="container">
    <let-form inline ref="detailForm">
      <let-form-item required :label="$t('dcache.migrationMethod')">
        <let-radio-group v-model="transferData"
                         :data="migrationMethods">
        </let-radio-group>
      </let-form-item>
      <let-form-group inline label-position="top">
        <let-table ref="table" :data="servers" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('module.name')" prop="module_name">
            <template slot-scope="{row}">
              {{row.module_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.serverGroup')" prop="group_name">
            <template slot-scope="{row}">
              {{row.group_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverName')" prop="server_name">
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
  </section>
</template>

<script>
  import {transferDCache} from '@/dcache/interface.js'
  import Mixin from './mixin.js'

  export default {
    mixins: [Mixin],
    data() {
      return {
      }
    },
    methods: {
      async submitServerConfig() {
        if (this.$refs.detailForm.validate()) {
          let { servers, appName, moduleName, cache_version, groupName, srcGroupName, dstGroupName, transferData } = this;
          try {

            await transferDCache({ servers, appName, moduleName, cache_version, srcGroupName, dstGroupName, transferData });

            this.$tip.success(this.$t('dcache.operationManage.hasServerMigration'));
            this.$emit('close');

          } catch (err) {

            console.error(err);
            this.$tip.error(err.message)
          }
        }
      },
    },
    created() {
      this.getServers();
    }
  }
</script>

<style>

</style>
