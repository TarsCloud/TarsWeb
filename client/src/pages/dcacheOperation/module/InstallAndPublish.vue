<template>
  <section class="page_operation_install_and_publish">
    <let-form label-position="top" ref="detailForm">
      <let-form-group :title="$t('common.baseInfo')" inline label-position="top">
        <let-form-item :label="$t('module.moduleId')" itemWidth="240px" required>
          {{moduleData.module_id}}
        </let-form-item>
        <let-form-item :label="$t('module.name')" itemWidth="240px" required>
          {{moduleData.module_name}}
        </let-form-item>
        <let-form-item :label="$t('module.cacheType')" itemWidth="240px" required>
          {{mapCacheType(moduleData.ModuleBase)}}
        </let-form-item>
        <let-form-item :label="$t('module.follower')" itemWidth="240px">
          {{moduleData.ModuleBase && moduleData.ModuleBase.follower}}
        </let-form-item>
      </let-form-group>

      <let-form-group :title="$t('module.moduleInfo')" inline label-position="top">
        <let-form-item :label="$t('module.deployArea')" itemWidth="240px">
          {{moduleData.idc_area}}
        </let-form-item>
        <!-- <let-form-item :label="$t('module.keyType')" itemWidth="240px" required>
          {{moduleData.key_type}}
        </let-form-item> -->
        <let-form-item :label="$t('region.setArea')" itemWidth="240px">
          {{moduleData.set_area && moduleData.set_area.join(',')}}
        </let-form-item>
        <let-form-item :label="$t('module.scenario')" itemWidth="240px" required>
          {{mapModuleType(moduleData.cache_module_type)}}
        </let-form-item>
        <let-form-item :label="$t('cache.perRecordAvg')" itemWidth="240px" required>
          {{moduleData.per_record_avg}}
        </let-form-item>
        <let-form-item :label="$t('cache.maxReadFlow')" itemWidth="240px" required>
          {{moduleData.max_read_flow}}
        </let-form-item>
        <let-form-item :label="$t('cache.totalRecord')" itemWidth="240px" required>
          {{moduleData.total_record}}
        </let-form-item>
        <let-form-item :label="$t('cache.maxWriteFlow')" itemWidth="240px" required>
          {{moduleData.max_write_flow}}
        </let-form-item>
        <let-form-item :label="$t('cache.moduleRemark')" itemWidth="240px" required>
          {{moduleData.module_remark}}
        </let-form-item>
      </let-form-group>

      <let-form-group :title="$t('module.serverInfo')" inline label-position="top">
        <let-table ref="table" :data="moduleData.ServerConf" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('module.name')" prop="module_name" width="25%">
            <template slot-scope="scope">
              {{scope.row.module_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.serverGroup')" prop="group_name" width="25%">
            <template slot-scope="scope">
              {{scope.row.group_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverName')" prop="server_name">
            <template slot-scope="scope">
              {{scope.row.server_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverIp')" prop="server_ip">
            <template slot-scope="scope">
              {{scope.row.server_ip}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.deployArea')" prop="area">
            <template slot-scope="scope">
              {{scope.row.area}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.serviceType')" prop="server_type">
            <template slot-scope="scope">
              {{mapServerType(scope.row.server_type)}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.memorySize')" prop="memory">
            <template slot-scope="scope">
              {{scope.row.memory}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.shmKey')" prop="shmKey">
            <template slot-scope="scope">
              {{scope.row.shmKey}}
            </template>
          </let-table-column>
        </let-table>
      </let-form-group>
      <let-button size="small" theme="primary" @click="installAndPublish">{{$t('apply.installAndPublish')}}
      </let-button>
    </let-form>
    <let-modal :title="$t('publishLog.title')" v-model="showModal" width="800px" @on-confirm="confirmPublish">
      <let-table ref="ProgressTable" :data="releaseProgress" :empty-msg="$t('common.nodata')">
        <let-table-column :title="$t('service.serverName')" prop="serverName" width="30%"></let-table-column>
        <let-table-column :title="$t('service.serverIp')" prop="nodeName" width="30%"></let-table-column>
        <let-table-column :title="$t('publishLog.releaseId')" prop="releaseId" width="15%"></let-table-column>
        <let-table-column :title="$t('publishLog.releaseProgress')" prop="percent">
          <template slot-scope="scope">
            <span>{{scope.row.percent}}</span>
            <icon v-if="scope.row.percent != 100" name="spinner" />
          </template>
        </let-table-column>
      </let-table>
    </let-modal>
  </section>
</template>

<script>
  import '@/assets/icon/spinner.svg';

  export default {
    data () {
      let {moduleId} = this.$route.params;
      return {
        moduleId,
        moduleData: {},
        releaseProgress: [],
        showModal: false,
        timerId: null
      }
    },
    methods: {
      getModuleFullInfo () {
        let {moduleId} = this;
        this.$ajax.getJSON('/server/api/get_module_full_info', {moduleId}).then((data) => {
          this.moduleData = data || {};
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      installAndPublish () {
        let {moduleId} = this;
        let mkCache = sessionStorage.getItem('mkCache');
        this.$ajax.getJSON('/server/api/module_install_and_publish', {moduleId, mkCache}).then(response => {
          let releaseId = response.releaseRsp.releaseId;
          this.getTaskRepeat({releaseId});
          this.$tip.success(response.releaseRsp.errMsg)
        }).catch(err => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      getTaskRepeat({releaseId}) {
        clearTimeout(this.timerId);
        this.showModal = true;
        const getTask = () => {
          this.$ajax.getJSON('/server/api/get_module_release_progress', {releaseId}).then((data) => {
            let done = true;
            data.progress.forEach((item) => {
              if (parseInt(item.percent, 10) !== 100) {
                done = false;
              }
            });
            if (done) {
              clearTimeout(this.timerId);
            } else {
              this.timerId = setTimeout(getTask, 1000);
            }
            this.releaseProgress = data.progress;
          }).catch((err) => {
            clearTimeout(this.timerId);
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        };
        getTask();
      },
      getReleaseProgress (releaseId) {
        this.$ajax.getJSON('/server/api/get_module_release_progress', {releaseId}).then(data => {
          console.log(data);
          this.showModal = true;
          this.releaseProgress = data.progress;
        }).catch(err => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      mapServerType (key) {
        if (key === 0) return this.$t('module.mainServer');
        else if (key === 1) return this.$t('module.backServer');
        else return this.$t('module.mirror');
      },
      mapModuleType (key) {
        return key === 1 ? this.$t('cache.title') : this.$t('cache.cachePersistent');
      },
      mapCacheType (base) {
        if (!base) {
          return null;
        } else if (base.cache_version === 1) {
          return 'key-value(KVCache)';
        } else {
          switch (base.mkcache_struct) {
            case 1:
              return 'k-k-row(MKVCache)';
              break;
            case 2:
              return 'Set(MKVCache)';
              break;
            case 3:
              return 'List(MKVCache)';
              break;
            case 4:
              return 'Zset(MKVCache)';
              break;
            default:
              return null;
              break;
          }
        }
      },
      confirmPublish () {
        this.showModal = false;
        document.body.classList.remove('has-modal-open')
        this.$router.push('/server');
        if (window.dcacheIndex && window.dcacheIndex.getTreeData) {
          window.dcacheIndex.getTreeData()
        }
      }
    },
    beforeRouteLeave (to, from, next) {
      // 导航离开该组件的对应路由时调用
      // 可以访问组件实例 `this`
      clearTimeout(this.timerId);
      next()
    },
    created () {
      this.getModuleFullInfo()
    }
  }
</script>

<style lang="postcss">
  .icon {
    color: #fff;
    height: 17px;
    width: 17px;
    margin-left: 20px;
  }
</style>
