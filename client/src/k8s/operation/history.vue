<template>
  <div class="page_operation_history">
    <!-- <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('deployService.form.app')">
        <let-input size="small" v-model="query.ServerApp"></let-input>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')">
        <let-input size="small" v-model="query.ServerName"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
    </let-form> -->

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('deployService.form.app')" prop="ServerApp" width="15%"></let-table-column>
      <let-table-column :title="$t('deployService.form.serviceName')" prop="ServerName" width="15%"></let-table-column>
      <let-table-column :title="$t('serviceApproval.RequestPerson')" prop="RequestPerson" width="15%"></let-table-column>
      <let-table-column :title="$t('serviceApproval.ApprovalTime')" prop="ApprovalTime"></let-table-column>
      <let-table-column :title="$t('serviceApproval.ApprovalResult')" prop="ApprovalResult">
        <template slot-scope="scope">
          <span class="success" v-if="`${scope.row.ApprovalResult}` === 'true'">Approval</span>
          <span class="warn" v-else-if="`${scope.row.ApprovalResult}` === 'false'">Reject</span>
          <span v-else>{{ scope.row.ApprovalResult }}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serviceApproval.ApprovalMark')" prop="ApprovalMark"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="viewItem(scope.row)">{{$t('operate.view')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-button @click="fetchData" v-if="this.Continue != ''">more</let-button>
    <!-- <div style="overflow:hidden;">
      <let-pagination align="right" style="float:right;"
        :page="pagination.page" @change="gotoPage"
        :total="pagination.total">
      </let-pagination>
    </div> -->

    <let-modal v-model="viewModal.show" :title="$t('deployService.title.history')" width="80%"
      @on-confirm="closeViewModal"
      @on-cancel="closeViewModal"
    >
      <let-form ref="viewForm" inline v-if="viewModal.model">
        <let-form-item :label="$t('deployService.form.app')" itemWidth="45%">{{ viewModal.model.ServerApp }}</let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')" itemWidth="45%">{{ viewModal.model.ServerName }}</let-form-item>
        <let-form-item :label="$t('deployService.form.serviceMark')" itemWidth="45%">{{ viewModal.model.ServerMark }}</let-form-item>
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
              <let-radio v-model="props.row.IsTcp" :label="true" v-if="props.row.IsTcp">TCP</let-radio>
              <let-radio v-model="props.row.IsTcp" :label="false" v-else>UDP</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.protocol')">
            <template slot-scope="props">
              <let-radio v-model="props.row.IsTaf" :label="true" v-if="props.row.IsTaf">TAF</let-radio>
              <let-radio v-model="props.row.IsTaf" :label="false" v-else>{{ $t('serverList.servant.notTAF') }}</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.threads')" width="80px">
            <template slot-scope="props">{{ props.row.Threads }}</template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.connections')" width="140px">
            <template slot-scope="props">{{ props.row.Connections }}</template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.capacity')" width="140px">
            <template slot-scope="props">{{ props.row.Capacity }}</template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.timeout')" width="140px">
            <template slot-scope="props">{{ props.row.Timeout }}</template>
          </let-table-column>
          <let-table-column width="10px"></let-table-column>
        </let-table>
        <let-form-group class="let-box" title="K8S" inline label-position="top">
          <let-form-item :label="$t('deployService.table.th.nodeSelector')" itemWidth="50%">
            <let-select disabled v-if="K8SNodeSelectorKind && K8SNodeSelectorKind.length > 0"
              size="small"
              v-model="viewModal.model.ServerK8S.NodeSelector.Kind"
              :placeholder="$t('pub.dlg.defaultValue')"
              required
              :required-tip="$t('deployService.form.templateTips')"
            >
              <let-option v-for="d in K8SNodeSelectorKind" :key="d" :value="d">{{d}}</let-option>
            </let-select>
            <div style="margin-top:10px;" v-if="viewModal.model.ServerK8S.NodeSelector.Kind === 'NodeBind'">
              <div style="margin-left:-20px;">
                <let-form-item :label="$t('deployService.table.th.hostIpc')" itemWidth="28%">
                  <let-radio disabled v-model="viewModal.model.ServerK8S.HostIpc" :label="true">{{ $t('common.true') }}</let-radio>
                  <let-radio disabled v-model="viewModal.model.ServerK8S.HostIpc" :label="false">{{ $t('common.false') }}</let-radio>
                </let-form-item>
                <let-form-item :label="$t('deployService.table.th.hostNetwork')" itemWidth="28%">
                  <let-radio disabled v-model="viewModal.model.ServerK8S.HostNetwork" :label="true">{{ $t('common.true') }}</let-radio>
                  <let-radio disabled v-model="viewModal.model.ServerK8S.HostNetwork" :label="false">{{ $t('common.false') }}</let-radio>
                </let-form-item>
                <let-form-item :label="$t('deployService.table.th.hostPort')" itemWidth="28%">
                  <let-radio disabled v-model="viewModal.model.ServerK8S.showHostPort" :label="true">{{ $t('common.true') }}</let-radio>
                  <let-radio disabled v-model="viewModal.model.ServerK8S.showHostPort" :label="false">{{ $t('common.false') }}</let-radio>
                </let-form-item>
              </div>
              <div style="display:block;padding:0 40px 0 20px;" v-if="viewModal.model.ServerK8S.showHostPort">
                <let-table style="margin-left:-20px;" :data="viewModal.model.ServerK8S.HostPort">
                  <let-table-column title="OBJ">
                    <template slot="head" slot-scope="props">
                      <span class="required">{{props.column.title}}</span>
                    </template>
                    <template slot-scope="props">{{ props.row.NameRef }}</template>
                  </let-table-column>
                  <let-table-column :title="$t('deployService.table.th.hostPort')">
                    <template slot="head" slot-scope="props">
                      <span class="required">{{props.column.title}}</span>
                    </template>
                    <template slot-scope="props">{{ props.row.Port }}</template>
                  </let-table-column>
                </let-table>
              </div>
              <let-checkbox disabled v-model="K8SisCheckedAll" :value="K8SisCheckedAll">{{ $t('cache.config.allSelected') }}</let-checkbox>
              <div class="node_list">
                <let-checkbox disabled class="node_item" v-for="d in K8SNodeList" :key="d" :value="viewModal.model.ServerK8S.NodeSelector.Value.indexOf(d) > -1" @change="K8ScheckedChange(d)">{{ d }}</let-checkbox>
              </div>
            </div>
          </let-form-item>
          <!-- <let-form-item :label="$t('deployService.table.th.replicas')" itemWidth="30%">{{ viewModal.model.ServerK8S.Replicas }}</let-form-item> -->
        </let-form-group>
        <let-form-item :label="$t('serviceApproval.ApprovalResult')">
          <span :class="viewModal.model.ApprovalResult ? 'success' : 'warn'" v-if="viewModal.model.ApprovalResult">{{ viewModal.model.ApprovalResult ? '通过' : '驳回' }}</span>
        </let-form-item>
        <let-form-item :label="$t('serviceApproval.ApprovalMark')" itemWidth="100%">{{ viewModal.model.ApprovalMark }}</let-form-item>
      </let-form>
    </let-modal>

  </div>
</template>

<script>
import { formatDate } from '@/lib/date';
export default {
  name: 'OperationHistory',

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
      K8SNetModeOptional: [],
      K8SNodeSelectorKind: [],
      K8SisCheckedAll: false,
      K8SNodeList: [],
      K8SNodeListArr: [],
    };
  },

  mounted() {
    this.getDefaultValue();
    this.getNodeList()
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
      return this.$ajax.getJSON('/k8s/api/approval_select', {
        Continue: this.Continue
      }).then((data) => {
        loading.hide();
        this.Continue = data.Continue;
        data.Data && data.Data.forEach(item => {
          let arr = []
          if(item.ServerServant){
            // Object -> Array
            for(let i in item.ServerServant){
              arr.push(item.ServerServant[i])
            }
            item.ServerServant = arr
          }

          item.ApprovalTime = formatDate(item.ApprovalTime, 'YYYY-MM-DD HH:mm:ss')

          this.items.push(item);
        })

        //  = data.Data
        // this.pagination.total = Math.ceil(data.Count.FilterCount / this.pagination.size)
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    getDefaultValue(){
      let { K8SNetModeOptional, K8SNodeSelectorKind } = this
      this.$ajax.getJSON('/k8s/api/default', {}).then((data) => {
        if(data.K8SNetModeOptional){
          K8SNetModeOptional = data.K8SNetModeOptional
        }
        if(data.K8SNodeSelectorKind){
          K8SNodeSelectorKind = data.K8SNodeSelectorKind
        }
        this.K8SNetModeOptional = K8SNetModeOptional
        this.K8SNodeSelectorKind = K8SNodeSelectorKind
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_list', { isAll: true }).then((data) => {
        this.K8SNodeList = data
      })
    },

    search() {
      this.fetchData();
    },

    closeViewModal() {
      this.viewModal.show = false;
      this.viewModal.model = null;
    },

    viewItem(d) {
      let data = this.adapterServerK8S(d)
      this.viewModal.model = data;
      this.viewModal.show = true;
    },

    adapterServerK8S(model) {
      let data = Object.assign({}, model)
      if(data.ServerK8S.NodeSelector.hasOwnProperty('NodeBind')){
        data.ServerK8S.NodeSelector.Kind = 'NodeBind'
        data.ServerK8S.NodeSelector.Value = data.ServerK8S.NodeSelector.NodeBind.Value
        // Check HostPort
        if (data.ServerK8S.HostPort.length > 0) {
          data.ServerK8S.showHostPort = true
        }
      } else if (data.ServerK8S.NodeSelector.hasOwnProperty('AbilityPool')) {
        data.ServerK8S.NodeSelector.Kind = 'AbilityPool'
        data.ServerK8S.NodeSelector.Value = data.ServerK8S.NodeSelector.AbilityPool.Value
      }
      return data
    },

  },
};
</script>

<style>
.page_operation_history {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .success{
    color:#49CC8F;
  } 
  .warn{
    color: #E0543F;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom:20px;
  }

  .node_list {
    border: 1px solid #e1e4eb;
    max-height: 200px;
    margin:10px 0;
    overflow: hidden;
    overflow-y: auto;
  }

  .node_item {
    box-sizing:border-box;
    padding:4px 10px;
    width:33.33%
  }
}
</style>
