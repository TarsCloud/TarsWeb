<template>
  <section style="display: inline" class="batch-publish">
    <let-button theme="primary" :disabled="disabled" @click="init">{{$t('dcache.batchPublish')}}</let-button>
    <let-modal
      v-model="show"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t('dcache.batchPublish')"
    >
      <let-form>
        <let-form-item :label="$t('service.serverName')">
          <p v-for="server in checkedServers">{{ server.server_name }}</p>
        </let-form-item>
      </let-form>
      <let-table :data="versionList" :empty-msg="$t('common.nodata')">
        <let-table-column>
          <template slot-scope="scope">
            <let-radio v-model="publishId" :label="scope.row.id">&nbsp;</let-radio>
          </template>
        </let-table-column>
        <let-table-column title="ID" prop="id">
          <template slot-scope="scope">
            {{scope.row.id}}
            <span :title="$t('releasePackage.default')"
                  style="color: green; display: inline-block;width:1em;height:1em;">
                        <icon v-if="scope.row.default_version == 1" name="default"/>
                      </span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('releasePackage.moduleName')" prop="server"></let-table-column>
        <let-table-column :title="$t('releasePackage.cacheType')">
          <template slot-scope="scope">
            <span>{{scope.row.package_type === 1 ? "KVcache" : "MKVcache"}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.servant.comment')" prop="comment"></let-table-column>
        <let-table-column :title="$t('releasePackage.uploadTime')" prop="posttime"></let-table-column>
        <let-pagination slot="pagination" align="right"
                        :total="publishModal.totalPatchPage" :page="publishModal.currPage"
                        @change="patchChangePage">
          abc
        </let-pagination>
        <template slot="operations">
          <let-button :disabled="!publishId" theme="primary" @click="publish">{{$t('apply.publish')}}</let-button>
        </template>
      </let-table>
    </let-modal>
    <let-modal
      v-model="releaseId"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t('dcache.batchPublish')"
    >
      <release-progress v-if="!!releaseId" :release-id="releaseId"></release-progress>
    </let-modal>
  </section>
</template>
<script>
  import { serverPatchList, addTask } from '@/dcache/interface.js'
  import ReleaseProgress from './../components/releaseProgress.vue'
  import Mixin from './mixin.js'

  export default {
    components: { ReleaseProgress },
    mixins: [Mixin],
    props: {
      disabled: Boolean,
      expandServers: {
        required: false,
        type: Array
      },
      checkedServers: {
        required: false,
        type: Array
      },
    },
    computed: {
      cacheVersion() {
        return this.checkedServers.length ? this.checkedServers[0].cache_version : 1;
      }
    },
    data() {
      return {
        versionList: [],
        releaseId: null,
        show: false,
        publishId: null, //发布包id
        publishModal: {
          moduleName: 'DCacheServerGroup',
          application: 'DCache',
          totalPatchPage: 0,
          pageSize: 5,
          currPage: 1,
        },
      }
    },
    methods: {
      init() {
        this.show = true;
        this.releaseId = null;
        this.publishId = null;
        this.getVersionList();
      },
      patchChangePage(page) {
        this.publishModal.currPage = page;
        this.getVersionList();
      },
      async getVersionList() {
        const { cacheVersion, publishModal } = this;
        const { moduleName, application, currPage, pageSize } = publishModal;
        let { count, rows } = await serverPatchList({ moduleName, application, currPage, pageSize, cacheVersion });
        this.publishModal.totalPatchPage = Math.ceil(count / pageSize);
        this.versionList = rows;
      },
      async publish() {
        const items = [];
        const { publishId, checkedServers } = this;
        checkedServers.forEach((item) => {
          items.push({
            server_id: item.id.toString(),
            command: 'patch_tars',
            parameters: {
              patch_id: publishId,
              bak_flag: item.bak_flag,
              update_text: 'batch publish cache servers',
              group_name: 'DCacheServerGroup',
            },
          });
        });
        console.log(items);

        const releaseId = await addTask({ items });
        console.log(releaseId);
        this.releaseId = releaseId;

      },
    }
  }
</script>
<style lang="postcss">
  .let-table .let-form {
    background-color: white;
  }
</style>
