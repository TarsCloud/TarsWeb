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
        <let-select :disabled="k8sApplyShow"
                    size="small"
                    v-model="model.ServerApp"
                    :placeholder="$t('deployService.form.placeholder')"
                    required
                    :required-tip="$t('deployService.form.appTips')"
                    pattern="^[a-zA-Z0-9]+$"
                    :pattern-tip="$t('deployService.form.placeholder')"
        >
          <let-option v-for="d in appList" :key="d.ServerApp" :value="d.ServerApp">{{ d.ServerApp }}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')" itemWidth="45%" required>
        <let-input :disabled="k8sApplyShow"
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
        <let-select :disabled="k8sApplyShow"
                    size="small"
                    v-model="model.ServerOption.ServerTemplate"
                    :placeholder="$t('pub.dlg.defaultValue')"
                    required
                    :required-tip="$t('deployService.form.templateTips')"
        >
          <let-option v-for="d in templates" :key="d.TemplateName" :value="d.TemplateName">{{ d.TemplateName }}
          </let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceMark')" itemWidth="45%">
        <let-input :disabled="k8sApplyShow"
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
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input :disabled="k8sApplyShow"
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
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input :disabled="k8sApplyShow"
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
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-radio v-model="props.row.IsTcp" :label="true" :disabled="k8sApplyShow">TCP</let-radio>
            <let-radio v-model="props.row.IsTcp" :label="false" :disabled="k8sApplyShow">UDP</let-radio>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.protocol')" width="180px">
          <template slot="head" slot-scope="props">
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-radio v-model="props.row.IsTaf" :label="true" :disabled="k8sApplyShow">TAF</let-radio>
            <let-radio v-model="props.row.IsTaf" :label="false" :disabled="k8sApplyShow">NOT TAF</let-radio>
          </template>
        </let-table-column>
        <let-table-column :title="$t('deployService.table.th.threads')" width="80px">
          <template slot="head" slot-scope="props">
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input :disabled="k8sApplyShow"
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
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input :disabled="k8sApplyShow"
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
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input :disabled="k8sApplyShow"
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
            <let-input :disabled="k8sApplyShow"
                       size="small"
                       type="number"
                       :min="0"
                       v-model="props.row.Timeout"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column :title="$t('operate.operates')" width="60px" v-if="!k8sApplyShow">
          <template slot-scope="props">
            <let-table-operation @click="addAdapter(props.row)" v-if="props.$index === 0">{{ $t('operate.add') }}
            </let-table-operation>
            <let-table-operation
                v-if="props.$index"
                class="danger"
                @click="model.ServerServant.splice(props.$index, 1)"
            >{{ $t('operate.delete') }}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <let-button type="submit" theme="primary" v-if="!k8sApplyShow">{{ $t('common.submit') }}</let-button>
    </let-form>

    <!--完善k8s其他参数-->
    <div v-if="k8sApplyShow">
      <b>{{ $t('deployService.form.k8sExtra') }}</b>
      <el-collapse v-model="activeTab" accordion style="margin-top: 5px">
        <!--节点选择-->
        <el-collapse-item name="0">
          <template slot="title"><b>{{ $t('operate.nodeSelect') }}</b></template>
          <let-form itemWidth="360px" :columns="2" class="two-columns" ref="nodeSelect">
            <let-form-item :label="$t('deployService.form.affinity')" itemWidth="45%">
              <el-select v-model="k8sApplyModel.abilityAffinity" size="small" style="width: 95%">
                <el-option v-for="item in abilityAffinities" :key="item" :value="item">{{ item }}</el-option>
              </el-select>
            </let-form-item>
            <let-form-item v-if="k8sApplyModel.NodeSelector.length==0" itemWidth="45%">
              <el-button type="text" @click="addItems(0,k8sApplyModel.NodeSelector)">
                {{ $t('deployService.form.labelMatch.addLabel') }}
              </el-button>
            </let-form-item>
            <div v-for="(item,index) in k8sApplyModel.NodeSelector">
              <let-form-item :label="$t('nodeList.table.th.label')" itemWidth="15%">
                <el-input size="small" v-model="item.key" style="width: 95%"></el-input>
              </let-form-item>
              <let-form-item label="operator" itemWidth="10%">
                <el-select v-model="item.operator" size="small" @change="changeLabelOperator" style="width: 95%">
                  <el-option v-for="item in LabelMatchOperator" :key="item" :value="item">{{ item }}</el-option>
                </el-select>
              </let-form-item>
              <let-form-item :label="$t('nodes.label.value')" itemWidth="20%">
                <el-select :disabled="item.disableValue" style="width: 95%"
                           v-model="item.values" multiple filterable allow-create
                           :multiple-limit="63" default-first-option
                           :placeholder="$t('deployService.form.labelMatch.labelValue')" size="small"
                           @change="(val)=>{addLabelValues(val, index)}">
                  <el-option v-for="item in item.values" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </let-form-item>
              <el-button type="primary" icon="el-icon-plus" size="mini" circle
                         @click="addItems(index,k8sApplyModel.NodeSelector)"></el-button>
              <el-button type="danger" icon="el-icon-minus" size="mini" circle
                         @click="delItems(index,k8sApplyModel.NodeSelector)"></el-button>
            </div>
          </let-form>
        </el-collapse-item>

        <!--宿主机资源-->
        <el-collapse-item name="1">
          <template slot="title"><b>{{ $t('operate.network') }}</b></template>
          <let-form ref="networkForm" itemWidth="360px" :columns="2" class="two-columns">
            <let-form-item :label="$t('deployService.table.th.hostIpc')" itemWidth="25%">
              <el-radio-group v-model="k8sApplyModel.HostIpc" @change="changeKind">
                <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                <el-radio :label="false">{{ $t('common.false') }}</el-radio>
              </el-radio-group>
            </let-form-item>
            <let-form-item :label="$t('deployService.table.th.hostNetwork')" itemWidth="25%">
              <el-radio-group v-model="k8sApplyModel.HostNetwork" @change="changeKind">
                <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                <el-radio :label="false">{{ $t('common.false') }}</el-radio>
              </el-radio-group>
            </let-form-item>
            <let-form-item :label="$t('deployService.table.th.hostPort')" itemWidth="25%">
              <el-radio-group v-model="k8sApplyModel.showHostPort" @change="changeKind">
                <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                <el-radio :label="false">{{ $t('common.false') }}</el-radio>
              </el-radio-group>
            </let-form-item>
            <div v-if="k8sApplyModel.showHostPort" style="padding-right:30px;">
              <let-table :data="k8sApplyModel.HostPortArr">
                <let-table-column title="OBJ">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{ props.column.title }}</span>
                  </template>
                  <template slot-scope="props">
                    <let-input
                        size="small"
                        v-model="props.row.obj"
                        :placeholder="$t('deployService.form.placeholder')"
                        required
                        :required-tip="$t('deployService.form.objTips')"
                        pattern="^[a-zA-Z0-9]+$"
                        :pattern-tip="$t('deployService.form.placeholder')"
                    ></let-input>
                  </template>
                </let-table-column>
                <let-table-column :title="$t('deployService.table.th.hostPort')">
                  <template slot="head" slot-scope="props">
                    <span class="required">{{ props.column.title }}</span>
                  </template>
                  <template slot-scope="props">
                    <let-input size="small" type="number" :min="1" :max="65535"
                               v-model="props.row.HostPort" placeholder="1-65535"
                               required :required-tip="$t('deployService.table.tips.empty')"
                    ></let-input>
                  </template>
                </let-table-column>
                <let-table-column>
                  <template slot-scope="props">
                    <let-button size="small" theme="primary" class="port-button"
                                @click="generateHostPort(props.row)">
                      {{ $t('deployService.table.th.checkHostPort') }}
                    </let-button>
                  </template>
                </let-table-column>
              </let-table>
            </div>
          </let-form>
        </el-collapse-item>

        <!--磁盘管理-->
        <el-collapse-item name="2">
          <template slot="title"><b>{{ $t('operate.disk') }}</b></template>
          <div v-if="k8sApplyModel.mounts.length==0">
            <el-button type="text" size="mini" @click="addDisk(0,k8sApplyModel.mounts)" style="margin-left: 20px">
              {{ $t("deployService.disk.addDisk") }}
            </el-button>
          </div>
          <el-form label-position="top" label-width="120px" size="mini" ref="disk">
            <div v-for="(disk,index) in k8sApplyModel.mounts" :key="index">
              <el-card>
                <el-row :gutter="18">
                  <el-col :span="6">
                    <el-form-item :label="$t('deployService.disk.diskName')" required>
                      <el-input v-model="disk.name"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="$t('deployService.disk.path')" required>
                      <el-input v-model="disk.mountPath"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="18">
                  <el-col :span="4">
                    <el-form-item label="uid" required>
                      <el-input v-model="disk.source.tLocalVolume.uid" placeholder="0"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-form-item label="gid" required>
                      <el-input v-model="disk.source.tLocalVolume.gid" placeholder="0"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="4">
                    <el-form-item label="mode" required>
                      <el-input v-model="disk.source.tLocalVolume.mode" placeholder="755"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :offset="9">
                    <el-button type="primary" size="mini" @click="addDisk(index,k8sApplyModel.mounts)">
                      {{ $t("deployService.disk.addDisk") }}
                    </el-button>
                    <el-button type="danger" size="mini" @click="delDisk(index,k8sApplyModel.mounts)"
                               style="margin-left: 20px">
                      {{ $t("deployService.disk.delDisk") }}
                    </el-button>
                  </el-col>
                </el-row>
              </el-card>
            </div>
          </el-form>
        </el-collapse-item>

        <!--资源管理-->
        <el-collapse-item name="3">
          <template slot="title"><b>{{ $t('operate.resource') }}</b></template>
          <el-form label-width="100px" label-position="top" size="mini">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="$t('deployService.resources.limitCpu')" itemWidth="50%">
                  <el-input :placeholder="$t('deployService.resources.example')+':1000'"
                            v-model="k8sApplyModel.resources.limitCpu" size="small"
                            onkeyup="value=value.replace(/[^\d]/g,'')">
                    <template slot="append">milli CPUs</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('deployService.resources.limitMem')" itemWidth="50%">
                  <el-input :placeholder="$t('deployService.resources.example')+':128'"
                            v-model="k8sApplyModel.resources.limitMem" size="small"
                            onkeyup="value=value.replace(/[^\d]/g,'')">
                    <template slot="append">MiB</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="$t('deployService.resources.requestCpu')" itemWidth="50%">
                  <el-input :placeholder="$t('deployService.resources.example')+':1000'"
                            v-model="k8sApplyModel.resources.requestCpu" size="small"
                            onkeyup="value=value.replace(/[^\d]/g,'')">
                    <template slot="append">milli CPUs</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('deployService.resources.requestMem')" itemWidth="50%">
                  <el-input :placeholder="$t('deployService.resources.example')+':128'"
                            v-model="k8sApplyModel.resources.requestMem" size="small"
                            onkeyup="value=value.replace(/[^\d]/g,'')">
                    <template slot="append">MiB</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <el-button @click="editYaml" style="margin-top: 10px">yaml编辑</el-button>
      <el-button type="primary" @click="saveK8s" style="margin-top: 10px">{{ $t('operate.save') }}</el-button>
    </div>

    <let-modal
        v-model="yamlModel.show"
        width="1000px"
        class="more-cmd"
        :footShow="false"
        @close="closeYamlModel"
        @on-cancel="closeYamlModel">
      <k8s-yaml-edit @successFun="closeYamlModel"  ref="yamlEdit"></k8s-yaml-edit>
    </let-modal>

    <let-modal
        v-model="resultModal.show"
        width="700px"
        class="more-cmd"
        :footShow="false"
        @close="closeResultModal"
        @on-cancel="closeResultModal">
      <p class="result-text">{{ $t('deployService.form.ret.success') }}{{ $t('resource.installRstMsg') }}</p>
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
import lodash from "lodash"
import K8sYamlEdit from "../../components/k8s-yaml-edit";

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
});

export default {
  name: 'OperationDeploy',

  components: {
    SetInputer,
    K8sYamlEdit
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
        rowClassName: (rowData) => {
          0
          if (rowData && rowData.row && !rowData.row.rst) {
            return 'err-row'
          }
          return ''
        }
      },

      DeployId: "",
      activeTab: "0",
      k8sApplyShow: false,
      k8sApplyModel: {
        NodeSelector: [],
        tars: {},
        resources: {},
        mounts: []
      },

      abilityAffinities: ["AppRequired", "ServerRequired", "AppOrServerPreferred", "None"],
      LabelMatchOperator: [],
      yamlModel: {
        show: false
      }
    };
  },
  mounted() {
    this.getServerTemplate()
    this.getDefaultValue()
    this.getAppList()
    this.getNodeList()
    // this.showK8sExtra("")
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
  methods: {
    showHostPort(data) {
      data.showHostPort = true
    },
    hideHostPort(data) {
      data.HostPort = 0
      data.showHostPort = false
    },
    checkedChange(val) {
      if (this.NodeListArr.indexOf(val) > -1) {
        this.NodeListArr.splice(this.NodeListArr.indexOf(val), 1)
      } else {
        this.NodeListArr.push(val)
      }

      if (this.NodeListArr.length === 0) {
        this.isCheckedAll = false
      }
    },
    addAdapter(template) {
      template = this.model.ServerServant[this.model.ServerServant.length - 1]
      const Port = template.Port + 1
      const newObj = Object.assign({}, template, {Port})
      this.model.ServerServant.push(Object.assign({}, newObj))
    },
    deploy() {
      if (this.$refs.form.validate()) {
        this.$confirm(this.$t('deployService.form.deployServiceTip'), this.$t('common.alert')).then(() => {
          const loading = this.$Loading.show();
          this.$ajax.postJSON('/k8s/api/deploy_create', this.model).then((data) => {
            loading.hide();
            this.DeployId = data.metadata.name
            this.showK8sExtra(data.metadata.name);
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
    save() {
      this.deploy();
    },
    showResultModal(data) {
      this.resultModal.resultList = data;
      this.resultModal.show = true;
    },
    closeResultModal() {
      this.resultModal.show = false;
      this.resultModal.resultList = [];
    },

    getDefaultValue() {
      let {ServerServant, ServerOption} = this.model
      this.$ajax.getJSON('/k8s/api/default', {}).then((data) => {
        if (data.ServerServantElem) {
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
        if (data.ServerOption) {
          ServerOption = data.ServerOption
        }
        this.model.ServerServant = ServerServant
        this.model.ServerOption = ServerOption
        this.LabelMatchOperator = data.LabelMatchOperator
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    getAppList() {
      this.$ajax.getJSON('/k8s/api/application_select', {isAll: true}).then((data) => {
        this.appList = data.Data
      })
    },
    getNodeList() {
      this.$ajax.getJSON('/k8s/api/node_list', {isAll: true}).then((data) => {
        this.NodeList = data
      })
    },

    showK8sExtra(deployName) {
      this.k8sApplyShow = true;
      this.$ajax.getJSON('/k8s/api/deploy_select', {deployName: deployName}).then((data) => {
        let deploy = lodash.cloneDeep(data.Data[0]);
        console.log("deploy:" + JSON.stringify(deploy, null, 4));
        this.k8sApplyModel = {
          abilityAffinity: deploy.ServerK8S.abilityAffinity,
          NodeSelector: deploy.ServerK8S.NodeSelector,
          HostIpc: deploy.ServerK8S.HostIpc,
          HostNetwork: deploy.ServerK8S.HostNetwork,
          mounts: deploy.Mounts.filter(item => item.source.hasOwnProperty("tLocalVolume")),
          resources: deploy.resources
        }
        let arr = []
        if (deploy.ServerK8S.HostPort && Object.keys(deploy.ServerK8S.HostPort).length > 0) {
          this.k8sApplyModel.showHostPort = true
          deploy.ServerK8S.HostPort.forEach(item => {
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
          for (let key in deploy.ServerServant) {
            this.k8sApplyModel.HostPortArr.push({
              obj: key,
              HostPort: 0
            })
          }
        }
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    //节点管理
    addItems(index, obj) {
      if (obj.length >= 63) {
        this.$message.error(`${this.$t('deployService.form.labelMatch.labelMax')}`);
        return;
      }
      obj.splice(index + 1, 0, {"key": "", "operator": "In", "values": []})
      this.$forceUpdate();
    },
    delItems(index, obj) {
      obj.splice(index, 1);
      this.$forceUpdate();
    },
    addLabelValues(val, index) {
      let reg = /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]?$/
      this.labelMatchArr[index].values.forEach((item, index) => {
        if (!reg.test(item)) {
          this.labelMatchArr[index].values.splice(index, 1)
          this.$message.error(`${this.$t('deployService.form.labelMatch.labelValueValid')}`);
        }
      })
    },
    changeLabelOperator(val) {
      this.labelMatchArr.forEach(item => {
        if (item.operator == "Exists" || item.operator == "DoesNotExist") {
          this.$set(item, "disableValue", true)
          this.$set(item, "values", [])
        } else {
          this.$set(item, "disableValue", false)
        }
      });
    },
    //宿主资源
    changeKind() {
      this.$forceUpdate()
    },
    // 自动生成端口
    generateHostPort(hostPort) {
      this.$ajax.getJSON("/k8s/api/check_host_port", {
        NodePort: hostPort.HostPort
      }).then((res) => {
        let msg = ""
        res.forEach(item => {
          if (item.ret == -1) {//telnet 不通
            msg += `<p>${item.node}:${item.port}: can use</p>`
          } else {
            msg += `<p style="color: #F56C6C">${item.node}:${item.port}: cannot use</p>`
          }
        })
        this.$message.success({
          dangerouslyUseHTMLString: true,
          message: msg,
        });
      }).catch((err) => {
        this.$message.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      })
    },
    addDisk(index, obj) {
      obj.splice(index + 1, 0, {
        name: "",
        source: {tLocalVolume: {uid: "", gid: "", mode: ""}},
        mountPath: ""
      })
      this.$forceUpdate();
    },
    delDisk(index, obj) {
      obj.splice(index, 1);
      this.$forceUpdate();
    },
    saveK8s() {
      console.log("this.model:" + JSON.stringify(this.model, null, 4));
      console.log("this.k8sApplyModel:" + JSON.stringify(this.k8sApplyModel, null, 4));
      this.$ajax.postJSON('/k8s/api/deploy_update', {
        DeployId: this.DeployId,
        ServerServant: this.model.ServerServant,
        ServerOption: this.model.ServerOption,
        ServerK8S: this.k8sApplyModel,
      }).then((data) => {
        this.$tip.success(`${this.$t('common.success')}`)
        this.$router.replace("/operation/approval");
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    editYaml(){
      this.yamlModel.show = true;
      this.$refs.yamlEdit.show(this.DeployId, "tdeploys")
    },
    closeYamlModel() {
      this.yamlModel.show = false;
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

td {
  padding-left: 15px;
}

}
.result-text {
  margin-top: 20px;
  margin-bottom: 10px;
}

.set_inputer_item {
  float: left;
  margin-right: 8px;
  width: 126px;
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
  width: 33.33%
}

}
</style>
