<template>
  <!--  基础信息-->
  <div class="page_operation_deploy">
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="480px"
      @submit.native.prevent="save"
    >
      <let-form-item :label="$t('deployService.form.app')" itemWidth="45%" required>
        <let-select
          size="small"
          v-model="model.ServerApp"
          :placeholder="$t('deployService.form.placeholder')"
          required
          :required-tip="$t('deployService.form.appTips')"
          pattern="^[a-zA-Z0-9]+$"
          :pattern-tip="$t('deployService.form.placeholder')"
        >
          <let-option v-for="d in appList" :key="d.ServerApp" :value="d.ServerApp">{{d.ServerApp}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')" itemWidth="45%" required>
        <let-input
          size="small"
          v-model="model.ServerName"
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
          v-model="model.ServerOption.ServerTemplate"
          :placeholder="$t('pub.dlg.defaultValue')"
          required
          :required-tip="$t('deployService.form.templateTips')"
        >
          <let-option v-for="d in templates" :key="d.TemplateName" :value="d.TemplateName">{{d.TemplateName}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceMark')" itemWidth="45%">
        <let-input
          size="small"
          v-model="model.ServerMark"
          :placeholder="$t('deployService.form.serviceMark')"
        >
        </let-input>
      </let-form-item>


      <!-- OBJ的table-->
      <let-table :data="model.ServerServant">
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
              :min="1"
              :max="30000"
              v-model="props.row.Port"
              placeholder="1-30000"
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
        <let-table-column :title="$t('serverList.table.servant.connections')" width="140px">
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
        <let-table-column :title="$t('serverList.table.servant.capacity')" width="140px">
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
        <let-table-column :title="$t('serverList.table.servant.timeout')" width="140px">
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.Timeout"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('operate.operates')" width="60px">
          <template slot-scope="props">
            <let-table-operation @click="addAdapter(props.row)" v-if="props.$index === 0">{{$t('operate.add')}}</let-table-operation>
            <let-table-operation
              v-if="props.$index"
               class="danger"
              @click="model.ServerServant.splice(props.$index, 1)"
            >{{$t('operate.delete')}}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>

      <!-- k8s group-->
      <let-form-group class="let-box" title="K8S">
        <let-form-item :label="$t('deployService.table.th.nodeSelector')" itemWidth="45%">
          <let-select v-if="K8SNodeSelectorKind && K8SNodeSelectorKind.length > 0"
            size="small"
            v-model="model.ServerK8S.NodeSelector.Kind"
            :placeholder="$t('pub.dlg.defaultValue')"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in K8SNodeSelectorKind" :key="d" :value="d">{{d}}</let-option>
          </let-select>
          <let-input v-else
            size="small"
            :min="0"
            v-model="model.ServerK8S.NodeSelect"
            :placeholder="$t('deployService.form.placeholder')"
            required
            :required-tip="$t('deployService.table.tips.empty')"
            :pattern-tip="$t('deployService.form.placeholder')"
          ></let-input>
        </let-form-item>

        <div v-if="model.ServerK8S.NodeSelector.Kind === 'NodeBind'">
          <div>
            <let-form-item :label="$t('deployService.table.th.hostIpc')" itemWidth="15%">
              <let-radio v-model="model.ServerK8S.HostIpc" :label="true">{{ $t('common.true') }}</let-radio>
              <let-radio v-model="model.ServerK8S.HostIpc" :label="false">{{ $t('common.false') }}</let-radio>
            </let-form-item>
            <let-form-item :label="$t('deployService.table.th.hostNetwork')" itemWidth="15%">
              <let-radio v-model="model.ServerK8S.HostNetwork" :label="true">{{ $t('common.true') }}</let-radio>
              <let-radio v-model="model.ServerK8S.HostNetwork" :label="false">{{ $t('common.false') }}</let-radio>
            </let-form-item>
            <let-form-item :label="$t('deployService.table.th.hostPort')" itemWidth="15%">
              <let-radio v-model="model.ServerK8S.showHostPort" :label="true">{{ $t('common.true') }}</let-radio>
              <let-radio v-model="model.ServerK8S.showHostPort" :label="false">{{ $t('common.false') }}</let-radio>
            </let-form-item>
          </div>
          <div style="display:block;padding:0 40px 0 20px;" v-if="model.ServerK8S.showHostPort">
              <let-table style="margin:0;" :data="model.ServerServant">
                <let-table-column title="OBJ">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{props.column.title}}</span>
                  </template>
                  <template slot-scope="props">{{ props.row.Name }}</template>
                </let-table-column>
                <let-table-column :title="$t('deployService.table.th.port')">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{props.column.title}}</span>
                  </template>
                  <template slot-scope="props">{{ props.row.Port }}</template>
                </let-table-column>
                <let-table-column :title="$t('deployService.table.th.hostPort')">
                  <template slot-scope="props">
                    <let-input size="small" type="number" :min="1" :max="65535"
                               v-model="props.row.HostPort" placeholder="1-65535"
                               required :required-tip="$t('deployService.table.tips.empty')"
                    ></let-input>
                  </template>
                </let-table-column>
                <let-table-column>
                  <template slot-scope="props">
                    <let-button size="small" theme="primary" class="port-button" @click="generateHostPort(props.row)">
                      {{$t('deployService.table.th.generateHostPort')}}
                    </let-button>
                  </template>
                </let-table-column>
                <let-table-column :title="$t('deployService.form.portType')">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{props.column.title}}</span>
                  </template>
                  <template slot-scope="props">
                    <span v-if="props.row.IsTcp">TCP</span>
                    <span v-else>UDP</span>
                  </template>
                </let-table-column>
                <let-table-column :title="$t('deployService.table.th.protocol')">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{props.column.title}}</span>
                  </template>
                  <template slot-scope="props">
                    <span v-if="props.row.IsTars">TARS</span>
                    <span v-else>NOT TARS</span>
                  </template>
                </let-table-column>
              </let-table>
          </div>
          <div>
            <let-form-item :label="$t('deployService.table.th.nodeSelector')" itemWidth="45%" required>
              <let-checkbox v-model="isCheckedAll" :value="isCheckedAll">{{ $t('cache.config.allSelected') }}</let-checkbox>
              <div class="node_list">
                <let-checkbox class="node_item" v-for="d in NodeList" :key="d" :value="NodeListArr.indexOf(d) > -1" @change="checkedChange(d)">{{ d }}</let-checkbox>
              </div>
            </let-form-item>
          </div>
        </div>
      </let-form-group>
      <!-- <let-button type="button" theme="sub-primary" @click="getAutoPort()">{{$t('deployService.form.getPort')}}</let-button> -->
      <let-button type="submit" theme="primary">{{$t('common.submit')}}</let-button>

    </let-form>


    <let-modal
      v-model="resultModal.show"
      width="700px"
      class="more-cmd"
      :footShow="false"
      @close="closeResultModal"
      @on-cancel="closeResultModal">
      <p class="result-text">{{$t('deployService.form.ret.success')}}{{$t('resource.installRstMsg')}}</p>
      <let-table :data="resultModal.resultList" :empty-msg="$t('common.nodata')" :row-class-name="resultModal.rowClassName">
          <let-table-column title="ip" prop="ip">
          </let-table-column>
          <let-table-column :title="$t('resource.installResult')" prop="rst">
            <template slot-scope="scope">
              <p v-text="scope.row.rst?$t('common.success'):$t('common.error')"></p>
            </template>
          </let-table-column>
          <let-table-column :title="$t('common.message')" prop="msg"></let-table-column>
      </let-table>
    </let-modal>

  </div>
</template>

<script>
import SetInputer from '@/components/set-inputer';

const types = [
  'taf_cpp',
  'taf_java',
  'taf_php',
  'taf_node',
  'not_taf',
  'taf_go'
];

const getInitialModel = () => ({
  ServerApp: '',
  ServerName: '',
  // ServerType: types[0],
  // ServerTemplate: '',
  ServerMark: '',
  ServerServant: [
    {
      Name: '',
      Port: '',
      HostPort: 0,
      showHostPort: false,
      Threads: 0,
      Connections: 0,
      Capacity: 0,
      Timeout: 0,
      IsTcp: true,
      IsTars: false,
    }
  ],
  ServerOption: {
    ServerImportant: 0,
  },
  ServerK8S: {
    HostIpc: false,
    HostNetwork: false,
    showHostPort: false,
    HostPort: {},
    NodeSelector: {},
    Replicas: 0,
  },

  // application: '',
  // server_name: '',
  // server_type: types[0],
  // template_name: '',
  // node_name: '',
  // enable_set: false,
  // set_name: '',
  // set_area: '',
  // set_group: '',
  // operator: '',
  // developer: '',
  // adapters: [{
  //   obj_name: '',
  //   bind_ip: '',
  //   port: '',
  //   port_type: 'tcp',
  //   protocol: 'tars',
  //   thread_num: 5,
  //   max_connections: 200000,
  //   queuecap: 10000,
  //   queuetimeout: 60000,
  // }],
});

export default {
  name: 'OperationDeploy',

  components: {
    SetInputer,
  },

  data() {
    return {
      types,
      templates: [],
      appList: [],
      isCheckedAll: false,
      NodeList: [],
      NodeListArr: [],
      model: getInitialModel(),
      enableAuth: false,
      resultModal: {
        show: false,
        resultList: [],
        rowClassName: (rowData)=>{
           if(rowData && rowData.row && !rowData.row.rst){
              return 'err-row'
           }
           return ''
        }
      },
      K8SNetModeOptional: [],
      K8SNodeSelectorKind: [],
    };
  },

  mounted() {
    this.getServerTemplate()
    this.getDefaultValue()
    this.getAppList()
    this.getNodeList()

    this.$watch('model.ServerName', (val, oldVal) => {
      if (val === oldVal) {
        return;
      }
    })

    this.$watch('model.node_name', (val, oldVal) => {
      if (val === oldVal) {
        return;
      }

      this.model.ServerServant.forEach((d) => {
        d.bind_ip = val; // eslint-disable-line no-param-reassign
      });
    });
  },

  watch: {
    isCheckedAll() {
      let isCheckedAll = this.isCheckedAll;
      if(isCheckedAll) {
        this.NodeList.forEach(item => {
          if(this.NodeListArr.indexOf(item) === -1){
            this.NodeListArr.push(item)
          }
        })
      }else{
        this.NodeListArr = []
      }
    },
  },

  methods: {
    showHostPort(data) {
      data.showHostPort = true
    },
    hideHostPort(data) {
      data.HostPort = 0
      data.showHostPort = false
    },
    checkedChange(val) {
      if(this.NodeListArr.indexOf(val) > -1){
        this.NodeListArr.splice(this.NodeListArr.indexOf(val), 1)
      }else{
        this.NodeListArr.push(val)
      }

      if(this.NodeListArr.length === 0){
        this.isCheckedAll = false
      }
    },
    addAdapter(template) {
      template = this.model.ServerServant[this.model.ServerServant.length - 1]
      const Port = template.Port + 1
      const newObj = Object.assign({}, template, { Port })
      this.model.ServerServant.push(Object.assign({}, newObj))
    },
    adapterServerK8S(model) {
      let data = Object.assign({}, model)

      // Array -> Object
      let obj = {}
      data.ServerServant.forEach(item => {
        obj[item.Name] = item
      })
      data.ServerServant = obj

      // Object -> Array
      data.ServerK8S.HostPort = []
      if(data.ServerK8S.NodeSelector.Kind === 'NodeBind'){
        if(data.ServerK8S.HostNetwork && data.ServerK8S.showHostPort){
          return this.$tip.error(`${this.$t('deployService.form.portOrNetWork')}`)
        }
        if(data.ServerK8S.showHostPort){
          for(let item in data.ServerServant){
            data.ServerK8S.HostPort.push({
              NameRef: item,
              Port: Math.floor(data.ServerServant[item].HostPort) || 0
            })
          }
        }

        // 兼容新后台接口结构
        delete data.ServerK8S.NodeSelector.AbilityPool
        if(this.NodeListArr.length <= 0){
          return this.$tip.error(`${this.$t('deployService.form.nodeTips')}`)
        }
        data.ServerK8S.NodeSelector.NodeBind = {
          Value: this.NodeListArr
        }
      } else if (data.ServerK8S.NodeSelector.Kind === 'AbilityPool') {
        // 兼容新后台接口结构
        delete data.ServerK8S.NodeSelector.NodeBind
        data.ServerK8S.NodeSelector.AbilityPool = {
          Value: []
        }
      }
      return data
    },
    deploy() {
      if (this.$refs.form.validate()) {
        let data = this.adapterServerK8S(this.model)
        this.$confirm(this.$t('deployService.form.deployServiceTip'), this.$t('common.alert')).then(() => {
          const loading = this.$Loading.show();
          this.$ajax.postJSON('/k8s/api/deploy_create', data).then((data) => {
            loading.hide();
            if(data.tars_node_rst && data.tars_node_rst.length){
              this.showResultModal(data.tars_node_rst);
            }else{
              this.$tip.success(this.$t('deployService.form.ret.success'));
            }
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        });
      }
    },
    getServerTemplate() {
      this.$ajax.getJSON('/k8s/api/template_select', {
        isAll: true,
      }).then((data) => {
        this.templates = data.Data
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    getDefaultValue(){
      let { ServerServant, ServerOption, ServerK8S } = this.model
      let { K8SNetModeOptional, K8SNodeSelectorKind } = this
      this.$ajax.getJSON('/k8s/api/default', {}).then((data) => {
        if(data.ServerServantElem){
          ServerServant.forEach(item => {
            item.Port = data.ServerServantElem.Port
            item.HostPort = data.ServerServantElem.HostPort
            item.showHostPort = false
            item.Capacity = data.ServerServantElem.Capacity
            item.Connections = data.ServerServantElem.Connections
            item.Threads = data.ServerServantElem.Threads
            item.Timeout = data.ServerServantElem.Timeout
            item.IsTcp = data.ServerServantElem.IsTcp
            item.IsTars = data.ServerServantElem.IsTars
          })
        }
        if(data.ServerOption){
          ServerOption = data.ServerOption
        }
        if(data.ServerK8S){
          ServerK8S = data.ServerK8S
          ServerK8S.HostPort = {}
          ServerK8S.showHostPort = false
        }
        if(data.K8SNetModeOptional){
          K8SNetModeOptional = data.K8SNetModeOptional
        }
        if(data.K8SNodeSelectorKind){
          K8SNodeSelectorKind = data.K8SNodeSelectorKind
        }
        this.model.ServerServant = ServerServant
        this.model.ServerOption = ServerOption
        this.model.ServerK8S = ServerK8S
        this.K8SNetModeOptional = K8SNetModeOptional
        this.K8SNodeSelectorKind = K8SNodeSelectorKind
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    getAutoPort(){
        const loading = this.$Loading.show();
        var ServerServant = this.model.ServerServant;
        var bindIps = [];
        ServerServant.forEach((adapter) => {
          bindIps.push(adapter.bind_ip);
        });
        this.$ajax.getJSON('/k8s/api/auto_port', {node_name: bindIps.join(';')}).then((data) => {
            loading.hide();
            data.forEach((node, index) => {
              this.$set(ServerServant[index], 'Port', String(node.Port || ''));
            });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
    },
    save() {
      // if (this.$refs.form.validate()) {
        // const model = this.model;

        // const loading = this.$Loading.show();
        // this.$ajax.getJSON('/k8s/api/server_exist', {
        //   ServerApp: model.ServerApp,
        //   ServerName: model.ServerName,
        //   node_name: model.ServerName,
        // }).then((isExists) => {
        //   loading.hide();
        //   if (isExists) {
        //     this.$tip.error(this.$t('deployService.form.nameTips'));
        //   } else {
            this.deploy();
        //   }
        // }).catch((err) => {
        //   loading.hide();
        //   this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        // });
      // }
    },

    showResultModal(data){
      this.resultModal.resultList = data;
      this.resultModal.show = true;
    },

    closeResultModal(){
      this.resultModal.show = false;
      this.resultModal.resultList = [];
    },

    getAppList() {
      this.$ajax.getJSON('/k8s/api/application_select', { isAll: true }).then((data) => {
        this.appList = data.Data
      })
    },

    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_list', { isAll: true }).then((data) => {
        this.NodeList = data
      })
    },

    // 自动生成端口
    generateHostPort(hostPort) {
      if (this.NodeListArr.length <= 0) {
        this.$tip.error(`${this.$t('common.error')}: 请优先选择需要绑定的节点!`);
        return
      }
      this.$ajax.getJSON("/k8s/api/generate_host_port", {
        NodeList: this.NodeListArr,
        NodePort: hostPort.HostPort
      }).then((res) => {
        hostPort.HostPort = res.port
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      })
    },
  },
};
</script>

<style lang="postcss">
.page_operation_deploy {
  .let-table {
    margin: 20px 0 36px;

    th span.required {
      display: inline-block;

      &:after {
        color: #f56c6c;
        content: '*';
        margin-left: 4px;
      }
    }
    tr.err-row td{
      background:#f56c77!important;
      color:#FFF;
    }
    td{
      padding-left:15px;
    }
  }
  .result-text{
    margin-top: 20px;
    margin-bottom:10px;
  }
  .set_inputer_item {
    float: left;
    margin-right: 8px;
    width: 126px;
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
