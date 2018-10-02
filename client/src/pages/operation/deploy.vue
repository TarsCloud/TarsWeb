<template>
  <div class="page_operation_deploy">
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="480px"
      @submit.native.prevent="save"
    >
      <let-form-item :label="$t('deployService.form.primaryBusiness')" required itemWidth="45%">
        <let-select v-model="model.primaryBusiness" size="small" required @change="choosePrimaryBusiness">
          <let-option v-for="item in primaryBusiness" :value="item.ServiceId" :key="item.ServiceId">{{item.ServiceName}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.secondaryBusiness')" required itemWidth="45%">
        <let-select v-model="model.secondaryBusiness" size="small" required @change="chooseSecondaryBusiness">
          <let-option v-for="item in secondaryBusiness" :value="item.SystemId" :key="item.SystemId">{{item.SystemName}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.thirdlyBusiness')" required itemWidth="45%">
        <let-select v-model="model.thirdlyBusiness" size="small" required @change="chooseThirdlyBusiness">
          <let-option v-for="item in thirdlyBusiness" :value="item.SubSystemId" :key="item.SubSystemId">{{item.SubSystemName}}</let-option>
        </let-select>
      </let-form-item>

      <!--<let-form-item :label="$t('deployService.form.app')" required>-->
      <!--<let-input-->
      <!--size="small"-->
      <!--v-model="model.application"-->
      <!--:placeholder="$t('deployService.form.placeholder')"-->
      <!--required-->
      <!--:required-tip="$t('deployService.form.appTips')"-->
      <!--pattern="^[a-zA-Z]+$"-->
      <!--:pattern-tip="$t('deployService.form.placeholder')"-->
      <!--&gt;</let-input>-->
      <!--</let-form-item>-->
      <let-form-item :label="$t('deployService.form.serviceName')" required itemWidth="45%">
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
      <let-form-item :label="$t('deployService.form.serviceType')" required itemWidth="45%">
        <let-select
          size="small"
          v-model="model.server_type"
          required
          :required-tip="$t('deployService.form.serviceTypeTips')"
        >
          <let-option v-for="d in types" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.template')" required itemWidth="45%">
        <let-select
          size="small"
          v-model="model.template_name"
          required
          :required-tip="$t('deployService.form.templateTips')"
        >
          <let-option v-for="d in templates" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('user.op')" v-show="enableAuth" itemWidth="45%">
        <let-input
          size="small"
          v-model="model.operator"
          :placeholder="$t('user.tips.sep')"
        ></let-input>
      </let-form-item>

      <let-form-item :label="$t('user.dev')" v-show="enableAuth" itemWidth="45%">
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
        <let-table-column :title="$t('deployService.table.th.threads')" width="80px">
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
        <let-table-column :title="$t('serverList.table.servant.maxConnecttions')" width="100px">
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
        <let-table-column :title="$t('serverList.table.servant.maxQueue')" width="80px">
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
        <let-table-column :title="$t('serverList.table.servant.timeout')" width="80px">
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
            >{{$t('operate.delete')}}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>

      <let-button type="button" theme="sub-primary" @click="getAutoPort()">{{$t('deployService.form.getPort')}}
      </let-button>
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
      <let-table :data="resultModal.resultList" :empty-msg="$t('common.nodata')"
                 :row-class-name="resultModal.rowClassName">
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
    'tars_cpp',
    'tars_java',
    'tars_php',
    'tars_nodejs',
    'not_tars',
  ];

  const getInitialModel = () => ({
    application: '',
    server_name: '',
    server_type: types[0],
    template_name: '',
    node_name: '0.0.0.0',
    enable_set: false,
    set_name: '',
    set_area: '',
    set_group: '',
    operator: '',
    developer: '',
    adapters: [{
      obj_name: '',
      bind_ip: '0.0.0.0',
      port: '',
      port_type: 'tcp',
      protocol: 'tars',
      thread_num: 5,
      max_connections: 200000,
      queuecap: 10000,
      queuetimeout: 60000,
    }],
    primaryBusiness: '',
    secondaryBusiness: '',
    thirdlyBusiness: '',
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
        model: getInitialModel(),
        enableAuth: false,
        resultModal: {
          show: false,
          resultList: [],
          rowClassName: (rowData) => {
            if (rowData && rowData.row && !rowData.row.rst) {
              return 'err-row'
            }
            return ''
          }
        },
        primaryBusiness: [],
        secondaryBusiness: [],
        thirdlyBusiness: []
      };
    },

    mounted() {
      this.$ajax.getJSON('/server/api/is_enable_auth').then((data) => {
        this.enableAuth = data.enableAuth || false;
      }).catch((err) => {

      });

      this.$ajax.getJSON('/server/api/template_name_list').then((data) => {
        this.templates = data;
        this.model.template_name = data[0];
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });

      this.$ajax.getJSON('/server/api/query_service').then((data) => {
        this.primaryBusiness = data;
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    methods: {
      choosePrimaryBusiness (ServiceId) {
        this.secondaryBusiness = [];
        this.thirdlyBusiness = [];
        this.model.secondaryBusiness = '';
        this.model.thirdlyBusiness = '';
        if (ServiceId === undefined || ServiceId === "") return false;
        this.$ajax.getJSON('/server/api/query_system', {ServiceId}).then((data) => {
          this.secondaryBusiness = data;
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      chooseSecondaryBusiness (SystemId) {
        this.thirdlyBusiness = [];
        this.model.thirdlyBusiness = '';
        if (SystemId === undefined || SystemId === "") return false;
        this.$ajax.getJSON('/server/api/query_module', {SystemId}).then((data) => {
          this.thirdlyBusiness = data;
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      chooseThirdlyBusiness (SubSystemId) {
        if (SubSystemId === undefined || SubSystemId === "") return false;
        let item = this.thirdlyBusiness.find(business => business.SubSystemId === SubSystemId);
        let {SubSystemEngName} = item;
        this.model.application = SubSystemEngName
      },

      addAdapter(template) {
        this.model.adapters.push(Object.assign({}, template));
      },
      deploy() {
        this.$confirm(this.$t('deployService.form.deployServiceTip'), this.$t('common.alert')).then(() => {
          const loading = this.$Loading.show();
          this.$ajax.postJSON('/server/api/deploy_server', this.model).then((data) => {
            loading.hide();
            if (data.tars_node_rst && data.tars_node_rst.length) {
              this.showResultModal(data.tars_node_rst);
            } else {
              this.$tip.success(this.$t('deployService.form.ret.success'));
            }
            this.model = getInitialModel();
            //this.$refs.form.resetValid();
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
        if (this.$refs.form.validate()) {
          const model = this.model;

          const loading = this.$Loading.show();
          this.$ajax.getJSON('/server/api/server_exist', {
            application: model.application,
            server_name: model.server_name,
            node_name: model.server_name,
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
      }
    },
  };
</script>

<style>
  .page_operation_deploy {

  .let-table {
    margin: 20px 0 36px;

  th span.required {
    display: inline-block;

  &
  :after {
    color: #f56c6c;
    content: '*';
    margin-left: 4px;
  }

  }
  tr.err-row td {
    background: #f56c77 !important;
    color: #FFF;
  }

  }
  .result-text {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  }
</style>
