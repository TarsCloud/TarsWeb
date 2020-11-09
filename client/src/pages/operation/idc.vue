<!--运维管理->IDC分组管理-->

<template>
  <div class="page_operation_templates">
    <!--搜索-->
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('idc.grid.groupName')">
        <let-input size="small" v-model="query.group_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{ $t('operate.search') }}</let-button>
      </let-form-item>
      <div style="float: right">
        <let-button size="small" theme="primary" @click="addGroup">{{ $t('idc.btn.add') }}</let-button>
      </div>
    </let-form>

   <!-- 列表-->
    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')" class="hideFir">
      <let-table-column prop="group_id" style="display: none"></let-table-column>
      <let-table-column :title="$t('idc.grid.groupName')" prop="group_name"></let-table-column>
      <let-table-column :title="$t('idc.grid.groupNameCN')" prop="group_name_cn"></let-table-column>
      <let-table-column :title="$t('idc.grid.ipOrder')" prop="ip_order"></let-table-column>
      <let-table-column :title="$t('idc.grid.allowIpRule')" prop="allow_ip_rule"></let-table-column>
      <let-table-column :title="$t('idc.grid.dennyIpRule')" prop="denny_ip_rule"></let-table-column>
      <let-table-column :title="$t('idc.grid.lastuser')" prop="lastuser"></let-table-column>
      <let-table-column :title="$t('idc.grid.modifyTime')" prop="modify_time"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="300px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{ $t('operate.update') }}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{ $t('operate.delete') }}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <!-- 弹框-->
    <let-modal v-model="detailModal.show"
               :title="detailModal.isNew ? this.$t('idc.btn.add') : this.$t('idc.update.title')"
               width="800px" @on-confirm="saveItem" @on-cancel="closeDetailModal" >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="300px" columns="2" class="two-columns">
        <let-form-item :label="$t('idc.grid.groupName')" required v-if="!detailModal.isNew">
          {{ detailModal.model.group_name }}
        </let-form-item>
        <let-form-item :label="$t('idc.grid.groupName')" required v-if="detailModal.isNew">
          <let-input
              size="small"
              v-model="detailModal.model.group_name"
              :placeholder="$t('idc.valid.groupName')"
              required
              :required-tip="$t('idc.valid.groupName')"
              pattern="^[a-zA-Z-]([.a-zA-Z0-9-]+)?$"
              :pattern-tip="$t('idc.valid.groupName')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('idc.grid.groupNameCN')" required style="margin-left: 40px">
          <let-input
              size="small"
              v-model="detailModal.model.group_name_cn" required
              :placeholder="$t('idc.update.placeholder')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('idc.grid.ipOrder')" required>
          <let-select
              size="small"
              v-model="detailModal.model.ip_order"
              :placeholder="$t('idc.update.allowType')"
              required>
            <let-option v-for="t in ipOrders" :key="t" :value="t">{{t}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item>
        </let-form-item>
        <let-form-item :label="$t('idc.grid.allowIpRule')">
          <let-select
              v-model="detailModal.model.allowList"
              required multiple>
            <let-option v-for="t in allowList" :key="t" :value="t">{{t}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item :label="$t('idc.grid.dennyIpRule')" style="margin-left: 40px">
          <let-select
              v-model="detailModal.model.dennyList"
              required multiple>
            <let-option v-for="t in dennyList" :key="t" :value="t">{{t}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item itemWidth="242px">
            <let-input v-model="addIp.addAllow" :placeholder="$t('idc.update.addIp')" size="small"></let-input>
        </let-form-item>
        <let-button theme="primary"  size="small" @click="addAllowIp">{{$t('operate.add')}}</let-button>
        <let-form-item itemWidth="242px" style="margin-left: 40px">
          <let-input v-model="addIp.addDenny" :placeholder="$t('idc.update.addIp')" size="small"></let-input>
        </let-form-item>
        <let-button theme="primary"  size="small" @click="addDennyIp">{{$t('operate.add')}}</let-button>
      </let-form>
    </let-modal>


  </div>
</template>

<script>
export default {
  name: "OperationIDCManage",
  data() {
    return {
      showManualAddItem: false,
      items: [],
      query: {
        group_name: ''
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false,
      },
      ipOrders: [
        "denny_allow",
        "allow_denny"
      ],
      allowList:[],
      dennyList:[],
      addIp:{
        addAllow:"",
        addDenny:""
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/query_idc', this.query).then((data) => {
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
    getIpList(str){
      const arr = [];
      if (str.trim()!=""){
        str.split("|").forEach((item) => {
          arr.push(item.trim())
        });
      }
      return arr;
    },
    addGroup() {
      this.allowList =[];
      this.dennyList =[]
      this.detailModal.model = {
        group_name: '',
        group_name_cn: '',
        ip_order: 'denny_allow',
        allow_ip_rule: '',
        denny_ip_rule: '',
        allowList:[],
        dennyList:[]
      };
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    editItem(row) {
      const allowList = this.getIpList(row.allow_ip_rule);
      const dennyList = this.getIpList(row.denny_ip_rule);
      this.detailModal.model={
        allowList:[],
        dennyList:[]
      }
      this.detailModal.model = Object.assign({}, this.detailModal.model, row);
      this.allowList = allowList;
      this.dennyList = dennyList;
      allowList.forEach((item)=>{
        this.detailModal.model.allowList.push(item)
      })
      dennyList.forEach((item)=>{
        this.detailModal.model.dennyList.push(item)
      })
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },

    removeItem(row) {
      this.$confirm(this.$t('idc.delete.confirmTips'),this.$t('common.alert')).then(()=>{
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/delete_idc',row).then(()=>{
          loading.hide();
          this.fetchData().then(()=>{
            this.$tip.success(this.$t("common.success"));
          })
        }).catch((err)=>{
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        })
      })
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const item = this.detailModal.model;
        const url =  this.detailModal.isNew ? "/server/api/add_idc" : "/server/api/update_idc";
        const loading = this.$Loading.show();
        this.$ajax.postJSON(url,item).then(()=>{
          loading.hide();
          this.$tip.success(this.$t('common.success'));
          this.closeDetailModal();
          this.fetchData();
        }).catch((err)=>{
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        })
      }
    },
    //关闭弹窗
    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
      this.detailModal.isNew = false;
    },
    //添加白名单
    addAllowIp(){
      if (this.validIp(this.addIp.addAllow)) {
        //已经添加
        if(this.allowList.includes(this.addIp.addAllow)&&
            this.detailModal.model.allowList.includes(this.addIp.addAllow)){
            this.$tip.error(`${this.$t('idc.update.exists')}`)
          return ;
        }else if (this.allowList.includes(this.addIp.addAllow)&&
            !this.detailModal.model.allowList.includes(this.addIp.addAllow)){
          this.detailModal.model.allowList.push(this.addIp.addAllow);
          this.addIp.addAllow = "";
        }else{
          this.allowList.push(this.addIp.addAllow);
          this.detailModal.model.allowList.push(this.addIp.addAllow);
          this.addIp.addAllow = "";
        }
      } else {
        this.$tip.error(`${this.$t('idc.update.errorIp')}`)
      }
    },
    //添加黑名单
    addDennyIp(){
      if(this.validIp(this.addIp.addDenny)){
        //已经添加
        if(this.dennyList.includes(this.addIp.addDenny)&&
            this.detailModal.model.dennyList.includes(this.addIp.addDenny)){
          this.$tip.error(`${this.$t('idc.update.exists')}`)
          return ;
        }else if (this.dennyList.includes(this.addIp.addDenny)&&
            !this.detailModal.model.dennyList.includes(this.addIp.addDenny)){
          this.detailModal.model.dennyList.push(this.addIp.addDenny)
          this.addIp.addDenny ="";
        }else{
          this.dennyList.push(this.addIp.addDenny);
          this.detailModal.model.dennyList.push(this.addIp.addDenny)
          this.addIp.addDenny ="";
        }
      }else{
        this.$tip.error(`${this.$t('idc.update.errorIp')}`)
      }

    },
    //校验ip是否可用(最后一位支持'*')
    validIp(str) {
      let ipReg = new RegExp("^(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|[1-9])\\.(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\." +
          "(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\.((1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)|\\*)$");
      return ipReg.test(str);
    }
  }
}
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

.let-form.two-columns.let-form-cols-2 {
  margin-right: -30px;

.let-form-item {
  padding-right: 30px;
}

}

}

.hideFir td:first-child {
  display: none;
}

.hideFir th:first-child {
  display: none;
}

</style>
