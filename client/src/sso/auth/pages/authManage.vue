<template>
  <div style="margin: 20px auto;overflow:auto;">
    <div style="float:center">
      <let-button size="small" theme="primary"  @click="addItem">{{$t('auth.addPrivilege')}}</let-button>
      &nbsp;&nbsp;
      <let-button size="small" theme="danger"  @click="delItem">{{$t('auth.delPrivilege')}}</let-button>
    </div>
    <let-form inline itemWidth="200px" @submit.native.prevent="search">

      <let-form-item :label="$t('auth.role')">
        <let-select v-model="query.role">
          <let-option value="">{{$t('auth.role')}}</let-option>
          <let-option value="admin">admin</let-option>
          <let-option value="operator">operator</let-option>
          <let-option value="developer">developer</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('auth.uid')">
        <let-select v-model="query.uid" filterable>
          <!-- <let-option value="">{{$t('auth.uid')}}</let-option> -->
          <let-option v-for="(id, index) in userIds" :value="id.uid" :key="index">{{id.name || id.uid}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('auth.flag')">
        <let-input size="middle" v-model="query.flag"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('ssoCommon.search')}}</let-button>
      </let-form-item>
    </let-form>
    <let-table :data="authListShow" stripe :empty-msg="$t('ssoCommon.nodata')" :title="$t('auth.privilegeManageTitle')">
      <let-table-column width="2%">
        <template slot="head" slot-scope="props">
          <let-checkbox v-model="isCheckedAll"></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox v-model="scope.row.isChecked" :value="scope.row.id"></let-checkbox>
        </template>
      </let-table-column>
      <let-table-column :title="$t('auth.role')" prop="role" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.flag')" prop="flag" width="15%"></let-table-column>

      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('ssoCommon.prevPage')" :next-text="$t('ssoCommon.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>


    <let-modal :title="dialogTitle" v-model="showDialog" width="600px" @on-cancel="onClose" @on-confirm="onConfirm" >
      <div>
        <let-form itemWidth="100%" ref="editForm" labelWidth="100%">
          <let-input type="hidden" v-model="dialog.id"></let-input>
          <let-form-item :label="$t('auth.role')" required>
            <let-select v-model="dialog.role">
              <let-option value="admin">admin</let-option>
              <let-option value="operator">operator</let-option>
              <let-option value="developer">developer</let-option>
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('auth.uid')" required>
            <let-select v-model="dialog.uid" filterable>
              <let-option v-for="(id, index) in userIds" :value="id.uid" :key="index">{{id.name || id.uid}}</let-option>
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('auth.flag')" required>
            <let-input size="middle"
               v-model="dialog.flag"
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

export default {
  name: 'authPage',
  data() {
    return {
      query:{
        flag: '',
        role: '',
        uid: '',
      },
      isCheckedAll: false,
      authList: [],
      spinning: false,
      sortField: 1,
      sortRule: 0,
      totalCount: 0,
      page: 1,
      eachPageCount: 20,
      userIds: [],

      //弹出框相关数据
      dialogTitle: '',
      showDialog: false,
      dialog:{
        id: '',
        flag: '',
        role: '',
        uid: '',
      }
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
    },
    authListShow(){
      var authList = this.authList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
      this.isCheckedAll = false;
      authList.forEach((auth)=>{
        auth.isChecked = false;
      });
      return authList;
    }
  },
  activated() {
    this.getIdList();
  },
  methods: {
    search(){
      this.getAuthList(this.query.flag, this.query.role, this.query.uid);
    },
    getAuthList(flag, role, uid){
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/server/api/auth/page/getAuthList', {flag: flag||'', role:role||'', uid: uid||''}).then((data)=>{
        loading.hide();
        data.forEach((auth)=>{
          auth.isChecked = false;
        })
        this.authList = data;
      this.totalCount = data.length;
    }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('auth.loadListError')}: ${err.err_msg || err.message}`);
      })
    },
    getIdList() {
      this.userIds = [];
      this.$ajax.getJSON('/server/api/auth/page/getUserIdList').then((data)=>{
        this.userIds = data;
        // data.forEach((user)=>{
        //   this.userIds.push(user.uid);
        // })
    }).catch((err) => {
        this.$tip.error(`${this.$t('auth.loadUserIdError')}: ${err.err_msg || err.message}`);
      })
    },
    changePage(val){
      this.page = val
    },
    addItem(){
      this.dialogTitle = this.$t('auth.addPrivilege');
      this.showDialog = true;
      this.dialog.id = '';
      this.dialog.flag = '';
      this.dialog.role = '';
      this.dialog.uid = '';
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
            flag: this.dialog.flag,
            role: this.dialog.role,
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
          this.search();
       }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.dialogTitle}${this.$t('ssoCommon.failed')}: ${err.err_msg || err.message}`);
      })
    },
    onClose(){},
    delItem(){
      this.$confirm(this.$t('auth.confirmDelete'), this.$t('ssoCommon.confirmTitle')).then(()=>{
        var ids = [];
        this.authListShow.forEach((auth)=>{
            if(auth.isChecked === true){
              ids.push(auth.id);
            }
        });
        if(!ids.length){
          this.$tips.error(this.$t('auth.selectRecord'));
          return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/auth/page/pageDeleteAuth', {id: ids}).then((data)=>{
            loading.hide();
            this.$tip.success(this.$t('auth.delSucc'));
            this.search();
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('auth.delError')}: ${err.err_msg || err.message}`);
        })
      })
    }
  },
  mounted(){
    // this.getIdList();
    this.getAuthList();
  },
  watch:{
    isCheckedAll() {
      const isCheckedAll = this.isCheckedAll;
      this.authListShow.forEach((item) => {
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
