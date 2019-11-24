<template>
  <div class="index-page">
    <h1 class="top-title">
      {{$t('index.indexInfo')}}
      <div class="locale-wrap">
        <locale-select></locale-select>
      </div>
      <let-button size="small" theme="danger" v-if="isAdmin" @click="userManage">{{$t('index.userManage')}}</let-button>
      <let-button size="small" theme="primary" v-if="isAdmin" @click="viewAuth">{{$t('index.viewAuth')}}</let-button>
      <let-button size="small" theme="danger" @click="modifyPass">{{$t('index.modifyPass')}}</let-button>
    </h1>
    <let-table :data="authListShow" stripe :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('auth.role')" prop="role" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.flag')" prop="flag" width="15%"></let-table-column>

      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('common.prevPage')" :next-text="$t('common.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>

    <!-- <div>

    </div> -->
  </div>
</template>

<script>
import localeSelect from '../../components/locale-select.vue';
export default {
  name: 'indexPage',
  data() {
    return {
      authList: [],
      isAdmin: false,
      totalCount: 0,
      page: 1,
      eachPageCount: 20
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
    },
    authListShow(){
      return this.authList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
    }
  },
  components: {
    localeSelect
  },
  methods: {
    viewAuth() {
      location.href = "/auth.html";
    },
    modifyPass(){
      location.href = "/pass.html";
    },
    userManage() {
      location.href = "/auth.html#/user";
    },
    getAuthList(flag, role, uid){
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/api/auth/getAuthListByUid').then((data)=>{
        loading.hide();
        this.authList = data;
        this.totalCount = data.length;
    }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('auth.loadListError')}: ${err.err_msg || err.message}`);
      })
    },
    changePage(val){
      this.page = val
    },
    checkAdmin(){
      this.isAdmin = false; 
      this.$ajax.getJSON('/api/isAdmin').then((data) => {
        this.isAdmin = data.admin;
        // alert(this.isAdmin);
      }).catch((err) => {
      });
    },    
  },
  mounted(){
    this.checkAdmin();
    this.getAuthList();
  }  
};
</script>

<style>
  @import "../../assets/font/lato/Lato.css";
  @import '../../assets/css/reset.css';
  @import '../../assets/css/variable.css';
  .top-title{
    margin: 16px 0;
    line-height: 2.5;
    font-size: 18px;
    border-bottom: 1px solid #c5d9e8;
    position:relative;
  }
  .index-page{
    width: 1000px;
    margin: 100px auto;
  }
  .locale-wrap{
    position:absolute;
    right: 10px;
    top: -5px;
  }
</style>
