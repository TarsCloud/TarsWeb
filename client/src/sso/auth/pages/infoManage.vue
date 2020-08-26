<template>

  <div style="margin: 20px auto;overflow:auto;">

    <let-table :data="authListShow" stripe :empty-msg="empty_msg">
      <let-table-column :title="$t('auth.role')" prop="role" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.uid')" prop="uid" width="20%"></let-table-column>
      <let-table-column :title="$t('auth.flag')" prop="flag" width="15%"></let-table-column>

      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('ssoCommon.prevPage')" :next-text="$t('ssoCommon.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>
  </div>
</template>

<script>
export default {
  name: 'infoPage',
  data() {
    return {
      authList: [],
      isAdmin: false,
      totalCount: 0,
      page: 1,
      eachPageCount: 20,
      empty_msg: ''
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
  methods: {
    getAuthList(){
      const loading = this.$Loading.show();
      this.$ajax.getJSON('/server/api/getMyAuthList').then((data)=>{
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
      this.$ajax.getJSON('/server/api/isAdmin').then((data) => {
        this.isAdmin = data.admin;
        if(this.isAdmin) {
          this.empty_msg = this.$t('ssoCommon.admin');
        } else {
          this.empty_msg = this.$t('ssoCommon.nodata');
        }
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
  .top-title{
    margin: 16px 0;
    line-height: 2.5;
    font-size: 18px;
    border-bottom: 1px solid #c5d9e8;
  }
</style>
