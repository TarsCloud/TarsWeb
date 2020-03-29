<template>
  <div class="page_operation_templates">
    <div class="between">
      <let-button size="small" theme="primary" @click="addItem">{{$t('gateway.btn.addHttpRouter')}}</let-button>
    </div>
    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('gateway.serverName')" prop="f_server_name" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.pathRule')" prop="f_path_rule" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.proxyPass')" prop="f_proxy_pass" width="25%"></let-table-column>
      <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="f_update_time" width="160px"></let-table-column>
      <let-table-column :title="$t('operate.operates')"  width="80px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('gateway.add.title') : this.$t('gateway.update.title')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('gateway.serverName')">
          <let-input
            size="small"
            v-model="detailModal.model.f_server_name"
            :placeholder="$t('gateway.add.serverNameTip')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.pathRule')" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_path_rule"
            :placeholder="$t('gateway.add.pathRuleTip')"
            required
            :required-tip="$t('gateway.add.pathRuleTip')"
            :pattern-tip="$t('gateway.add.pathRuleTip')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.proxyPass')" required>
          <let-radio v-model="proxypassMode" label="ipport">ip:port</let-radio>
          <let-radio v-model="proxypassMode" label="upstream">upstream</let-radio>
          <let-radio v-model="proxypassMode" label="tars">tars</let-radio>
          <let-input v-if="proxypassMode == 'ipport'"
            size="small"
            v-model="detailModal.model.f_proxy_pass"
            :placeholder="$t('gateway.add.proxyPassTip')"
            pattern="^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d):\d+$"
            required
            :required-tip="$t('gateway.add.proxyPassTip')"
            :pattern-tip="$t('gateway.add.proxyPassTip')"
          ></let-input>
          <let-select v-if="proxypassMode=='upstream'" size="small" v-model="detailModal.model.f_proxy_pass" filterable>
            <let-option v-for="d in upstreams" :key="d" :value="d"> {{d}} </let-option>
          </let-select>
          <ServantSelector  v-if="proxypassMode=='tars' && detailModal.model" v-model="detailModal.model.f_proxy_pass"></ServantSelector>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
import ServantSelector from "./components/ServantSelector"

const TARS_REG = /(obj|Obj)$/
const IP_PORT = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d):\d+$/
export default {
  name: 'HttpRouter',
  components:{ServantSelector},
  props: {
    station: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      items: [],
      upstreams:[],
      // ipport / upstream / tars
      proxypassMode:"ipport",
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
    };
  },

  mounted() {
    this.fetchData();
    this.fetchUpstreams();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/httprouter_list', {f_station_id: this.station.f_station_id}).then((data) => {
        loading.hide();
        this.items = data;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    fetchUpstreams(){
      return this.$ajax.getJSON('/server/api/upstream_list').then((data) => {
        this.upstreams = data.map((item)=>{
          return item.f_upstream
        })
      }).catch((err) => {
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

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
      this.setProxypassMode(d);
    },
    setProxypassMode(d){
      if(TARS_REG.test(d.f_proxy_pass)){
        this.proxypassMode = "tars"
      } else if(IP_PORT.test(d.f_proxy_pass)){
        this.proxypassMode = "ipport"
      } else {
        this.proxypassMode = "upstream"
      }
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        model.f_station_id = this.station.f_station_id
        const url = model.f_id ? '/server/api/update_httprouter' : '/server/api/add_httprouter';

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
      this.$confirm(this.$t('gateway.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/delete_httprouter', { f_id: d.f_id }).then(() => {
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
  watch: {
    station() {
        this.items = []
        this.fetchData()
    }
  }
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
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
