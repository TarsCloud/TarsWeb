<template>

  <div style="margin: 20px auto;overflow:auto;">

    <div style="float:center">
      <let-button size="small" theme="primary" @click="addToken">{{$t('auth.addToken')}}</let-button>
      &nbsp;&nbsp;
      <let-button size="small" theme="danger"  @click="delToken">{{$t('auth.delToken')}}</let-button>
    </div>
    <let-table :data="tokenListShow" stripe :empty-msg="$t('ssoCommon.nodata')" :title="$t('auth.tokenManageTitle')">
      <let-table-column width="5%">
        <template slot="head" slot-scope="props">
          <let-checkbox v-model="isCheckedAll"></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>
        </template>
      </let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="10%"></let-table-column>
      <let-table-column :title="$t('auth.token')" prop="token" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.tokenExpireTime')" prop="expire_time" width="15%"></let-table-column>
      <let-table-column :title="$t('auth.tokenTime')" prop="update_time" width="15%"></let-table-column>
      <let-table-column :title="$t('auth.status')" prop="validDesc" width="5%"></let-table-column>
      <let-table-column :title="$t('auth.operator')"  width="5%">
        <template slot-scope="scope">
            <let-table-operation  @click="onTokenValid(scope.row)"><let-tooltip style="width: 150px;" :content="isTokenValid(scope.row.valid)">{{isTokenValid(scope.row.valid)}}</let-tooltip></let-table-operation>
          <!-- </span> -->
        </template>
      </let-table-column>
      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('ssoCommon.prevPage')" :next-text="$t('ssoCommon.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>

    <let-modal :title="dialogTitle" v-model="showDialog" width="600px" @on-cancel="onClose" @on-confirm="onConfirm" >
      <div>
        <let-form itemWidth="100%" ref="editForm">
          <let-form-item :label="$t('auth.tokenExpireTime')">
            <let-datetime-picker v-model="dialog.expire_time" required :required-tip="$t('auth.tokenTips')"></let-datetime-picker>
          </let-form-item>
        </let-form>
      </div>
    </let-modal>

  </div>
</template>

<script>

import moment from 'moment';

export default {
  name: 'tokenPage',
  data() {
    return {
      isCheckedAll: false,
      tokenList: [],
      totalCount: 0,
      page: 1,
      eachPageCount: 30,
      token: '',
      expireTime: '',
      //弹出框相关数据
      dialogTitle: '',
      showDialog: false,
      dialog:{
        expire_time: '',
      }
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
    },
    tokenListShow(){
      var userList = this.tokenList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
      this.isCheckedAll = false;
      userList.forEach((auth)=>{
        // console.log(auth);
        auth.isChecked = false;
        auth.validDesc = auth.valid == 1? this.$t("auth.valid"): this.$t("auth.notValid");
        auth.expire_time = moment(auth.expire_time).format("YYYY-MM-DD HH:mm:ss");
        auth.update_time = moment(auth.update_time).format("YYYY-MM-DD HH:mm:ss");
      });
      return userList;
    }
  },

  methods: {
    getTokenList() {
      const loading = this.$Loading.show();

      this.$ajax.getJSON('/server/api/auth/getTokenList').then((data)=>{
        
        loading.hide();

        data.forEach((user)=>{
          user.isChecked = false;
        })
        this.tokenList =  data;
        this.totalCount = data.length;
      }).catch((err) => {
          loading.hide();

          this.$tip.error(`${this.$t('auth.loadTokenError')}: ${err.err_msg || err.message}`);
        })
    },
    onTokenValid(token) {
      this.$confirm(this.$t('auth.setTokenValid')).then(() => {

        const loading = this.$Loading.show();

        this.$ajax.postJSON('/server/api/auth/setTokenValid', {id: token.id, valid: 1-token.valid}).then((data)=>{
          
          loading.hide();

          this.getTokenList();

          this.$tip.success(`${this.$t('auth.setTokenSucc')}`);

        }).catch((err) => {
            loading.hide();

            this.$tip.error(`${this.$t('auth.setTokenError')}: ${err.err_msg || err.message}`);
          })   
        })
    },
    isTokenValid(valid) {
      return valid == 1? this.$t("auth.notValid"): this.$t("auth.valid");
    },
    changePage(val){
      this.page = val
    },
    addToken(){
      this.dialogTitle = this.$t('auth.addToken');
      this.showDialog = true;
      this.dialog.expire_time = '';
    },
    onConfirm(){
      if(!this.$refs.editForm.validate()){
        return;
      }
      const loading = this.$Loading.show();
      var url = '/server/api/auth/addToken';
      this.$ajax.postJSON(url, {expire_time: this.dialog.expire_time}).then((data)=>{
          loading.hide();
          this.showDialog=false;
          this.$tip.success(this.dialogTitle + this.$t('ssoCommon.success'));
          this.getTokenList();
       }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.dialogTitle}${this.$t('ssoCommon.failed')}: ${err.err_msg || err.message}`);
      })
    },
    onClose(){},
    delToken(){
      this.$confirm(this.$t('auth.confirmTokenDelete'), this.$t('auth.confirmTokenTitle')).then(()=>{
        var ids = [];
        this.tokenListShow.forEach((auth)=>{
            if(auth.isChecked === true){
              ids.push(auth.id);
            }
        });
        if(!ids.length){
          this.$tips.error(this.$t('auth.selectRecord'));
          return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/auth/deleteToken', {id: ids}).then((data)=>{
            loading.hide();
            this.$tip.success(this.$t('auth.delSucc'));
            this.getTokenList();
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('auth.delError')}: ${err.err_msg || err.message}`);
        })
      })
    }
  },
  mounted(){
    this.getTokenList();
  },
  watch:{
    isCheckedAll() {
      const isCheckedAll = this.isCheckedAll;
      this.tokenListShow.forEach((item) => {
          item.isChecked = isCheckedAll;
      });
    },
  }
};
</script>
<style>
  .top-title{
    margin: 16px 0;
    line-height: 2.5;
    font-size: 18px;
    border-bottom: 1px solid #c5d9e8;
  }
</style>
