<template>
  <div class="page_operation_business">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('business.form.business')">
        <let-input size="small" v-model="query.f_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
      <div style="float: right">
        <let-button size="small" theme="primary" style="float: right" @click="addItem">{{$t('business.btn.add')}}</let-button>
      </div>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('business.form.business')" prop="f_name"></let-table-column>
      <let-table-column :title="$t('business.form.showName')" prop="f_show_name"></let-table-column>
      <let-table-column :title="$t('business.form.order')" prop="f_order"></let-table-column>
      <let-table-column :title="$t('business.form.person')" prop="f_create_person"></let-table-column>
      <let-table-column :title="$t('business.form.time')" prop="f_create_time"></let-table-column>
      <let-table-column :title="$t('operate.operates')">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal v-model="viewModal.show" :title="$t('business.view.title')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.profile}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('business.add.title') : this.$t('business.update.title')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('business.form.business')" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_name"
            :placeholder="$t('business.add.formatTips')"
            required
            :required-tip="$t('business.add.nameTips')"
            pattern="^[a-zA-Z]([.a-zA-Z0-9]+)?$"
            :pattern-tip="$t('business.add.formatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('business.form.showName')" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_show_name"
            :placeholder="$t('common.notEmpty')"
            required
            :required-tip="$t('common.notEmpty')"
            :pattern-tip="$t('common.notEmpty')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('business.form.order')">
          <let-input
            size="small"
            v-model="detailModal.model.f_order"
            :placeholder="$t('common.needNumber')"
            :required-tip="$t('common.needNumber')"
            pattern="^([0-9]+)?$"
            :pattern-tip="$t('common.needNumber')"
          ></let-input>
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
        f_name: '',
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
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/query_business', this.query).then((data) => {
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

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.f_id ? '/server/api/update_business' : '/server/api/add_business';

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
      this.$confirm(this.$t('business.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_business', { f_id: d.f_id }).then(() => {
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
