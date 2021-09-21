<template>
  <div class="page_operation_approval">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('deployService.form.app')">
        <let-input size="small" v-model="query.ServerApp"></let-input>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')">
        <let-input size="small" v-model="query.ServerName"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('deployService.form.app')" prop="ServerApp" width="15%"></let-table-column>
      <let-table-column :title="$t('deployService.form.serviceName')" prop="ServerName" width="20%"></let-table-column>
      <let-table-column :title="$t('serviceApproval.RequestPerson')" prop="RequestPerson" width="15%"></let-table-column>
      <let-table-column :title="$t('serviceApproval.RequestMark')" prop="RequestMark"></let-table-column>
      <let-table-column :title="$t('serviceApproval.RequestTime')" prop="RequestTime"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="approvalItem(scope.row)">{{$t('operate.approval')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <!-- <div style="overflow:hidden;">
      <let-pagination align="right" style="float:right;"
        :page="pagination.page" @change="gotoPage"
        :total="pagination.total">
      </let-pagination>
    </div> -->

    <let-modal v-model="viewModal.show" :title="$t('template.view.title')" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="detailModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="80%"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" inline v-if="detailModal.model">
        <let-form-item :label="$t('deployService.form.app')" itemWidth="45%" required>
          <let-input
            size="small"
            v-model="detailModal.model.ServerApp"
            :placeholder="$t('deployService.form.placeholder')"
            required
            :required-tip="$t('deployService.form.appTips')"
            pattern="^[a-zA-Z0-9]+$"
            :pattern-tip="$t('deployService.form.placeholder')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')" itemWidth="45%" required>
          <let-input
            size="small"
            v-model="detailModal.model.ServerName"
            :placeholder="$t('deployService.form.serviceFormatTips')"
            required
            :required-tip="$t('deployService.form.serviceTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.serviceFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.template')" itemWidth="45%" required>
          <let-select
            size="small"
            v-model="detailModal.model.ServerOption.ServerTemplate"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in templates" :key="d.TemplateName" :value="d.TemplateName">{{d.TemplateName}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceMark')" itemWidth="45%">
          <let-input
            size="small"
            v-model="detailModal.model.ServerMark"
            :placeholder="$t('deployService.form.serviceMark')"
          >
          </let-input>
        </let-form-item>
        <let-table :data="detailModal.model.ServerServant">
          <let-table-column title="OBJ" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                v-model="props.row.Name"
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.form.objTips')"
                pattern="^[a-zA-Z0-9]+$"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.port')" width="100px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                :max="65535"
                v-model="props.row.Port"
                placeholder="0-65535"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.portType')" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-radio v-model="props.row.IsTcp" :label="true">TCP</let-radio>
              <let-radio v-model="props.row.IsTcp" :label="false">UDP</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.protocol')" width="180px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-radio v-model="props.row.IsTars" :label="true">TARS</let-radio>
              <let-radio v-model="props.row.IsTars" :label="false">NOT TARS</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.threads')" width="80px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Threads"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.connections')" width="100px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Connections"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.capacity')" width="120px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Capacity"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.timeout')" width="150px">
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Timeout"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column width="10px"></let-table-column>
        </let-table>
      </let-form>
    </let-modal>

    <let-modal
      v-model="approvalModal.show"
      :title="approvalModal.isNew ? this.$t('deployService.title.approval') : this.$t('deployService.title.approval')"
      width="80%"
      @on-confirm="saveApprovalItem"
      @on-cancel="closeApprovalModal"
    >
      <let-form ref="approvalForm" inline v-if="approvalModal.model">
        <let-form-item :label="$t('deployService.form.app')" itemWidth="45%" required>
          <let-input disabled
            size="small"
            v-model="approvalModal.model.ServerApp"
            :placeholder="$t('deployService.form.placeholder')"
            required
            :required-tip="$t('deployService.form.appTips')"
            pattern="^[a-zA-Z0-9]+$"
            :pattern-tip="$t('deployService.form.placeholder')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')" itemWidth="45%" required>
          <let-input disabled
            size="small"
            v-model="approvalModal.model.ServerName"
            :placeholder="$t('deployService.form.serviceFormatTips')"
            required
            :required-tip="$t('deployService.form.serviceTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.serviceFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.template')" itemWidth="45%" required>
          <let-select disabled
            size="small"
            v-model="approvalModal.model.ServerOption.ServerTemplate"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in templates" :key="d.TemplateName" :value="d.TemplateName">{{d.TemplateName}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceMark')" itemWidth="45%">
          <let-input disabled
            size="small"
            v-model="approvalModal.model.ServerMark"
            :placeholder="$t('deployService.form.serviceMark')"
          >
          </let-input>
        </let-form-item>
        <let-table :data="approvalModal.model.ServerServant">
          <let-table-column title="OBJ" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input disabled
                size="small"
                v-model="props.row.Name"
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.form.objTips')"
                pattern="^[a-zA-Z0-9]+$"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.port')" width="100px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input disabled
                size="small"
                type="number"
                :min="0"
                :max="65535"
                v-model="props.row.Port"
                placeholder="0-65535"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.portType')" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.IsTcp" :label="true">TCP</let-radio>
              <let-radio disabled v-model="props.row.IsTcp" :label="false">UDP</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.protocol')" width="180px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.IsTars" :label="true">TARS</let-radio>
              <let-radio disabled v-model="props.row.IsTars" :label="false">NOT TARS</let-radio>
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.table.th.threads')" width="80px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input disabled
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Threads"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.connections')" width="140px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input disabled
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Connections"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.capacity')" width="140px">
            <template slot="head" slot-scope="props">
              <span class="required">{{props.column.title}}</span>
            </template>
            <template slot-scope="props">
              <let-input disabled
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Capacity"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('serverList.table.servant.timeout')" width="140px">
            <template slot-scope="props">
              <let-input disabled
                size="small"
                type="number"
                :min="0"
                v-model="props.row.Timeout"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column width="10px"></let-table-column>
        </let-table>

        <div>
          <let-form-item :label="$t('serviceApproval.ApprovalResult')" required>
            <let-select
              size="small"
              v-model="approvalModal.model.ApprovalResult"
              required
              :required-tip="$t('deployService.table.tips.empty')"
            >
              <let-option v-for="d in approvalResult" :key="d.label" :value="d.value">{{ d.label }}</let-option>
            </let-select>
          </let-form-item>
        </div>
        <div>
          <let-form-item :label="$t('serviceApproval.ApprovalMark')" required>
            <let-input
              type="textarea"
              :rows="3"
              v-model="approvalModal.model.ApprovalMark"
              :placeholder="$t('serviceApproval.ApprovalMark')"
              required
              :required-tip="$t('deployService.table.tips.empty')"
            >
            </let-input>
          </let-form-item>
        </div>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
import { formatDate } from '@/lib/date';

const approvalResult = [
  { label: 'Approve', value: 'true' },
  { label: 'Reject', value: 'false' },
];

export default {
  name: 'OperationApproval',

  data() {
    return {
      approvalResult,
      templates: [],
      query: {
        ServerApp: '',
        ServerName: '',
      },
      items: [],
      K8SisCheckedAll: false,
      K8SNodeList: [],
      K8SNodeListArr: [],

      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
        isNew: false
      },
      approvalModal: {
        show: false,
        model: null,
        isNew: false
      },
      k8sApplyModel: {
        NodeSelector: [],
        taf: {},
        resources: {},
        mounts: []
      },
    };
  },

  watch: {
    K8SisCheckedAll() {
      let K8SisCheckedAll = this.K8SisCheckedAll;
      if(K8SisCheckedAll) {
        this.K8SNodeList.forEach(item => {
          if(this.K8SNodeListArr.indexOf(item) === -1){
            this.K8SNodeListArr.push(item)
          }
        })
      }else{
        this.K8SNodeListArr = []
      }
    },
  },

  mounted() {
    this.getServerTemplate()
    this.getNodeList()
    this.fetchData();
    this.getDefaultValue();
  },

  methods: {
    K8ScheckedChange(val) {
      if(this.K8SNodeListArr.indexOf(val) > -1){
        this.K8SNodeListArr.splice(this.K8SNodeListArr.indexOf(val), 1)
      }else{
        this.K8SNodeListArr.push(val)
      }

      if(this.K8SNodeListArr.length === 0){
        this.K8SisCheckedAll = false
      }
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
    fetchData() {
      const loading = this.$refs.table.$loading.show();

      return this.$ajax.getJSON('/k8s/api/deploy_select', {
        ServerApp: this.query.ServerApp,
        ServerName: this.query.ServerName,
      }).then((data) => {
        loading.hide();
        this.items = []
        if (data.hasOwnProperty("Data")) {
          for (let i = 0; i < data.Data.length; i++) {

            data.Data[i].RequestTime = formatDate(data.Data[i].RequestTime, 'YYYY-MM-DD HH:mm:ss')
            // Servant Object -> Array
            let servant = []
            for (let key in data.Data[i].ServerServant) {
              servant.push(data.Data[i].ServerServant[key])
            }
            data.Data[i].ServerServant = servant

            if(data.Data[i].ServerK8S.HostPort.length == 0) {
              for(var o in data.Data[i].ServerServant) {
                data.Data[i].ServerK8S.HostPort.push({
                  NameRef: data.Data[i].ServerServant[o].Name,
                  Port: data.Data[i].ServerServant[o].Port,
                })
              }
            }
          }
          this.items = data.Data;
        }
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    search() {
      // this.pagination.page = 1;
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },
    closeApprovalModal() {
      this.$refs.approvalForm.resetValid();
      this.approvalModal.show = false;
      this.approvalModal.model = null;
    },

    addItem() {
      this.detailModal.model = {};
      this.detailModal.show = true;
      this.detailModal.isNew = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.show = true;
      this.detailModal.isNew = false;
    },

    approvalItem(d) {
      this.approvalModal.model = d;
      this.approvalModal.show = true;
      this.approvalModal.isNew = false;
    },

    adapterServerK8S(model) {
      let data = Object.assign({}, model)

      // Array -> Object
      let obj = {}
      data.ServerServant.forEach(item => {
        obj[item.Name] = item
      })
      data.ServerServant = obj
      return data
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        let data = this.adapterServerK8S(this.detailModal.model)
        if(!data) {
          return;
        }
        const loading = this.$Loading.show();

        this.k8sApplyModel = {
          abilityAffinity: data.ServerK8S.abilityAffinity,
          NodeSelector: data.ServerK8S.NodeSelector,
          HostIpc: data.ServerK8S.HostIpc,
          HostNetwork: data.ServerK8S.HostNetwork,
          mounts: data.Mounts.filter(item => item.source.hasOwnProperty("tLocalVolume")),
          resources: data.resources
        }
        let arr = []

        debugger
        if (data.ServerK8S.HostPort && Object.keys(data.ServerK8S.HostPort).length > 0) {
          this.k8sApplyModel.showHostPort = true
          data.ServerK8S.HostPort.forEach(item => {
            arr.push({
              obj: item.NameRef,
              HostPort: Math.floor(item.Port),
            })
          })
          this.k8sApplyModel.HostPortArr = arr
        }
        if (arr.length == 0) {
          this.k8sApplyModel.showHostPort = false
          this.k8sApplyModel.HostPortArr = [];
          for (let key in data.ServerServant) {
            this.k8sApplyModel.HostPortArr.push({
              obj: key,
              HostPort: 0
            })
          }
        }
        this.$ajax.postJSON('/k8s/api/deploy_update', {
          DeployId: data.DeployId,
          ServerServant: data.ServerServant,
          ServerOption: data.ServerOption,
          ServerK8S: this.k8sApplyModel,
        }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.detailModal.show = false;
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    saveApprovalItem() {
      if (this.$refs.approvalForm.validate()) {
        const model = this.approvalModal.model;
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/k8s/api/approval_create', model).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.approvalModal.show = false;
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    removeItem(d) {
      this.$confirm(this.$t('template.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.getJSON('/k8s/api/deploy_delete', { DeployId: d.DeployId }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },

    getServerTemplate() {
      this.$ajax.getJSON('/k8s/api/template_select', {
        isAll: true,
      }).then((data) => {
        this.templates = data.Data;
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_list', { isAll: true }).then((data) => {
        this.K8SNodeList = data
      })
    },
  },
};
</script>

<style>
.page_operation_approval {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom:20px;
  }

  /* .let-form-item{vertical-align:top;} */

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
