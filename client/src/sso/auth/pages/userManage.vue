<template>

  <div style="margin: 20px auto;overflow:auto;">

    <div style="float:center" v-if="!enableLdap">
      <let-button size="small" theme="primary" @click="addUser">{{$t('auth.addUser')}}</let-button>
      &nbsp;&nbsp;
      <let-button size="small" theme="danger"  @click="delUser">{{$t('auth.delUser')}}</let-button>
    </div>
    <let-table :data="userListShow" stripe :empty-msg="$t('ssoCommon.nodata')" :title="$t('auth.userManageTitle')">
      <let-table-column width="5%">
        <template slot="head" slot-scope="props">
          <let-checkbox v-model="isCheckedAll"></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>
        </template>
      </let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.userTime')" prop="update_time" width="30%"></let-table-column>
      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('ssoCommon.prevPage')" :next-text="$t('ssoCommon.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>

    <let-modal :title="dialogTitle" v-model="showDialog" width="600px" @on-cancel="onClose" @on-confirm="onConfirm" >
      <div>
        <let-form itemWidth="100%" ref="editForm">
          <let-input type="hidden" v-model="dialog.id"></let-input>
          <let-form-item :label="$t('auth.uid')">
            <let-input size="small"
               v-model="dialog.uid"
               required
               :required-tip="$t('auth.uidTips')"
            ></let-input>
          </let-form-item>
        <let-form-item :label="$t('pass.password')" required>
          <let-input
            type="password"
            size="small"
            v-model="dialog.password"
            required
            :required-tip="$t('pass.passwordTips')"
          ></let-input>
        </let-form-item>           
        </let-form>
      </div>
    </let-modal>

  </div>
</template>

<script>

import moment from 'moment';

export default {
  name: 'userPage',
  data() {
    return {
      isCheckedAll: false,
      userList: [],
      totalCount: 0,
      page: 1,
      eachPageCount: 20,
      password: '',
      //弹出框相关数据
      dialogTitle: '',
      showDialog: false,
      dialog:{
        id: '',
        uid: '',
        password: ''
      },
      enableLdap: false
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
    },
    userListShow(){
      var userList = this.userList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
      this.isCheckedAll = false;
      userList.forEach((auth)=>{
        // console.log(auth);
        auth.isChecked = false;
        auth.update_time = moment(auth.update_time).format("YYYY-MM-DD HH:mm:ss");
      });
      return userList;
    }
  },

  methods: {
    // 获取是否启用LDAP用户库
    getEnableLdap() {
      this.$ajax.getJSON('/server/api/isEnableLdap').then(data => {
        
        if(data) {
          this.enableLdap = data.enableLdap
        }
      }).catch(err => {
        console.log(`get enableLdap:`, err);
      })
    },
    getUserList() {
      const loading = this.$Loading.show();

      this.$ajax.getJSON('/server/api/auth/page/getUserIdList').then((data)=>{
        loading.hide();

        data.forEach((user)=>{
          user.isChecked = false;
        })
        this.userList =  data;
        this.totalCount = data.length;
      }).catch((err) => {
          loading.hide();

          this.$tip.error(`${this.$t('auth.loadUserIdError')}: ${err.err_msg || err.message}`);
        })
    },
    changePage(val){
      this.page = val
    },
    addUser(){
      this.dialogTitle = this.$t('auth.addUser');
      this.showDialog = true;
      this.dialog.id = '';
      this.dialog.uid = '';
      this.dialog.password = '';
    },
    onConfirm(){
      if(!this.$refs.editForm.validate()){
        return;
      }
      var uids = this.dialog.uid?this.dialog.uid.split(/;|,/g) : [];
      var params = [];
      uids.forEach((uid)=>{
        if(uid){
          params.push({
            uid: uid,
            password: this.dialog.password,
          })
        }
      });
      const loading = this.$Loading.show();
      var url = '/server/api/auth/page/addUser';
      this.$ajax.postJSON(url, {user: params}).then((data)=>{
          loading.hide();
          this.showDialog=false;
          this.$tip.success(this.dialogTitle + this.$t('ssoCommon.success'));
          this.getUserList();
       }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.dialogTitle}${this.$t('ssoCommon.failed')}: ${err.err_msg || err.message}`);
      })
    },
    onClose(){},
    delUser(){
      this.$confirm(this.$t('auth.confirmDelete'), this.$t('ssoCommon.confirmTitle')).then(()=>{
        var ids = [];
        this.userListShow.forEach((auth)=>{
            if(auth.isChecked === true){
              if(auth.uid == 'admin') {
                this.$tip.error(this.$t('auth.adminDelError'));
                return;
              }
              ids.push(auth.id);
            }
        });
        if(!ids.length){
          this.$tips.error(this.$t('auth.selectRecord'));
          return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/auth/page/pageDeleteUser', {id: ids}).then((data)=>{
            loading.hide();
            this.$tip.success(this.$t('auth.delSucc'));
            this.getUserList();
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('auth.delError')}: ${err.err_msg || err.message}`);
        })
      })
    },
  },
  mounted(){
    this.getEnableLdap();
    this.getUserList();
  },
  watch:{
    isCheckedAll() {
      const isCheckedAll = this.isCheckedAll;
      this.userListShow.forEach((item) => {
          item.isChecked = isCheckedAll;
      });
    },
    // 如果路由有变化，会再次执行该方法
    "$route": function(to, end) {
      this.getUserList();
    } 
  },
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
