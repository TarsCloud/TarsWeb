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
      <let-table-column :title="$t('operate.operates')"  width="100px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('gateway.btn.addHttpRouter') : this.$t('gateway.update.routerTitle')"
      width="900px"
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
          <div v-if="proxypassMode == 'ipport'" class="set_upstream">
            <let-input
              size="small"
              v-model="detailModal.model.f_proxy_pass"
              :placeholder="$t('gateway.add.proxyPassTip')"
              pattern="^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d):\d+$"
              required
              :required-tip="$t('gateway.add.proxyPassTip')"
              :pattern-tip="$t('gateway.add.proxyPassTip')"
            ></let-input>
            <let-input
                size="small"
                v-model="detailModal.model.f_proxy_pass_path"
                placeholder="/some/path"
                pattern="^\/"
                pattern-tip="/some/path"
              ></let-input>
          </div>
          <div v-if="proxypassMode=='upstream'" class="set_upstream">
            <let-select size="small" v-model="detailModal.model.f_proxy_pass_upstream" filterable>
              <let-option v-for="d in upstreams" :key="d" :value="d"> {{d}} </let-option>
            </let-select>
            <let-input
              size="small"
              v-model="detailModal.model.f_proxy_pass_path"
              placeholder="/some/path"
              pattern="^\/"
              pattern-tip="/some/path"
            ></let-input>
          </div>
          <ServantSelector  v-if="proxypassMode=='tars' && detailModal.model" v-model="detailModal.model.f_proxy_pass" :gatewayObj="gatewayObj" ></ServantSelector>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
import ServantSelector from "./components/ServantSelector"

const TARS_REG = /(obj|Obj)$/
const IP_PORT = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d):\d+/
const HTTP_PREFIX = /^http:\/\//
export default {
  name: 'HttpRouter',
  components:{ServantSelector},
  props: {
    station: {
      type: Object,
      required: true,
    },
    gatewayObj: {
      type: String,
      required: true
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
      return this.$ajax.getJSON('/server/api/httprouter_list', {f_station_id: this.station.f_station_id, gatewayObj: this.gatewayObj}).then((data) => {
        loading.hide();
        this.items = data;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    fetchUpstreams(){
      return this.$ajax.getJSON('/server/api/upstream_list', {gatewayObj: this.gatewayObj}).then((data) => {
        let upstreams = data.map((item)=>{
          return item.f_upstream
        })
        upstreams = Array.from(new Set(upstreams))
        this.upstreams = upstreams
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
      this.fetchUpstreams()
      this.detailModal.model = {};
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    editItem(d) {
      this.fetchUpstreams()
      d = Object.assign({},d);//编辑时，处理副本
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
      //编辑之前，先去掉前缀
      d.f_proxy_pass = d.f_proxy_pass.replace(HTTP_PREFIX, "")
      //去掉前缀后再判断proxypass种类
      this.setProxypassMode(d);
      //如果是upstream模式，设置分开的字段
      if(this.proxypassMode == "upstream"){
        d.f_proxy_pass_upstream = d.f_proxy_pass.split("/")[0]
        d.f_proxy_pass_path = "/" + (d.f_proxy_pass.split("/")[1] || "")
        //可能是选项中没有的，给设置上
        this.$nextTick(()=>{
          document.querySelector(".set_upstream .let-select__filter__input").value = d.f_proxy_pass_upstream
        })
      } else if(this.proxypassMode == "ipport"){
        let [ipport, f_proxy_pass_path] = d.f_proxy_pass.split("/")
        d.f_proxy_pass = ipport
        d.f_proxy_pass_path = "/" + (f_proxy_pass_path||"")
      }
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
        let params = Object.assign({}, model);
        //组装upstream
        if(this.proxypassMode == "upstream"){
          //let-ui不支持select输入，一个trick
          let iptValue = document.querySelector(".set_upstream .let-select__filter__input").value.trim()
          params.f_proxy_pass_upstream = iptValue
          params.f_proxy_pass = `${params.f_proxy_pass_upstream}${params.f_proxy_pass_path || ""}`
        } else if(this.proxypassMode == "ipport"){
          params.f_proxy_pass = `${params.f_proxy_pass}${params.f_proxy_pass_path || ""}`
        }
        //添加http前缀
        if(!HTTP_PREFIX.test(params.f_proxy_pass)){
          params.f_proxy_pass = "http://" + params.f_proxy_pass
        }
        params.gatewayObj = this.gatewayObj
        this.$ajax.postJSON(url, params).then(() => {
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
        this.$ajax.postJSON('/server/api/delete_httprouter', { f_id: d.f_id, gatewayObj: this.gatewayObj }).then(() => {
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
.set_upstream{
  display:flex;
  div{
    margin-right: 10px;
  }
}
</style>