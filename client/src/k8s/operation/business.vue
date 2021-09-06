<template>
  <div class="page_base_business">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('filter.title.business')">
        <let-input size="small" v-model="query.BusinessName"></let-input>
      </let-form-item>
      <let-form-item :label="$t('filter.title.name')">
        <let-input size="small" v-model="query.BusinessShow"></let-input>
      </let-form-item>
      <let-form-item :label="$t('filter.title.mark')">
        <let-input size="small" v-model="query.BusinessMark"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        &nbsp;&nbsp;&nbsp;
        <let-button size="small" theme="primary" @click="addItem">{{$t('filter.btn.add')}}</let-button>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('filter.title.business')" prop="BusinessName" width="20%"></let-table-column>
      <let-table-column :title="$t('filter.title.name')" prop="BusinessShow" width="20%"></let-table-column>
      <let-table-column :title="$t('filter.title.mark')" prop="BusinessMark" width="20%"></let-table-column>
      <let-table-column :title="$t('filter.title.order')" prop="BusinessOrder"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="appListItem(scope.row)">{{$t('table.btn.appList')}}</let-table-operation>
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <div style="overflow:hidden;">
      <let-pagination align="right" style="float:right;"
        :page="pagination.page" @change="gotoPage"
        :total="pagination.total">
      </let-pagination>
      <!-- <div style="float:left;">
        <let-button theme="primary" size="small" @click="configServer">{{$t('operate.update')}}</let-button>
        <let-button theme="primary" size="small" @click="manageServant">{{$t('operate.servant')}}</let-button>
        <let-button theme="primary" size="small" @click="manageK8S">{{$t('operate.k8s')}}</let-button>
      </div> -->
    </div>

    <let-modal v-model="viewModal.show" :title="$t('template.view.title')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.TemplateContent}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('filter.title.business')" required>
          <let-input
            :disabled="detailModal.isNew ? false : true"
            size="small"
            v-model="detailModal.model.BusinessName"
            :placeholder="$t('deployService.form.placeholder')"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('filter.title.name')" required>
          <let-input
            size="small"
            v-model="detailModal.model.BusinessShow"
            :placeholder="$t('deployService.form.placeholder')"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('filter.title.order')" required>
          <let-input
            size="small"
            type="number"
            :min="0"
            :max="100"
            v-model="detailModal.model.BusinessOrder"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('filter.title.mark')">
          <let-input
            size="small"
            v-model="detailModal.model.BusinessMark"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <let-modal
      v-model="AppModal.show"
      :title="AppModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="800px"
      @on-confirm="appListSaveItem"
      @on-cancel="closeAppModal"
    >
      <let-form ref="AppForm" v-if="AppModal.model" itemWidth="700px">
        <let-form-item :label="$t('filter.title.business')" required>
          <let-input
            :disabled="AppModal.isNew ? false : true"
            size="small"
            v-model="AppModal.model.BusinessName"
            :placeholder="$t('deployService.form.placeholder')"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('filter.title.name')" required>
          <let-input
            :disabled="AppModal.isNew ? false : true"
            size="small"
            v-model="AppModal.model.BusinessShow"
            :placeholder="$t('deployService.form.placeholder')"
            required
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('filter.title.app')">
          <let-checkbox v-model="isCheckedAll" :value="isCheckedAll">全选</let-checkbox>
          <div class="checkbox_list">
            <let-checkbox class="checkbox_item" v-for="d in AppList" :key="d.ServerApp" :value="checkBoxAddList.indexOf(d.ServerApp) > -1" @change="checkedChange(d.ServerApp)">{{ d.ServerApp }}</let-checkbox>
          </div>

          <!-- <let-select
            filterable
            mutiple
            size="small"
            v-model="AppServerStr"
            :placeholder="$t('pub.dlg.defaultValue')"
            @change="appChange"
          >
            <let-option v-for="d in AppList" :key="d.ServerApp" :value="d.ServerApp">{{d.ServerApp}}</let-option>
          </let-select>
          <div style="border:1px solid #c0c4cc;border-radius:4px;box-sizing:border-box;margin-top:16px;padding:10px 10px 0;" v-if="AppModal.model.App && AppModal.model.App.length > 0">
            <let-tag style="margin:0 10px 10px 0;"
              v-for="item in AppModal.model.App"
              :key="item"
              checked
              closable
              theme="success"
              @close="handleClose(item)"
            >
              {{ item }}
            </let-tag>
          </div> -->
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'BaseBusiness',

  data() {
    return {
      isCheckedAll: false,
      checkBoxAddList: [],
      checkBoxDelList: [],
      query: {
        BusinessName: '',
        BusinessShow: '',
        BusinessMark: '',
      },
      items: [],
      AppList: [],
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total:1,
      },
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
      AppServerArr: [],
      AppServerStr: '',
      AppServerDeleteArr: [],
      AppModal: {
        show: false,
        model: null,
        isNew: false
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  watch: {
    isCheckedAll() {
      let isCheckedAll = this.isCheckedAll;
      if(isCheckedAll) {
        this.AppList.forEach(item => {
          if(this.checkBoxAddList.indexOf(item.ServerApp) === -1){
            this.checkBoxAddList.push(item.ServerApp)
          }
          this.checkBoxDelList = []
        })
      }else{
        this.AppList.forEach(item => {
          if(this.checkBoxDelList.indexOf(item.ServerApp) === -1){
            this.checkBoxDelList.push(item.ServerApp)
          }
          this.checkBoxAddList = []
        })
      }
    },
  },

  methods: {
    checkedChange(val) {
      if(this.checkBoxAddList.indexOf(val) === -1){
        this.checkBoxAddList.push(val)
        this.checkBoxDelList.splice(this.checkBoxDelList.indexOf(val), 1)
      }else{
        this.checkBoxDelList.push(val)
        this.checkBoxAddList.splice(this.checkBoxAddList.indexOf(val), 1)
      }

      if(this.checkBoxAddList.length === 0){
        this.isCheckedAll = false
      }
    },
    gotoPage(num) {
      this.pagination.page = num
      this.fetchData()
    },
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      
      return this.$ajax.getJSON('/k8s/api/business_select', Object.assign(this.query, {
        isAll: false,
        page: this.pagination.page,
        size: this.pagination.size,
      })).then((data) => {
        loading.hide();
        this.items = data.Data
        this.pagination.total = Math.ceil(data.Count.AllCount / this.pagination.size)
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.pagination.page = 1;
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    closeAppModal() {
      this.$refs.AppForm.resetValid();
      this.AppModal.show = false;
      this.AppModal.model = null;
    },

    addItem() {
      this.checkBoxAddList = []
      this.detailModal.model = {};
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    editItem(d) {
      this.checkBoxAddList = d.AppServer || []
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = this.detailModal.isNew ? '/k8s/api/business_create' : '/k8s/api/business_update';

        const loading = this.$Loading.show();
        this.$ajax.postJSON(url, model).then(() => {
          loading.hide();
          this.$tip.success(this.$t('common.success'));
          this.closeDetailModal();
          this.fetchData();
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    removeItem(d) {
      this.$confirm(this.$t('template.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/k8s/api/business_delete', { BusinessName: d.BusinessName }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },

    getAppList() {
      this.$ajax.getJSON('/k8s/api/application_select', {
        isAll: true,
      }).then((data) => {
        this.AppList = data.Data
      })
    },

    appListItem(d) {
      this.getAppList()
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.postJSON('/k8s/api/business_list_app', {
        BusinessNames: [d.BusinessName],
      }).then((data) => {
        loading.hide();
        this.appListEditItem(data[0])
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    appListEditItem(d) {
      this.checkBoxAddList = d.App || []
      this.AppModal.model = d;
      this.AppModal.show = true;
      this.AppModal.isNew = false;
    },

    appListSaveItem() {
      if (this.$refs.AppForm.validate()) {
        const model = this.AppModal.model;
        const url = this.AppModal.isNew ? '/k8s/api/business_add_app' : '/k8s/api/business_add_app';

        const loading = this.$Loading.show();

        if(this.checkBoxAddList && this.checkBoxAddList.length > 0){
          this.$ajax.postJSON(url, {
            BusinessName: model.BusinessName,
            AppNames: this.checkBoxAddList,
          }).then(() => {
            loading.hide();
            this.$tip.success(this.$t('common.success'));
            this.closeAppModal();
            this.fetchData();
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        }else{
          loading.hide();
          this.closeAppModal();
        }
      }
    },
  },
};
</script>

<style>
.page_base_business {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .checkbox_list {
    border: 1px solid #e1e4eb;
    max-height: 200px;
    overflow: hidden;
    overflow-y: auto;
  }

  .checkbox_item {
    box-sizing:border-box;
    padding:4px 10px;
    width:33.33%
  }
}
</style>
