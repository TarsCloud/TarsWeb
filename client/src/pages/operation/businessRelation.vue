<template>
  <div class="page_operation_businessRelation">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('business.form.business')">
        <let-select v-model="query.f_business_name" size="small" filterable v-if="business && business.length > 0">
          <let-option v-for="d in business" :key="d.f_id" :value="d.f_name">{{d.f_name}}</let-option>
        </let-select>
        <let-input size="small" v-model="query.f_business_name" v-else></let-input>
      </let-form-item>
      <let-form-item :label="$t('application.form.application')">
        <let-select v-model="query.f_application_name" size="small" filterable v-if="application && application.length > 0">
          <let-option v-for="d in application" :key="d.f_id" :value="d.f_name">{{d.f_name}}</let-option>
        </let-select>
        <let-input size="small" v-model="query.f_application_name" v-else></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
      <div style="float: right">
        <let-button size="small" theme="primary" style="float: right" @click="addItem">{{$t('businessRelation.btn.add')}}</let-button>
      </div>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('business.form.business')" prop="f_business_name"></let-table-column>
      <let-table-column :title="$t('application.form.application')" prop="f_application_name"></let-table-column>
      <let-table-column :title="$t('businessRelation.form.person')" prop="f_create_person"></let-table-column>
      <let-table-column :title="$t('businessRelation.form.time')" prop="f_create_time"></let-table-column>
      <let-table-column :title="$t('operate.operates')">
        <template slot-scope="scope">
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal v-model="viewModal.show" :title="$t('businessRelation.view.title')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.profile}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('businessRelation.add.title') : this.$t('businessRelation.update.title')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">

        <let-form-item :label="$t('application.form.application')" required>

          <let-select
            v-model="detailModal.model.f_application_name"
            size="small"
            required
            :required-tip="$t('common.notEmpty')">
            <let-option v-for="d in application" :key="d.f_id" :value="d.f_name">{{d.f_name}}</let-option>
          </let-select>
        </let-form-item>

        <let-form-item :label="$t('business.form.business')" required>
          <let-select
            v-model="detailModal.model.f_business_name"
            size="small"
            required
            :required-tip="$t('common.notEmpty')">
            <let-option v-for="d in business" :key="d.f_id" :value="d.f_name">{{d.f_name}}</let-option>
          </let-select>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'OperationApplication',

  data() {
    return {
      query: {
        f_business_name: '',
        f_application_name: '',
      },
      items: [],
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
      business: [],
      application: [],
    };
  },

  mounted() {
    this.fetchData();
    this.getBusinessData();
    this.getApplicationData();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/query_business_relation', this.query).then((data) => {
        loading.hide();
        this.items = data;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    addItem() {
      this.detailModal.model = {};
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.f_id ? '/server/api/update_business_relation' : '/server/api/add_business_relation';

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
      this.$confirm(this.$t('businessRelation.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_business_relation', { f_id: d.f_id }).then(() => {
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

    getBusinessData() {
      return this.$ajax.getJSON('/server/api/query_business').then((data) => {
        this.business = data;
      })
    },

    getApplicationData() {
      return this.$ajax.getJSON('/server/api/query_application').then((data) => {
        this.application = data;
      })
    },
  },
};
</script>

<style>
.page_operation_business {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }
}
</style>
