<template>
  <div class="page_operation_templates">
    <div class="between">
      <let-form inline itemWidth="200px" @submit.native.prevent="search">
        <let-form-item label="upstream">
          <let-input size="small" v-model="query.f_upstream"></let-input>
        </let-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        </let-form-item>
      </let-form>
      <let-button size="small" theme="primary" @click="addItem">{{$t('gateway.btn.addUpstream')}}</let-button>
    </div>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column title="upstream" prop="f_upstream" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.addr')" prop="f_addr" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.weight')" prop="f_weight"></let-table-column>
      <let-table-column :title="$t('gateway.fusing')" prop="f_fusing_onoff">
         <template slot-scope="scope">
          <span>{{scope.row.f_fusing_onoff == 1 ? $t('gateway.fusingOn') : $t('gateway.fusingOff')}}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="f_update_time"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="200px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('gateway.btn.addUpstream') : this.$t('gateway.update.upstream')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item label="upstream" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_upstream"
            :placeholder="$t('gateway.add.upstreamFormatTips')"
            required
            :required-tip="$t('gateway.add.upstreamFormatTips')"
            pattern="^[a-zA-Z](([a-zA-Z0-9_](?<!obj|Obj))+)?$"
            :pattern-tip="$t('gateway.add.upstreamFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.addr')" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_addr"
            :placeholder="$t('gateway.add.addrFormatTips')"
            required
            pattern="^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d):\d+$"
            :required-tip="$t('gateway.add.addrFormatTips')"
            :pattern-tip="$t('gateway.add.addrFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.weight')" required>
          <let-input
            size="small" type="number"
            v-model="detailModal.model.f_weight"
            required
            pattern="^\d+$"
            :required-tip="$t('gateway.add.weightFormatTips')"
            :placeholder="$t('gateway.add.weightFormatTips')"
            :pattern-tip="$t('gateway.add.weightFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.fusing')">
            <let-radio v-model="detailModal.model.f_fusing_onoff" :label="1">{{$t('gateway.fusingOn')}}</let-radio>
            <let-radio v-model="detailModal.model.f_fusing_onoff" :label="0">{{$t('gateway.fusingOff')}}</let-radio>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'Upstream',
  props: {
    gatewayObj: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      query: {
        f_upstream: ''
      },
      items: [],
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
      this.query.gatewayObj = this.gatewayObj
      return this.$ajax.getJSON('/server/api/upstream_list', this.query).then((data) => {
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
      this.detailModal.model = {
        f_weight: 1,
        f_fusing_onoff: 1
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
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.f_id ? '/server/api/update_upstream' : '/server/api/add_upstream';

        const loading = this.$Loading.show();
        model.gatewayObj = this.gatewayObj
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
      this.$confirm(this.$t('gateway.delete.upstreamConfirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/delete_upstream', { f_id: d.f_id, gatewayObj: this.gatewayObj }).then(() => {
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

<style lang="postcss" scoped>
.page_operation_templates {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }
}
.between{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
