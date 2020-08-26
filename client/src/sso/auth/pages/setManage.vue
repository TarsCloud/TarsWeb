<template>

  <div style="margin: 20px auto;overflow:auto;">

    <let-table :data="setListShow" stripe :empty-msg="$t('ssoCommon.nodata')" :title="$t('auth.setManageTitle')">
      <let-table-column :title="$t('auth.setTitle')" prop="title" width="15%"></let-table-column>
      <let-table-column :title="$t('auth.valid')" prop="valid" width="10%">
        <template slot-scope="scope">
          <let-switch v-model="scope.row.valid" @change="onSetValid(scope.row)">
            <span slot="open">Open</span>
            <span slot="close">Close</span>
          </let-switch>
        </template>
      </let-table-column>
      <let-table-column :title="$t('auth.about')" prop="about_cn" width="60%">
        <template slot-scope="scope">
          <span>{{scope.row.about_cn}}</span><br>
          <span>{{scope.row.about_en}}</span>
        </template>
      </let-table-column>
                  
      <let-table-column :title="$t('auth.operator')"  width="15%">
        <template slot-scope="scope">
          <let-table-operation @click="editSet(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="viewSet(scope.row)">{{$t('operate.view')}}</let-table-operation>
        </template>
      </let-table-column>
      <let-pagination slot="pagination" align="right" v-if="pageCount > 0"  :prev-text="$t('ssoCommon.prevPage')" :next-text="$t('ssoCommon.nextPage')"
                      :total="pageCount" :page="page" @change="changePage">
      </let-pagination>
    </let-table>

    <let-modal :title="dialogTitle" v-model="showDialog" width="600px" @on-cancel="onClose" @on-confirm="onConfirm" >
      <div>
        <let-form itemWidth="100%" ref="editForm">
          <let-form-item :label="$t('auth.setTitle')" required>
            <let-input v-model="dialog.title" disabled required :required-tip="$t('ssoCommon.notEmpty')"></let-input>
          </let-form-item>
          <let-form-item :label="$t('auth.setInfo')" required>
            <let-input v-model="dialog.info" type="textarea" :rows="10" required :required-tip="$t('ssoCommon.notEmpty')" placeholder="{ title: 'abcd' }"></let-input>
          </let-form-item>
        </let-form>
      </div>
    </let-modal>

    <let-modal v-model="viewModal.show" :title="$t('cfg.msg.viewContent')" width="800px">
      <div class="pre_con">
        <pre v-if="viewModal.model">{{viewModal.model.info}}</pre>
      </div>
      <div slot="foot"></div>
    </let-modal>

  </div>
</template>

<script>

import moment from 'moment';

export default {
  name: 'setPage',
  data() {
    return {
      setList: [],
      totalCount: 0,
      page: 1,
      eachPageCount: 30,
      set: '',
      expireTime: '',
      //弹出框相关数据
      dialogTitle: '',
      showDialog: false,
      dialog:{
        title: '',
        info: '',
      },
      viewModal: {
        show: false,
        model: null,
      },
    };
  },
  computed:{
    pageCount(){
      return Math.ceil(this.totalCount / this.eachPageCount);
    },
    setListShow(){
      var userList = this.setList.slice((this.page-1) * this.eachPageCount, this.page * this.eachPageCount);
      userList.forEach((auth)=>{
        auth.update_time = moment(auth.update_time).format("YYYY-MM-DD HH:mm:ss");
      });
      return userList;
    }
  },

  methods: {
    getSetList() {
      const loading = this.$Loading.show();

      this.$ajax.getJSON('/server/api/auth/page/getSetList').then((data)=>{
        
        loading.hide();

        this.setList =  data;
        this.totalCount = data.length;
      }).catch((err) => {
          loading.hide();

          this.$tip.error(`${this.$t('auth.loadSetError')}: ${err.err_msg || err.message}`);
        })
    },
    onSetValid(set) {
      this.$confirm(this.$t('auth.setSetValid')).then(() => {

        const loading = this.$Loading.show();

        this.$ajax.postJSON('/server/api/auth/page/setSetValid', {id: set.id, valid: 1 - (set.valid ? 0 : 1 ) }).then((data)=>{
          
          loading.hide();

          this.getSetList();

          this.$tip.success(`${this.$t('auth.setSetSucc')}`);

        }).catch((err) => {
            loading.hide();

            this.$tip.error(`${this.$t('auth.setSetError')}: ${err.err_msg || err.message}`);
          })   
        }).catch(()=>{
          set.valid = 1-set.valid;
        })
    },
    isSetValid(valid) {
      return valid == 1? this.$t("auth.notValid"): this.$t("auth.valid");
    },
    changePage(val){
      this.page = val
    },
    viewSet(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },
    editSet(d) {
      this.dialogTitle = this.$t('auth.editSet')
      this.dialog = d
      this.showDialog = true
    },
    onConfirm(){
      if(!this.$refs.editForm.validate()){
        return;
      }

      try {
        JSON.parse(this.dialog.info) 
      }
      catch(e) {
        this.$tip.error("config content must be json!" + e);
        return;
      }

      const loading = this.$Loading.show();
      var url = '/server/api/auth/page/updateSet';
      this.$ajax.postJSON(url, this.dialog).then((data)=>{
          loading.hide();
          this.showDialog=false;
          this.$tip.success(this.dialogTitle + this.$t('ssoCommon.success'));
          this.getSetList();
       }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.dialogTitle}${this.$t('ssoCommon.failed')}: ${err.err_msg || err.message}`);
      })
    },
    onClose(){},
  },
  mounted(){
    this.getSetList();
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
  .pre_con{display: block;margin-top:20px;word-break: break-all;}
  .pre_con pre{display: block;white-space: pre-wrap;}

</style>
