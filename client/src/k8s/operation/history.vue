<template>
  <div class="page_operation_history">
    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column
        :title="$t('deployService.form.app')"
        prop="ServerApp"
        width="15%"
      ></let-table-column>
      <let-table-column
        :title="$t('deployService.form.serviceName')"
        prop="ServerName"
        width="15%"
      ></let-table-column>
      <let-table-column
        :title="$t('serviceApproval.RequestPerson')"
        prop="RequestPerson"
        width="15%"
      ></let-table-column>
      <let-table-column
        :title="$t('serviceApproval.ApprovalTime')"
        prop="ApprovalTime"
      ></let-table-column>
      <let-table-column
        :title="$t('serviceApproval.ApprovalResult')"
        prop="ApprovalResult"
      >
        <template slot-scope="scope">
          <span class="success" v-if="`${scope.row.ApprovalResult}` === 'true'"
            >Approval</span
          >
          <span
            class="warn"
            v-else-if="`${scope.row.ApprovalResult}` === 'false'"
            >Reject</span
          >
          <span v-else>{{ scope.row.ApprovalResult }}</span>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('serviceApproval.ApprovalMark')"
        prop="ApprovalMark"
      ></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="viewItem(scope.row)">{{
            $t("operate.view")
          }}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-button @click="fetchData" v-if="this.Continue != ''">more</let-button>

    <let-modal
      v-model="viewModal.show"
      :title="$t('deployService.title.history')"
      width="80%"
      @on-confirm="closeViewModal"
      @on-cancel="closeViewModal"
    >
      <let-form ref="viewForm" inline v-if="viewModal.model">
        <let-form-item :label="$t('deployService.form.app')" itemWidth="45%">{{
          viewModal.model.ServerApp
        }}</let-form-item>
        <let-form-item
          :label="$t('deployService.form.serviceName')"
          itemWidth="45%"
          >{{ viewModal.model.ServerName }}</let-form-item
        >
        <let-form-item
          :label="$t('deployService.form.serviceMark')"
          itemWidth="45%"
          >{{ viewModal.model.ServerMark }}</let-form-item
        >
        <let-table :data="viewModal.model.ServerServant">
          <let-table-column title="OBJ">
            <template slot-scope="props">{{ props.row.Name }}</template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.port')">
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">{{ props.row.Port }}</template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.portType')">
            <template slot-scope="props">
              <let-radio
                v-model="props.row.IsTcp"
                :label="true"
                v-if="props.row.IsTcp"
                >TCP</let-radio
              >
              <let-radio v-model="props.row.IsTcp" :label="false" v-else
                >UDP</let-radio
              >
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.protocol')">
            <template slot-scope="props">
              <let-radio
                v-model="props.row.IsTars"
                :label="true"
                v-if="props.row.IsTars"
                >TARS</let-radio
              >
              <let-radio v-model="props.row.IsTars" :label="false" v-else>{{
                $t("serverList.servant.notTARS")
              }}</let-radio>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.threads')"
            width="80px"
          >
            <template slot-scope="props">{{ props.row.Threads }}</template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.connections')"
            width="140px"
          >
            <template slot-scope="props">{{ props.row.Connections }}</template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.capacity')"
            width="140px"
          >
            <template slot-scope="props">{{ props.row.Capacity }}</template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.timeout')"
            width="140px"
          >
            <template slot-scope="props">{{ props.row.Timeout }}</template>
          </let-table-column>
          <let-table-column width="10px"></let-table-column>
        </let-table>
        <let-form-item :label="$t('serviceApproval.ApprovalResult')">
          <span
            :class="viewModal.model.ApprovalResult ? 'success' : 'warn'"
            v-if="viewModal.model.ApprovalResult"
            >{{ viewModal.model.ApprovalResult ? "通过" : "驳回" }}</span
          >
        </let-form-item>
        <let-form-item
          :label="$t('serviceApproval.ApprovalMark')"
          itemWidth="100%"
          >{{ viewModal.model.ApprovalMark }}</let-form-item
        >
      </let-form>
    </let-modal>
  </div>
</template>

<script>
import { formatDate } from "@/lib/date";
export default {
  name: "OperationHistory",

  data() {
    return {
      // query: {
      //   ServerApp: '',
      //   ServerName: '',
      // },
      items: [],
      Continue: null,
      // // 分页
      // pagination: {
      //   page: 1,
      //   size: 10,
      //   total:1,
      // },
      viewModal: {
        show: false,
        model: null,
      },
      K8SisCheckedAll: false,
      K8SNodeList: [],
    };
  },

  mounted() {
    this.getDefaultValue();
    this.getNodeList();
    this.fetchData();
  },

  methods: {
    // // 切换服务实时状态页码
    // gotoPage(num) {
    //   // this.pagination.page = num
    //   this.fetchData()
    // },
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax
        .getJSON("/k8s/api/approval_select", {
          Continue: this.Continue,
        })
        .then((data) => {
          loading.hide();
          this.Continue = data.Continue;
          data.Data &&
            data.Data.forEach((item) => {
              let arr = [];
              if (item.ServerServant) {
                // Object -> Array
                for (let i in item.ServerServant) {
                  arr.push(item.ServerServant[i]);
                }
                item.ServerServant = arr;
              }

              item.ApprovalTime = formatDate(
                item.ApprovalTime,
                "YYYY-MM-DD HH:mm:ss"
              );

              this.items.push(item);
            });

          //  = data.Data
          // this.pagination.total = Math.ceil(data.Count.FilterCount / this.pagination.size)
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },

    // getDefaultValue(){
    //   let { K8SNetModeOptional, K8SNodeSelectorKind } = this
    //   this.$ajax.getJSON('/k8s/api/default', {}).then((data) => {
    //     if(data.K8SNetModeOptional){
    //       K8SNetModeOptional = data.K8SNetModeOptional
    //     }
    //     if(data.K8SNodeSelectorKind){
    //       K8SNodeSelectorKind = data.K8SNodeSelectorKind
    //     }
    //     this.K8SNetModeOptional = K8SNetModeOptional
    //     this.K8SNodeSelectorKind = K8SNodeSelectorKind
    //   }).catch((err) => {
    //     this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    //   });
    // },

    getNodeList() {
      this.$ajax.getJSON("/k8s/api/node_list", { isAll: true }).then((data) => {
        this.K8SNodeList = data;
      });
    },

    search() {
      this.fetchData();
    },

    closeViewModal() {
      this.viewModal.show = false;
      this.viewModal.model = null;
    },

    viewItem(d) {
      let data = this.adapterServerK8S(d);
      this.viewModal.model = data;
      this.viewModal.show = true;
    },
    adapterServerK8S(model) {
      return model;
    },
  },
};
</script>

<style>
.page_operation_history {
  pre {
    color: #909fa3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .success {
    color: #49cc8f;
  }
  .warn {
    color: #e0543f;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom: 20px;
  }

  .node_list {
    border: 1px solid #e1e4eb;
    max-height: 200px;
    margin: 10px 0;
    overflow: hidden;
    overflow-y: auto;
  }

  .node_item {
    box-sizing: border-box;
    padding: 4px 10px;
    width: 33.33%;
  }
}
</style>
