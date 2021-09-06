<template>
  <div class="page_operation_templates">
    <div class="between">
      <let-form inline itemWidth="200px" @submit.native.prevent="search">
        <let-form-item :label="$t('gateway.stationId')">
          <let-input size="small" v-model="query.f_station_id"></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.stationName')">
          <let-input size="small" v-model="query.f_name_cn"></let-input>
        </let-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        </let-form-item>
      </let-form>
      <div>
        <let-button size="small" theme="primary" @click="addItem">{{$t('gateway.btn.addGateway')}}</let-button>
        <let-button style="margin-left: 20px" size="small" theme="primary" @click="loadAll">{{$t('gateway.btn.loadAll')}}</let-button>
      </div>
    </div>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('gateway.stationId')" prop="f_station_id" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.stationName')" prop="f_name_cn" width="20%"></let-table-column>
      <let-table-column :title="$t('gateway.monitorUrl')" prop="f_monitor_url" width="25%"></let-table-column>
      <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="f_update_time"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="300px">
        <template slot-scope="scope">
          <let-table-operation @click="viewItem(scope.row)">{{$t('operate.config')}}</let-table-operation>
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>
    <let-pagination :page="pageNum" @change="gotoPage" :total="total"></let-pagination><br>

    <let-modal v-model="viewModal.show" :title="(viewModal.model ? viewModal.model.f_name_cn : '') + ' ' + $t('gateway.config.title')" width="1000px">
      <!-- let-ui bug，无法动态隐藏一个tab -->
      <let-tabs  v-if="stationMode == 'http'">
        <let-tab-pane :tab="$t('gateway.router.title')">
          <HttpRouter v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model"></HttpRouter>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.flowControl.title')">
          <FlowControl  v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model"></FlowControl>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.bwlist.title.black')">
          <BwList v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model" type="black"></BwList>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.bwlist.title.white')">
          <BwList v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model" type="white"></BwList>
        </let-tab-pane>
      </let-tabs>
      <let-tabs  v-if="stationMode == 'tars'">
          <let-tab-pane :tab="$t('gateway.flowControl.title')">
            <FlowControl v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model"></FlowControl>
          </let-tab-pane>
          <let-tab-pane :tab="$t('gateway.bwlist.title.black')">
            <BwList v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model" type="black"></BwList>
          </let-tab-pane>
          <let-tab-pane :tab="$t('gateway.bwlist.title.white')">
            <BwList v-if="viewModal.model" :gatewayObj="gatewayObj" :station="viewModal.model" type="white"></BwList>
          </let-tab-pane>
      </let-tabs>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('gateway.add.title') : this.$t('gateway.update.title')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('gateway.stationId')" required>
          <let-radio v-model="stationMode" label="http">http</let-radio>
          <let-radio v-model="stationMode" label="tars">tars</let-radio>
          <let-input
            size="small" v-if="stationMode=='http'"
            v-model="detailModal.model.f_station_id"
            :placeholder="$t('gateway.add.idFormatTips')"
            required
            :required-tip="$t('gateway.add.idFormatTips')"
            pattern="^[a-zA-Z](([a-zA-Z_0-9](?<!obj|Obj))+)?$"
            :pattern-tip="$t('gateway.add.idFormatTips')"
          ></let-input>
          <ServantSelector v-if="stationMode=='tars'" :gatewayObj="gatewayObj" v-model="detailModal.model.f_station_id"></ServantSelector>
        </let-form-item>
        <let-form-item :label="$t('gateway.stationName')" required>
          <let-input
            size="small"
            v-model="detailModal.model.f_name_cn"
            :placeholder="$t('gateway.add.stationNameTips')"
            required
            :required-tip="$t('gateway.add.stationNameTips')"
            :pattern-tip="$t('gateway.add.stationNameTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('gateway.monitorUrl')">
          <let-input
            size="small"
            v-model="detailModal.model.f_monitor_url"
            :placeholder="$t('gateway.add.monitorUrlTips')"
            :pattern-tip="$t('gateway.add.monitorUrlTips')"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
import BwList from "./bwlist"
import FlowControl from "./flowcontrol"
import HttpRouter from "./httprouter"
import ServantSelector from "./components/ServantSelector"

export default {
  name: 'Station',
  components:{BwList, FlowControl, HttpRouter, ServantSelector},
  props: {
    gatewayObj: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      query: {
        f_station_id: '',
        f_name_cn: '',
      },
      items: [],
      stationMode: 'http',
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
      pageNum: 1,
      pageSize: 12,
      total:1,
    };
  },

  mounted() {
    this.fetchData(1);
  },

  methods: {
    gotoPage(num) {
      this.fetchData(num)
    },
    fetchData(curr_page) {
      if(!curr_page || typeof curr_page!="number") {
        curr_page = this.pageNum || 1
      }
      const loading = this.$refs.table.$loading.show();
      this.query.gatewayObj = this.gatewayObj;
      this.query.page_size = this.pageSize;
      this.query.curr_page = curr_page;
      return this.$ajax.getJSON('/gateway/api/station_list', this.query).then((data) => {
        loading.hide();
        this.pageNum = curr_page
        this.total = Math.ceil(data.count/this.pageSize)
        this.items = data.rows;
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
    loadAll(){
      const loading = this.$Loading.show();
      this.$ajax.postJSON('/gateway/api/loadAll_conf', {
          gatewayObj: this.gatewayObj,
          command: 'loadAll'
      }).then((res) => {
        loading.hide();
        const msg = res[0].err_msg.replace(/\n/g, '<br>');
        if (res[0].ret_code === 0) {
          const opt = {
            title: this.$t('common.success'),
            message: msg,
          };
          opt.duration = 0;
          this.$tip.success(opt);
        } else {
          throw new Error(msg);
        }
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    viewItem(d) {
      this.viewModal.model = d;
      this.setStationMode(d);
      this.viewModal.show = true;
    },
    editItem(d) {
      this.detailModal.model = d;
      this.setStationMode(d)
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },
    setStationMode(d){
      if(d.f_station_id.endsWith("obj") || d.f_station_id.endsWith("Obj")){
        this.stationMode = "tars"
      } else {
        this.stationMode = "http"
      }
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.f_id ? '/gateway/api/update_station' : '/gateway/api/add_station';

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

      this.$confirm(this.$t('gateway.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/gateway/api/delete_station', { f_id: d.f_id, gatewayObj:this.gatewayObj }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch((e) => {   console.error(e)});
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
  justify-content:space-between;
  align-items: center;
}
</style>
