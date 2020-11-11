

<template>
  <div class="page_operation_deploy">
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="480px"
      v-show="deployShow"
      @submit.native.prevent="save"
    >
      <let-form-item :label="$t('deployService.form.app')" required>
        <let-select id="inputApplication" v-model="model.application" size="small" filterable :notFoundText="$t('deployService.form.appAdd')">
          <let-option v-for="d in applicationList" :key="d" :value="d">
            {{d}}
          </let-option>
        </let-select>

      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')" required>
        <let-input
          size="small"
          v-model="model.server_name"
          :placeholder="$t('deployService.form.serviceFormatTips')"
          required
          :required-tip="$t('deployService.form.serviceTips')"
          pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
          :pattern-tip="$t('deployService.form.serviceFormatTips')"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceType')" required>
        <let-select
          size="small"
          v-model="model.server_type"
          required
          :required-tip="$t('deployService.form.serviceTypeTips')"
        >
          <let-option v-for="d in types" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>

      <let-form-item :label="$t('deployService.form.template')" required>
        <let-select
          size="small"
          v-model="model.template_name"
          required
          :required-tip="$t('deployService.form.templateTips')"
        >
          <let-option v-for="d in templates" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>

    <!-- 
      <let-form-item :label="$t('serverList.table.th.ip')" required>
        <let-select v-model="model.node_name" size="small" required filterable>
          <let-option v-for="d in nodeList" :key="d" :value="d">
            {{d}}
          </let-option>
        </let-select>
       
      </let-form-item> -->

      <let-form-item label="SET">
        <SetInputer
          :enabled.sync="model.enable_set"
          :name.sync="model.set_name"
          :area.sync="model.set_area"
          :group.sync="model.set_group"
        ></SetInputer>
      </let-form-item>

      <let-form-item :label="$t('user.op')" v-show="enableAuth">
        <let-input
          size="small"
          v-model="model.operator"
          :placeholder="$t('user.tips.sep')"
        ></let-input>
      </let-form-item>

      <let-form-item :label="$t('user.dev')" v-show="enableAuth">
        <let-input
          size="small"
          v-model="model.developer"
          :placeholder="$t('user.tips.sep')"
        ></let-input>

      </let-form-item>

      <let-table :data="model.adapters">
        <let-table-column title="OBJ">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              v-model="props.row.obj_name"
              :placeholder="$t('deployService.form.placeholder')"
              required
              :required-tip="$t('deployService.form.objTips')"
              pattern="^[a-zA-Z0-9]+$"
              :pattern-tip="$t('deployService.form.placeholder')"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.form.node_name')"  width="180px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-select @change="nodeNameChange(props.row)" v-model="props.row.node_name" size="small" required filterable>
            <let-option v-for="d in nodeList" :key="d" :value="d">
              {{d}}
            </let-option>
          </let-select>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.endpoint')"  width="140px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              v-model="props.row.bind_ip"
              placeholder="IP"
              required
              :required-tip="$t('deployService.table.tips.ip')"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.port')" width="90px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              :max="65535"
              v-model="props.row.port"
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
            <let-radio v-model="props.row.port_type" label="tcp">TCP</let-radio>
            <let-radio v-model="props.row.port_type" label="udp">UDP</let-radio>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.protocol')" width="180px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-radio v-model="props.row.protocol" label="tars">TARS</let-radio>
            <let-radio v-model="props.row.protocol" label="not_tars">{{$t('serverList.servant.notTARS')}}</let-radio>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.threads')" width="60px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.thread_num"
              required
              :required-tip="$t('deployService.table.tips.empty')"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.servant.maxConnecttions')" width="90px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.max_connections"
              required
              :required-tip="$t('deployService.table.tips.empty')"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.servant.maxQueue')" width="90px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.queuecap"
              required
              :required-tip="$t('deployService.table.tips.empty')"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.servant.timeout')" width="90px">
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.queuetimeout"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('operate.operates')" width="60px">
          <template slot-scope="props">
            <let-table-operation @click="addAdapter(props.row)">{{$t('operate.add')}}</let-table-operation>
            <let-table-operation
              v-if="props.$index"
               class="danger"
              @click="model.adapters.splice(props.$index, 1)"
            >{{$t('operate.delete')}}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>

      <let-button type="button" theme="sub-primary" @click="getAutoPort()">{{$t('deployService.form.getPort')}}</let-button>
      &nbsp;&nbsp;
      <let-button type="submit" theme="primary">{{$t('common.submit')}}</let-button>
    </let-form>

    <let-modal
      v-model="resultModal.show"
      width="700px"
      class="more-cmd"
      :footShow="false"
      @close="closeResultModal"
      style="text-align: center;"
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

    <div style="width:400px;margin:0 auto;" v-show="deployModal.show">
      <let-form ref="deployForm" itemWidth="400px">
          <let-form-item :label="$t('nodes.node_name')" >
            <let-select v-model="deployModal.node_name">
              <let-option v-for="d in nodeList" :key="d" :value="d">
                {{d}}
              </let-option>
            </let-select>
<!--
            <let-input
              v-model="deployModal.node_name"
              :placeholder="$t('nodes.nodeNameTips')"
              required
              :required-tip="$t('nodes.nodeNameTips')"
            ></let-input>
-->
          </let-form-item>

        <let-form-item :label="$t('pub.dlg.releaseVersion')">
          <let-select
            v-model="deployModal.model.patch_id"
            required
            :required-tip="$t('pub.dlg.ab')"
          >
            <let-option v-for="d in deployModal.model.patchList" :key="d.id" :value="d.id">
              {{d.id}} | {{d.posttime}} | {{d.comment}}
            </let-option>
          </let-select>

        </let-form-item>
      </let-form> 
      <div style="width:100%;text-align: center;">
        <let-tag>{{$t('deployLog.info')}}</let-tag>
        <let-button type="submit" theme="primary" style="margin:20px auto" @click="doDeployLog">{{$t('deployLog.install')}}</let-button>
      </div>
    </div>

    <PublishStatus ref="publishStatus"></PublishStatus>
  </div>
</template>

<script>
import PublishStatus from '../publish/status';

import SetInputer from '@/components/set-inputer';

const types = [
  'tars_cpp',
  'tars_java',
  'tars_php',
  'tars_nodejs',
  'not_tars',
  'tars_go'
];

const tars_templates = [
  'tars.tarsregistry',
  'tars.tarsAdminRegistry',
  'tars.tarspatch',
  'tars.tarsnode',
  'tars.tarsconfig',
  'tars.tarsnotify',
  'tars.tarsstat',
  'tars.tarsquerystat',
  'tars.tarsproperty',
  'tars.tarsqueryproperty',
  'tars.framework-db',
  'tars.tarslog',
];

const getInitialModel = () => ({
  application: '',
  server_name: '',
  server_type: types[0],
  template_name: '',
  node_name: '',
  enable_set: false,
  set_name: '',
  set_area: '',
  set_group: '',
  operator: '',
  developer: '',
  adapters: [{
    obj_name: '',
    bind_ip: '',
    port: '',
    port_type: 'tcp',
    protocol: 'tars',
    thread_num: 5,
    max_connections: 100000,
    queuecap: 50000,
    queuetimeout: 20000,
  }],
});

export default {
  name: 'OperationDeploy',
  components: {
    SetInputer,
    PublishStatus,
  },

  data() {
    return {
      types,
      // tars_templates,
      applicationList: [],
      nodeList:[],
      all_templates: [],
      // notars_templates: [],
      templates: [],
      model: getInitialModel(),
      enableAuth: false,
      deployShow: false,
      deployModal: {
        show: false,
        // close: true,
        node_name: '',
        model: {
          patch_id: '',
          patchList: [],
          serverList: [], 
        }
      },
      resultModal: {
        show: false,
        resultList: [],
        rowClassName: (rowData)=>{
           if(rowData && rowData.row && !rowData.row.rst){
              return 'err-row'
           }
           return ''
        }
      }
    };
  },
  mounted() {
    this.$ajax.getJSON('/server/api/is_enable_auth').then((data) => {
      this.enableAuth = data.enableAuth || false;
    }).catch((err)=>{

    });

    this.$ajax.getJSON('/server/api/application_list').then((data) => {
      this.applicationList = data;
    }).catch((err) => {
      this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    });

    this.$ajax.getJSON('/server/api/node_list').then((data) => {
      this.nodeList = data;
    }).catch((err) => {
      this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    });

    this.$ajax.getJSON('/server/api/template_name_list').then((data) => {
      this.templates = data;
      this.all_templates = data;
      // this.notars_templates = [];
      
      // this.all_templates.forEach((e) => {
      //   var index;
      //   for(index = 0; index < this.tars_templates.length; index++) {
      //     if(this.tars_templates[index] == e)
      //       return;
      //   }
      //   this.notars_templates.push(e);
      // });

      this.model.template_name = data[0];

      // var application = document.querySelector("#inputApplication .let-select__filter__input");
      // var that = this;

      // application.onblur=function(){
      //   that.changeApplication(this.value);
      // }

    }).catch((err) => {
      this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
    });

    this.$watch('props.row.node_name', (val, oldVal) => {
      if (val === oldVal) {
        return;
      }

      this.model.adapters.forEach((d) => {
        d.bind_ip = val; // eslint-disable-line no-param-reassign
      });
    });
   
    this.checkDeployLog();
  },

  methods: {
    nodeNameChange(obj) {
      obj.bind_ip = obj.node_name
    },
    // changeApplication(app) {
    //   if(app == 'tars') {
    //     this.templates = this.tars_templates;
    //   } else {
    //     this.templates = this.notars_templates;
    //   }
    // },
    addAdapter(template) {
      this.model.adapters.push(Object.assign({}, template));
    },
    deploy() {
      let objNode = [];
      for (var i = 0; i < this.model.adapters.length; i++) {
        var oo = this.model.adapters[i].obj_name + "-" + this.model.adapters[i].node_name;
        if (objNode.indexOf(oo) != -1) {
          this.$tip.error(`${this.$t('deployService.infos.objNodedupErr')}`);
          return;
        } else {
          objNode.push(oo);
        }
      }

      this.$confirm(this.$t('deployService.form.deployServiceTip'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();

        this.$ajax.postJSON('/server/api/deploy_server', this.model).then((data) => {
          loading.hide();
          if(data.tars_node_rst && data.tars_node_rst.length){
            this.showResultModal(data.tars_node_rst);
          }else{
            this.$tip.success(this.$t('deployService.form.ret.success'));
          }
          this.model = getInitialModel();
          this.model.template_name = this.templates[0];
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      });
    },
    getAutoPort(){
        const loading = this.$Loading.show();
        var adapters = this.model.adapters;
        var bindIps = [];
        adapters.forEach((adapter) => {
          bindIps.push(adapter.bind_ip);
        });
        this.$ajax.getJSON('/server/api/auto_port', {node_name: bindIps.join(';')}).then((data) => {
            loading.hide();
            data.forEach((node, index) => {
              this.$set(adapters[index], 'port', String(node.port || ''));
            });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
    },
    save() {
      var application = document.querySelector("#inputApplication .let-select__filter__input").value.trim();

      if(this.model.application == '') {
        this.model.application = application;
      }

      if (this.$refs.form.validate()) {
        const model = this.model;

        const loading = this.$Loading.show();
        this.$ajax.getJSON('/server/api/server_exist', {
          application: model.application,
          server_name: model.server_name,
          //node_name: model.node_name,
        }).then((isExists) => {
          loading.hide();
          if (isExists) {
            this.$tip.error(this.$t('deployService.form.nameTips'));
          } else {
            this.deploy();
          }
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    showResultModal(data){
      this.resultModal.resultList = data;
      this.resultModal.show = true;
    },

    closeResultModal(){
      this.resultModal.show = false;
      this.resultModal.resultList = [];
    },
    checkDeployLog() {
      this.$ajax.getJSON('/server/api/need_deploy_log').then((data) => {
        this.deployModal.show = data.need;
        this.deployShow = !data.need; 
        if(data.need) {
          this.showDeployLog();
        }
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },  
    getPatchList(application, serverName, currPage, pageSize) {
      return this.$ajax.getJSON('/server/api/server_patch_list', {
        application,
        module_name: serverName,
        curr_page : currPage,
        page_size : pageSize
      });
    },
    showDeployLog() {
      let application = 'tars';
      let server_name = 'tarslog';
      this.deployModal.model = {
        application: application,
        server_name: server_name,
        patch_id: '',
        patchList: [],
      };
      this.getPatchList(application, server_name, 1, 10).then((data) => {
        this.deployModal.model.patchList = data.rows;
      });      
    },
    doDeployLog() {
      if (this.$refs.deployForm.validate()) {
        this.$ajax.getJSON('/server/api/expand_deploy_log', {node_name:this.deployModal.node_name}).then((data) => {

          this.deployModal.model.serverList = data.server;

          this.$refs.publishStatus.savePublishServer(this.deployModal, this.onCancel);

        }).catch((err) => {
          this.$tip.error(`${this.$t('deployLog.failed')}: ${err.err_msg || err.message}`);
        });
      }
    },
    onCancel() {
      this.checkDeployLog();
    }
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
}
</style>
