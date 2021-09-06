<template>
  <div class="page_base_affinity">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('filter.title.node')">
        <let-select size="small" v-model="query.NodeName" :placeholder="$t('pub.dlg.defaultValue')">
          <let-option v-for="d in NodeList" :key="d.NodeName" :value="d.NodeName">{{ d.NodeNameShow }}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('filter.title.app')">
        <let-select size="small" v-model="query.ServerApp" :placeholder="$t('pub.dlg.defaultValue')"
                    @change="changeApp">
          <let-option v-for="d in AppList" :key="d.ServerApp" :value="d.ServerApp">{{ d.AppNameShow }}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('filter.title.serverName')">
        <let-select size="small" v-model="query.ServerName" :placeholder="$t('pub.dlg.defaultValue')">
          <let-option v-for="d in ServerNameList" :key="d" :value="d">{{ d }}</let-option>
        </let-select>
      </let-form-item>

      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{ $t('operate.search') }}</let-button>
        &nbsp;&nbsp;&nbsp;
        <let-button size="small" theme="primary" @click="addItem">{{ $t('filter.btn.addAffinity') }}</let-button>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('filter.title.app')">
        <template slot-scope="scope">
          <div class="table_con">
            <let-tag theme="success" checked>{{scope.row|showTag}}</let-tag>
          </div>
        </template>
      </let-table-column>
      <let-table-column :title="$t('filter.title.node')">
        <template slot-scope="scope">
          <div class="table_con">
            <let-tag v-for="item in scope.row.NodeName" :key="item" :value="item" theme="success" checked>{{
                item
              }}
            </let-tag>
          </div>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" width="150px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{ $t('operate.update') }}</let-table-operation>
          <let-table-operation v-if="scope.row.del" @click="removeItem(scope.row)">{{ $t('operate.delete') }}
          </let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal
        v-model="detailModal.show"
        :title="this.$t('filter.title.node')"
        width="800px"
        @on-confirm="addServerItem"
        @on-cancel="closeDetailModal">
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('filter.title.app')" required>
          <let-select size="small" v-if="detailModal.isNew" v-model="detailModal.model.ServerApp"
                      :placeholder="$t('pub.dlg.defaultValue')"
                      required @change="changeApp">
            <let-option v-for="d in AppList" :key="d.ServerApp" :value="d.ServerApp">{{ d.ServerApp }}</let-option>
          </let-select>
          <let-input size="small" v-if="!detailModal.isNew" v-model="detailModal.model.ServerApp" disabled></let-input>
        </let-form-item>

        <let-form-item :label="$t('filter.title.serverName')">
          <let-select size="small" v-if="detailModal.isNew" v-model="detailModal.model.ServerName"
                      :placeholder="$t('pub.dlg.defaultValue')">
            <let-option v-for="d in detailModal.ServerNameList" :key="d" :value="d">{{ d }}</let-option>
          </let-select>
          <let-input size="small" v-if="!detailModal.isNew" v-model="detailModal.model.ServerName" disabled></let-input>
        </let-form-item>

        <let-form-item :label="$t('filter.title.node')">
          <let-checkbox v-model="isCheckedAll" :value="isCheckedAll">{{ $t('cache.config.allSelected') }}</let-checkbox>
          <div class="checkbox_list">
            <let-checkbox class="checkbox_item" v-for="d in NodeList" :key="d.NodeName"
                          :value="detailModal.model.checkBoxAddList.indexOf(d.NodeName) > -1"
                          @change="checkedChange(d.NodeName)" style="margin-right:15px">{{ d.NodeName }}
            </let-checkbox>
          </div>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'BaseAffinityServer',

  data() {
    return {
      // 全选
      isCheckedAll: false,
      // checkBoxAddList: [],
      // checkBoxDelList: [],
      query: {
        NodeName: '',
        ServerApp: '',
        ServerName: "",
      },
      totalPage: 0,
      pageSize: 20,
      page: 1,
      items: [],
      AppList: [],
      NodeList: [],
      ServerNameList:[],
      // ServerAppArr: [],
      // ServerAppStr: '',
      // ServerAppDeleteArr: [],
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        ServerNameList:[],
        show: false,
        model: {
          checkBoxAddList: [],
          checkBoxDelList: []
        },
        isNew: false
      },
    };
  },

  filters: {
    showTag(val) {
      if (val.ServerName) {
        return val.ServerApp + "." + val.ServerName;
      } else {
        return val.ServerApp
      }
    }
  },

  async mounted() {
    await this.getAppList()
    this.fetchData();
    this.getNodeList()
  },

  watch: {
    isCheckedAll() {
      let isCheckedAll = this.isCheckedAll;
      if (isCheckedAll) {
        this.NodeList.forEach(item => {
          if (this.detailModal.model.checkBoxAddList.indexOf(item.NodeName) === -1) {
            this.detailModal.model.checkBoxAddList.push(item.NodeName)
          }
          this.detailModal.model.checkBoxDelList = []
        })
      } else {
        this.NodeList.forEach(item => {
          if (this.detailModal.model.checkBoxDelList.indexOf(item.NodeName) === -1) {
            this.detailModal.model.checkBoxDelList.push(item.NodeName)
          }
          this.detailModal.model.checkBoxAddList = []
        })
      }
    },
  },

  methods: {
    checkedChange(val) {
      if (this.detailModal.model.checkBoxAddList.indexOf(val) === -1) {
        this.detailModal.model.checkBoxAddList.push(val)
        this.detailModal.model.checkBoxDelList.splice(this.detailModal.model.checkBoxDelList.indexOf(val), 1)
      } else {
        this.detailModal.model.checkBoxDelList.push(val)
        this.detailModal.model.checkBoxAddList.splice(this.detailModal.model.checkBoxAddList.indexOf(val), 1)
      }

      if (this.detailModal.model.checkBoxAddList.length === 0) {
        this.isCheckedAll = false
      }
    },
    changePage(page) {
      this.page = page;
    },
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/k8s/api/affinity_list_server', this.query).then((data) => {
        loading.hide();
        this.items = data.Data;
        //是否可删除
        this.items.forEach(item => {

          item.del = !this.AppList.find((x) => {
            return x.ServerApp == item.ServerApp
          });

        });

      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.changePage(1);
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    addItem() {
      this.detailModal.model = {
        checkBoxAddList: [],
        checkBoxDelList: [],
        ServerName: "",
        ServerApp: ""
      };
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.model.checkBoxAddList = JSON.parse(JSON.stringify(d.NodeName || []));
      this.detailModal.model.checkBoxDelList = []
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },

    async addServerItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const loading = this.$Loading.show();
        try {
          if (model.checkBoxDelList && model.checkBoxDelList.length > 0) {
            await this.$ajax.postJSON('/k8s/api/affinity_del_node', {
              ServerApp: model.ServerApp,
              NodeName: model.checkBoxDelList,
              Force: 'true'
            });
          }

          await this.$ajax.postJSON('/k8s/api/affinity_add_node', {
            ServerApp: model.ServerApp,
            ServerName: model.ServerName,
            NodeName: model.checkBoxAddList,
          }).then(() => {
            loading.hide();
            this.$tip.success(this.$t('common.success'));
            this.closeDetailModal();
            this.fetchData();
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        } catch (err) {
          loading.hide();
          this.closeDetailModal();
          this.fetchData();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        }
      }
    },

    removeItem(d) {
      this.$confirm(this.$t('template.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/k8s/api/affinity_del_node', {
          ServerApp: d.ServerApp,
          NodeName: d.NodeName,
          ServerName:d.ServerName,
          Force: 'false'
        }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {
      });
    },
    //获取应用列表
    async getAppList() {
      let data = await this.$ajax.getJSON('/k8s/api/application_select', {});
      this.AppList = [];
      data.Data.forEach(item => {
        item.AppNameShow = item.ServerApp;
        this.AppList.push(item);
      });
    },
    async getServerList(app){
      let servers = await this.$ajax.getJSON('/k8s/api/server_list', {ServerApp: app, isAll: true});
      let serverNames = servers.Data.map(item=>{return item.ServerName});
      return serverNames
    },
    async changeApp(val) {
      if (this.detailModal.show) {
        this.detailModal.ServerNameList = await this.getServerList(val);
        this.$nextTick(()=>{
          this.detailModal.model.ServerName = ""
        })
      } else {
        this.query.ServerName = "";
        this.ServerNameList = await this.getServerList(val);
      }
    },
    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_select', {}).then((data) => {

        this.NodeList = [];
        data.Data.forEach(item => {
          item.NodeNameShow = item.NodeName;
          this.NodeList.push(item);
        })

      })
    },
  },
};
</script>

<style>
.page_base_affinity {

pre {
  color: #909FA3;
  margin-top: 32px;
}

.let_modal__body {
  overflow-y: visible;
}

}

.table_con {
  margin-right: 20px;
  max-height: 200px;
  overflow: auto;
  padding: 10px 0 0;
}

.table_con .let-tag {
  margin: 0 10px 10px 0;
}
</style>
