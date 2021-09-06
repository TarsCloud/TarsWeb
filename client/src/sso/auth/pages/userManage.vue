<template>

  <div style="margin: 20px auto;overflow:auto;">

   <let-form inline itemWidth="200px" @submit.native.prevent="search">

    <div style="float:center">
      <let-button size="small" theme="primary"  @click="addItem">{{$t('auth.addPrivilege')}}</let-button>
      &nbsp;&nbsp;
      &nbsp;&nbsp;
      <let-button v-if="!enableLdap" size="small" theme="primary" @click="addUser">{{$t('auth.addUser')}}</let-button>
      &nbsp;&nbsp;
      &nbsp;&nbsp;
      <let-button size="small" theme="danger"  @click="delUser">{{$t('auth.delUser')}}</let-button>
    </div>

      <let-form-item :label="$t('auth.uid')">
        <let-input size="middle" v-model="query.uid"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('ssoCommon.search')}}</let-button>
      </let-form-item>
    </let-form>

    <let-table :data="userListShow" stripe :empty-msg="$t('ssoCommon.nodata')" :title="$t('auth.userManageTitle')">

      <let-table-column width="5%">
        <template slot="head" slot-scope="props">
          <let-checkbox v-model="isCheckedAll"></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox v-model="scope.row.isChecked" :value="scope.row.uid"></let-checkbox>
        </template>

      </let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.userTime')" prop="update_time" width="30%"></let-table-column>
      <let-table-column width="60%" :title="$t('auth.privileges')">
        <template slot-scope="scope">
           <let-tag style="center" closable v-for="(auth, index) in scope.row.authorization" v-bind:key="index" @close="delItem(scope.row.uid, auth)">{{auth.flag + ' : ' + auth.role}}</let-tag>
        </template>
      </let-table-column>
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


    <let-modal :title="dialogAuthTitle" v-model="showAuthDialog" width="600px" @on-cancel="onClose" @on-confirm="onAuthConfirm" >
      <div>
        <let-form itemWidth="100%" ref="editAuthForm" labelWidth="100%">
          <let-input type="hidden" v-model="dialogAuth.id"></let-input>
          <let-form-item :label="$t('auth.role')" required>
            <let-select v-model="dialogAuth.role">
              <let-option value="admin">admin</let-option>
              <let-option value="operator">operator</let-option>
              <let-option value="developer">developer</let-option>
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('auth.uid')" required>
            <let-select v-model="dialogAuth.uid" filterable>
              <let-option v-for="id in userList" :value="id.uid" :key="id.uid">{{id.name || id.uid}}</let-option>
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('auth.flag')" required>
            <let-input size="middle"
               v-model="dialogAuth.flag"
               required
               :required-tip="$t('auth.flagTips')"
            ></let-input>
          </let-form-item>
        </let-form>
      </div>
    </let-modal>
  </div>
</template>

<script>
import sha1 from 'sha1';
import moment from 'moment';

export default {
  name: 'userPage',
  data() {
    return {
      uid: '',
      query:{
        uid: '',
      },
      isCheckedAll: false,
      userList: [],
      userListShow: [],
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
      //弹出框相关数据
      dialogAuthTitle: '',
      showAuthDialog: false,
      dialogAuth:{
        id: '',
        flag: '',
        role: '',
        uid: '',
      },
      enableLdap: false
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
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
    search(){
      this.page = 1; 
      this.uid = this.query.uid;
      var userList = [];
      if(this.uid) {
        userList = this.userList.filter(id=>{
          return id.uid.indexOf(this.query.uid) != -1;
        })
      } else {
        userList = this.userList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
      }

      this.isCheckedAll = false;
      userList.forEach((auth)=>{
        auth.isChecked = false;
        auth.update_time = moment(auth.update_time).format("YYYY-MM-DD HH:mm:ss");
      });
      this.userListShow = userList;
    },
    getUserList() {
      const loading = this.$Loading.show();

      this.$ajax.getJSON('/server/api/auth/page/getUserIdList').then((data)=>{
        loading.hide();

        data.forEach((user)=>{
          user.isChecked = false;
          user.role = JSON.stringify(user.authorization)
        })
        this.userList =  data;
        this.totalCount = data.length;
        this.search();
      }).catch((err) => {
          loading.hide();

          this.$tip.error(`${this.$t('auth.loadUserIdError')}: ${err.err_msg || err.message}`);
        })
    },
    changePage(val){
      this.page = val
    },
   addItem(){
      this.dialogAuthTitle = this.$t('auth.addPrivilege');
      this.showAuthDialog = true;
      this.dialogAuth.id = '';
      this.dialogAuth.flag = '';
      this.dialogAuth.role = '';
      this.dialogAuth.uid = '';
    },
   delItem(uid, authorization){
      this.$confirm(this.$t('auth.confirmDelete'), this.$t('ssoCommon.confirmTitle')).then(()=>{
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/auth/page/pageDeleteAuth', {uid: uid, role: authorization.role, flag: authorization.flag}).then((data)=>{
            loading.hide();
            this.$tip.success(this.$t('auth.delSucc'));
            this.getUserList();
            // this.search();
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('auth.delError')}: ${err.err_msg || err.message}`);
        })
      })
    },
   onAuthConfirm(){
      if(!this.$refs.editAuthForm.validate()){
        return;
      }
      var uids = this.dialogAuth.uid?this.dialogAuth.uid.split(/;|,/g) : [];
      var params = [];
      uids.forEach((uid)=>{
        if(uid){
          params.push({
            flag: this.dialogAuth.flag,
            role: this.dialogAuth.role,
            uid: uid
          })
        }
      });
      const loading = this.$Loading.show();
      var url = '/server/api/auth/page/addAuth';
      this.$ajax.postJSON(url, {auth: params}).then((data)=>{
          loading.hide();
          this.showDialog=false;
         this.$tip.success(this.dialogTitle + this.$t('ssoCommon.success'));
         this.getUserList();
          // this.search();
       }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.dialogTitle}${this.$t('ssoCommon.failed')}: ${err.err_msg || err.message}`);
      })
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
            password: sha1(this.dialog.password),
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
              ids.push(auth.uid);
            }
        });
        if(!ids.length){
          this.$tips.error(this.$t('auth.selectRecord'));
          return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/auth/page/pageDeleteUser', {uids: ids}).then((data)=>{
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
