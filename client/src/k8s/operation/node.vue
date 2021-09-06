<template>
  <div class="page_base_node">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('filter.title.node')">
        <let-input size="small" v-model="query.NodeName"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>

      <let-form-item itemWidth="500px">
        <let-tag type="success">{{$t('filter.title.nodeAffinity')}}</let-tag>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">

      <let-table-column :title="$t('filter.title.nodeName')" prop="NodeName"></let-table-column>
      <let-table-column :title="$t('filter.title.nodeAbility')">
        <template slot-scope="scope">{{ scope.row.NodeAbility.join(',') }}</template>
      </let-table-column>
      <let-table-column :title="$t('filter.title.nodePublic')">
        <template slot-scope="scope">
          <let-switch v-model="scope.row.NodePublic" @change="changeStatus(scope.row)">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </let-switch>
        </template>
      </let-table-column>
      <let-table-column :title="$t('filter.title.nodeLabels')"  width="300px">
        <template slot-scope="scope">
          <div v-for="(item, key) in scope.row.Labels" :key="key">{{  key + ":" + item }}</div>
        </template>
      </let-table-column>
      <let-table-column :title="$t('filter.title.nodeAddress')"  width="350px">
        <template slot-scope="scope">
          <div v-for="item in scope.row.NodeAddress" :key="item.NodeName">{{ item }}</div>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="viewItem(scope.row)">{{$t('operate.view')}}</let-table-operation>
          <!-- <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation> -->
          <!-- <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation> -->
        </template>
      </let-table-column>
    </let-table>

    <div style="overflow:hidden;">
      <let-pagination align="right" style="float:right;"
        :page="pagination.page" @change="gotoPage"
        :total="pagination.total">
      </let-pagination>
      <!-- <div class="btn_group" style="float:left;">
        <let-button theme="primary" size="small" @click="startData">{{$t('filter.title.startPublic')}}</let-button>
        <let-button theme="primary" size="small" @click="stopData">{{$t('filter.title.stopPublic')}}</let-button>
      </div> -->
    </div>

    <let-modal v-model="viewModal.show" :title="$t('cfg.msg.viewContent')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.NodInfo}}</pre>
      <div slot="foot"></div>
    </let-modal>
<!-- 
    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item :label="$t('filter.title.node')" required>
          <template v-if="detailModal.isNew">
            <let-checkbox v-model="isCheckedAll" :value="isCheckedAll">全选</let-checkbox>
            <div class="node_list">
              <let-checkbox class="node_item" v-for="d in NodeList" :key="d" :value="NodeListArr.indexOf(d) > -1" @change="checkedChange(d)">{{ d }}</let-checkbox>
            </div>
          </template>
          <template v-else>
            <let-input disabled
              size="small"
              v-model="detailModal.model.NodeName"
              :placeholder="$t('deployService.form.placeholder')"
              required
            ></let-input>
          </template>
        </let-form-item>
      </let-form>
    </let-modal> -->
  </div>
</template>

<script>
export default {
  name: 'BaseBusiness',

  data() {
    return {
      // 全选
      isCheckedAll: false,
      query: {
        NodeName: '',
        NodeMark: '',
      },
      items: [],
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total:1,
      },
      NodeList: [],
      // NodeListArr: [],
      // AppServerStr: '',
      viewModal: {
        show: false,
        model: null,
      },
      // detailModal: {
      //   show: false,
      //   model: null,
      //   isNew: false
      // },
      // isTableCheckedAll: false,
      // tableCheckedList: [],
    };
  },

  mounted() {
    this.fetchData()
    this.getNodeList()
  },

  // watch: {
  //   isCheckedAll() {
  //     let isCheckedAll = this.isCheckedAll;
  //     if(isCheckedAll) {
  //       this.NodeList.forEach(item => {
  //         if(this.NodeListArr.indexOf(item) === -1){
  //           this.NodeListArr.push(item)
  //         }
  //       })
  //     }else{
  //       this.NodeListArr = []
  //     }
  //   },
  //   isTableCheckedAll() {
  //     let { isTableCheckedAll } = this
  //     this.items.forEach((item) => {
  //       item.isChecked = isTableCheckedAll
  //     })

  //     if(isTableCheckedAll){
  //       this.tableCheckedList = [].concat(this.items)
  //     }else{
  //       this.tableCheckedList = []
  //     }
  //   },
  // },

  methods: {
    changeStatus(val) {
      if(val.NodePublic){
        this.startData(val.NodeName)
      }else{
        this.stopData(val.NodeName)
      }
    },
    // checkedChange(val) {
    //   if(this.NodeListArr.indexOf(val) > -1){
    //     this.NodeListArr.splice(this.NodeListArr.indexOf(val), 1)
    //   }else{
    //     this.NodeListArr.push(val)
    //   }

    //   if(this.NodeListArr.length === 0){
    //     this.isCheckedAll = false
    //   }
    // },
    // tableCheckChange(val) {
    //   if(this.tableCheckedList.indexOf(val) > -1){
    //     this.tableCheckedList.splice(this.tableCheckedList.indexOf(val), 1)
    //   }else{
    //     this.tableCheckedList.push(val)
    //   }

    //   if(this.tableCheckedList.length === 0){
    //     this.isTableCheckedAll = false
    //   }
    // },

    gotoPage(num) {
      this.pagination.page = num
      this.getServerList()
    },
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/k8s/api/node_select', Object.assign(this.query, {
        page: this.pagination.page,
        size: this.pagination.size,
      })).then((data) => {
        loading.hide();
        // if(data && data.Data) {
        //   data.Data.forEach(item => {
        //     item.isChecked = false
        //   })
        // }
        this.items = data.Data
        this.pagination.total = Math.ceil(data.Count.AllCount / this.pagination.size)
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.pagination.page = 1;
      this.fetchData();
    },

    // closeDetailModal() {
    //   this.$refs.detailForm.resetValid();
    //   this.detailModal.show = false;
    //   this.detailModal.model = null;
    // },

    // addItem() {
    //   this.detailModal.model = {};
    //   this.detailModal.show = true;
    //   this.detailModal.isNew = true;
    // },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    // editItem(d) {
    //   this.detailModal.model = d;
    //   this.detailModal.show = true;
    //   this.detailModal.isNew = false;
    // },

    startData(NodeName) {
      // let { tableCheckedList } = this

      // let NodeName = []
      // if(val){
      //   NodeName = [val]
      // } else{
      //   NodeName = tableCheckedList.filter(item => item.isChecked).map(item => {
      //     return item.NodeName
      //   })
      // }

      this.$ajax.postJSON('/k8s/api/node_start', {
        NodeName,
      }).then(() => {
        this.$tip.success(this.$t('common.success'));
        this.fetchData();
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    stopData(NodeName) {
      // let { tableCheckedList } = this
      
      // let NodeName = []
      // if(val){
      //   NodeName = [val]
      // }else{
      //   NodeName = tableCheckedList.filter(item => item.isChecked).map(item => {
      //     return item.NodeName
      //   })
      // }

      this.$ajax.postJSON('/k8s/api/node_stop', {
        NodeName,
      }).then(() => {
        this.$tip.success(this.$t('common.success'));
        this.fetchData();
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    // saveItem() {
    //   if (this.$refs.detailForm.validate()) {
    //     const model = this.detailModal.model;
        
    //     let url = '/k8s/api/node_update'
    //     let NodeName = model.NodeName
    //     if(this.detailModal.isNew){
    //       url = '/k8s/api/node_add'
    //       NodeName = this.NodeListArr
    //     }

    //     const loading = this.$Loading.show();
    //     this.$ajax.postJSON(url, {
    //       NodeName,
    //       NodeMark: model.NodeMark,
    //     }).then(() => {
    //       loading.hide();
    //       this.$tip.success(this.$t('common.success'));
    //       this.closeDetailModal();
    //       this.fetchData();
    //     }).catch((err) => {
    //       loading.hide();
    //       this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    //     });
    //   }
    // },

    // removeItem(d) {
    //   this.$confirm(this.$t('template.delete.confirmTips'), this.$t('common.alert')).then(() => {
    //     const loading = this.$Loading.show();
    //     this.$ajax.getJSON('/k8s/api/node_delete', { NodeName: d.NodeName }).then(() => {
    //       loading.hide();
    //       this.fetchData().then(() => {
    //         this.$tip.success(this.$t('common.success'));
    //       });
    //     }).catch((err) => {
    //       loading.hide();
    //       this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    //     });
    //   }).catch(() => {});
    // },

    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_list', {}).then((data) => {
        this.NodeList = data.Data
      })
    },
  },
};
</script>

<style>
.page_base_node {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .node_list {
    border: 1px solid #e1e4eb;
    max-height: 200px;
    overflow: hidden;
    overflow-y: auto;
  }

  .node_item {
    box-sizing:border-box;
    padding:4px 10px;
    width:33.33%
  }
  .btn_group .let-button + .let-button{margin-left:10px;}
}
</style>
