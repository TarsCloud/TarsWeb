<template>
  <section class="page_operation_create_service">
    <let-form inline ref="detailForm">
      <let-form-group :title="$t('module.serverInfo')" inline label-position="top">
        <let-table ref="table" :data="moduleData" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('module.name')" prop="module_name" width="20%">
            <template slot-scope="scope">
              {{scope.row.module_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('module.serverGroup')" prop="group_name" width="15%">
            <template slot-scope="scope">
              {{scope.row.group_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.serverName')" prop="server_name" width="20%">
            <template slot-scope="scope">
              {{scope.row.server_name}}
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
        <let-button size="small" theme="primary" @click="submitServerConfig">{{$t('common.nextStep')}}</let-button>
      </div>
    </let-form>

    <let-modal :title="$t('module.MultiKeyConfig')" v-model="showMKModal" width="1000px" @on-confirm="submitMKCache">
      <let-form label-position="top" ref="multiKeyForm">
        <let-form-group :title="$t('MKCache.mainKey')" inline label-position="top">
          <let-table ref="mainKey" :data="mkCacheStructure.mainKey" :empty-msg="$t('common.nodata')">
            <let-table-column :title="$t('MKCache.fieldName')" prop="fieldName" width="30%">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.fieldName"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.dataType')" prop="dataType">
              <template slot-scope="scope">
                <let-select
                  size="small"
                  v-model="scope.row.dataType"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                >
                  <let-option v-for="d in dataTypeOption" :key="d.key" :value="d.value">
                    {{d.value}}
                  </let-option>
                </let-select>
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.fieldProperty')" prop="property" width="15%">
              <template slot-scope="scope">
                {{scope.row.property}}
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.defaultValue')" prop="defaultValue">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.defaultValue"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.maxLen')" prop="maxLen">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.maxLen"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
          </let-table>
        </let-form-group>

        <let-form-group :title="$t('MKCache.unionKey')" inline label-position="top" v-if="multiKey">
          <let-table ref="unionKey" :data="mkCacheStructure.unionKey" :empty-msg="$t('common.nodata')">
            <let-table-column :title="$t('MKCache.fieldName')" prop="fieldName" width="25%">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.fieldName"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.dataType')" prop="dataType">
              <template slot-scope="scope">
                <let-select
                  size="small"
                  v-model="scope.row.dataType"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                >
                  <let-option v-for="d in dataTypeOption" :key="d.key" :value="d.value">
                    {{d.value}}
                  </let-option>
                </let-select>
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.fieldProperty')" prop="property" width="15%">
              <template slot-scope="scope">
                {{scope.row.property}}
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.defaultValue')" prop="defaultValue">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.defaultValue"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.maxLen')" prop="maxLen">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.maxLen"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('operate.operates')" width="15%">
              <template slot-scope="scope">
                <let-table-operation @click="addUnionKey">{{$t('operate.add')}}</let-table-operation>
                <let-table-operation @click="deleteUnionKey(scope.$index)">{{$t('operate.delete')}}</let-table-operation>
              </template>
            </let-table-column>
          </let-table>
        </let-form-group>

        <let-form-group :title="$t('MKCache.dataValue')" inline label-position="top">
          <let-table ref="dataValue" :data="mkCacheStructure.value" :empty-msg="$t('common.nodata')">
            <let-table-column :title="$t('MKCache.fieldName')" prop="fieldName" width="25%">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.fieldName"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.dataType')" prop="dataType">
              <template slot-scope="scope">
                <let-select
                  size="small"
                  v-model="scope.row.dataType"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                >
                  <let-option v-for="d in dataTypeOption" :key="d.key" :value="d.value">
                    {{d.value}}
                  </let-option>
                </let-select>
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.fieldProperty')" prop="property" width="15%">
              <template slot-scope="scope">
                <let-select
                  size="small"
                  v-model="scope.row.property"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                >
                  <let-option v-for="d in propertyOption" :key="d.key" :value="d.value">
                    {{d.value}}
                  </let-option>
                </let-select>
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.defaultValue')" prop="defaultValue">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.defaultValue"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('MKCache.maxLen')" prop="maxLen">
              <template slot-scope="scope">
                <let-input
                  size="small"
                  v-model="scope.row.maxLen"
                  required
                  :required-tip="$t('deployService.table.tips.empty')"
                />
              </template>
            </let-table-column>
            <let-table-column :title="$t('operate.operates')" width="15%">
              <template slot-scope="scope">
                <let-table-operation @click="addValue">{{$t('operate.add')}}</let-table-operation>
                <let-table-operation @click="deleteValue(scope.$index)">{{$t('operate.delete')}}</let-table-operation>
              </template>
            </let-table-column>
          </let-table>
        </let-form-group>
      </let-form>
    </let-modal>
  </section>
</template>

<script>
  const moduleModel = () => (
    {
      module_id: 17,
      module_name: "",
      group_name: "",
      server_name: "",
      server_ip: "",
      idc_area: "",
      service_type: "",
      memory: ""
    }
  );
  const dataTypeOption = [
    {key: 'int', value: 'int'},
    {key: 'long', value: 'long'},
    {key: 'string', value: 'string'},
    {key: 'byte', value: 'byte'},
    {key: 'float', value: 'float'},
    {key: 'double', value: 'double'},
  ];
  const propertyOption = [
    {key: 'require', value: 'require'},
    {key: 'optional', value: 'optional'},
  ];

  export default {
    data () {
      let {moduleId} = this.$route.params;
      return {
        moduleId,
        moduleData: [],
        isMkCache: false,
        multiKey: false,
        dataTypeOption,
        propertyOption,
        showMKModal: false,
        mkCacheStructure: {
          mainKey: [
            {
              fieldName: '',
              keyType: 'mkey',
              dataType: '',
              property: 'require',
              defaultValue: '',
              maxLen: ''
            }
          ],
          unionKey: [
            {
              fieldName: '',
              keyType: 'ukey',
              dataType: '',
              property: 'require',
              defaultValue: '',
              maxLen: ''
            }
          ],
          value: [
            {
              fieldName: '',
              keyType: 'value',
              dataType: '',
              property: '',
              defaultValue: '',
              maxLen: ''
            }
          ]
        }
      }
    },
    methods: {
      submitServerConfig () {
        if (this.$refs.detailForm.validate()) {
          if (this.isMkCache) {
            this.showMKModal = true;
          } else {
            this.addServerConfig();
          }
        }
      },
      addServerConfig () {
        const moduleData = this.moduleData;
        const url = '/server/api/add_server_config';
        const loading = this.$Loading.show();
        this.$ajax.postJSON(url, moduleData).then((data) => {
          loading.hide();
          this.$tip.success(this.$t('common.success'));
          this.$router.push('/operation/module/installAndPublish/' + this.moduleId)
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      getModuleConfigInfo () {
        let {moduleId} = this.$route.params;
        this.$ajax.getJSON('/server/api/get_module_config_info', {moduleId}).then((data) => {
          let cacheVersion = data.ModuleBase.cache_version === 1 ? 'KV' : 'MKV';
          data.group_name = data.module_name + cacheVersion + 'Group1';
          data.area = data.idc_area;
          data.server_name = data.module_name + cacheVersion + 'CacheServer1-1';
          data.server_type = 0;
          data.memory = Math.ceil(data.per_record_avg * data.total_record * 10000 / 1024 / 1024 / 1024);
          this.moduleData.push(data);

          let backData = {...data};
          backData.server_name = data.module_name + cacheVersion + 'CacheServer1-2';
          backData.server_type = 1;
          this.moduleData.push(backData);

          if (data.set_area.length > 0) {
            data.set_area.forEach((item, index) => {
              let mirItem = {...data};
              mirItem.area = item;
              mirItem.server_name = data.module_name + cacheVersion + 'CacheServer1-' + (index + 3);
              mirItem.server_type = 2;
              this.moduleData.push(mirItem);
            });
          }

          // 二期Cache 或者 一期 cache + 持久化 都需要填写数据结构。 一期暂时不用填写。
          this.isMkCache = data.ModuleBase.cache_version === 2 //|| data.cache_module_type === 2;
          this.multiKey = data.ModuleBase.cache_version === 2 && data.ModuleBase.mkcache_struct === 1;
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      mapServerType (key) {
        if (key === 0) return this.$t('module.mainServer');
        else if (key === 1) return this.$t('module.backServer');
        else return this.$t('module.mirror');
      },
      addUnionKey () {
        this.mkCacheStructure.unionKey.push({
          fieldName: '',
          keyType: 'ukey',
          dataType: '',
          property: 'require',
          defaultValue: '',
          maxLen: ''
        });
      },
      deleteUnionKey (index) {
        if (this.mkCacheStructure.unionKey.length > 1) {
          this.mkCacheStructure.unionKey.splice(index, 1);
        } else {
          this.$tip.error(this.$t('MKCache.error'));
        }
      },
      addValue () {
        this.mkCacheStructure.value.push({
          fieldName: '',
          keyType: 'value',
          dataType: '',
          property: '',
          defaultValue: '',
          maxLen: ''
        });
      },
      deleteValue (index) {
        if (this.mkCacheStructure.value.length > 1) {
          this.mkCacheStructure.value.splice(index, 1);
        } else {
          this.$tip.error(this.$t('MKCache.error'));
        }
      },
      submitMKCache () {
        if (this.$refs.multiKeyForm.validate()) {
          sessionStorage.setItem('mkCache', JSON.stringify(this.mkCacheStructure));
          this.addServerConfig();
          this.showMKModal = false;
        }
      }
    },
    async created () {
      sessionStorage.clear();
      await this.getModuleConfigInfo();
    }
  }
</script>
