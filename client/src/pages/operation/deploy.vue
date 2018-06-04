<template>
  <div class="page_operation_deploy">
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="480px"
      @submit.native.prevent="save"
    >
      <let-form-item label="应用" required>
        <let-input
          size="small"
          v-model="model.application"
          placeholder="应用名只能包含英文字母"
          required
          required-tip="应用名不能为空"
          pattern="^[a-zA-Z]+$"
          pattern-tip="应用名只能包含英文字母"
        ></let-input>
      </let-form-item>
      <let-form-item label="服务名称" required>
        <let-input
          size="small"
          v-model="model.server_name"
          placeholder="服务名只能包含英文字母、数字，并以字母开头"
          required
          required-tip="服务名不能为空"
          pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
          pattern-tip="服务名只能包含英文字母、数字，并以字母开头"
        ></let-input>
      </let-form-item>
      <let-form-item label="服务类型" required>
        <let-select
          size="small"
          v-model="model.server_type"
          required
          required-tip="服务类型不能为空"
        >
          <let-option v-for="d in types" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item label="模板" required>
        <let-select
          size="small"
          v-model="model.template_name"
          required
          required-tip="模板不能为空"
        >
          <let-option v-for="d in templates" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>
      <let-form-item label="节点" required>
        <let-input
          size="small"
          v-model="model.node_name"
          placeholder="节点"
          required
          required-tip="节点不能为空"
          pattern="^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$"
          pattern-tip="请输入正确的IP地址"
        ></let-input>
      </let-form-item>
      <let-form-item label="Set 分组">
        <SetInputer
          :enabled.sync="model.enable_set"
          :name.sync="model.set_name"
          :area.sync="model.set_area"
          :group.sync="model.set_group"
        ></SetInputer>
      </let-form-item>

      <let-form-item label="运维人员" v-show="enableAuth">
        <let-input
          size="small"
          v-model="model.operator"
          placeholder="运维人员，多个人员用分号隔开"
        ></let-input>
      </let-form-item>

      <let-form-item label="开发人员" v-show="enableAuth">
        <let-input
          size="small"
          v-model="model.developer"
          placeholder="开发人员，多个人员用分号隔开"
        ></let-input>

      </let-form-item>

      <let-table :data="model.adapters">
        <let-table-column title="OBJ名称">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              v-model="props.row.obj_name"
              placeholder="英文字母"
              required
              required-tip="OBJ名称不能为空"
              pattern="^[a-zA-Z0-9]+$"
              pattern-tip="OBJ名称只能包含英文字母"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="OBJ绑定IP">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
              v-model="props.row.bind_ip"
              placeholder="IP地址"
              required
              required-tip="绑定IP不能为空"
              pattern="^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$"
              pattern-tip="请输入正确的IP地址"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="端口" width="100px">
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
              required-tip="端口不能为空"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="端口类型" width="150px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-radio v-model="props.row.port_type" label="tcp">TCP</let-radio>
            <let-radio v-model="props.row.port_type" label="udp">UDP</let-radio>
          </template>
        </let-table-column>
        <let-table-column title="协议" width="180px">
          <template slot="head" slot-scope="props">
            <span class="required">{{props.column.title}}</span>
          </template>
          <template slot-scope="props">
            <let-radio v-model="props.row.protocol" label="tars">TARS</let-radio>
            <let-radio v-model="props.row.protocol" label="not_tars">非TARS</let-radio>
          </template>
        </let-table-column>
        <let-table-column title="线程数" width="80px">
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
              required-tip="线程数不能为空"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="最大链接数" width="140px">
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
              required-tip="最大链接数不能为空"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="队列最大程度" width="140px">
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
              required-tip="队列最大程度不能为空"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="队列超时时间(ms)" width="140px">
          <template slot-scope="props">
            <let-input
              size="small"
              type="number"
              :min="0"
              v-model="props.row.queuetimeout"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="操作" width="120px">
          <template slot-scope="props">
            <let-table-operation @click="addAdapter(props.row)">添加</let-table-operation>
            <let-table-operation
              v-if="props.$index"
               class="danger"
              @click="model.adapters.splice(props.$index, 1)"
            >删除</let-table-operation>
          </template>
        </let-table-column>
      </let-table>

      <let-button type="button" theme="sub-primary" @click="getAutoPort()">自动获取端口</let-button>
      <let-button type="submit" theme="primary">提交</let-button>

    </let-form>
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
    max_connections: 200000,
    queuecap: 10000,
    queuetimeout: 60000,
  }],
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
    };
  },

  mounted() {
    this.$ajax.getJSON('/server/api/is_enable_auth').then((data) => {
      this.enableAuth = data.enableAuth || false;
    }).catch((err)=>{

    });

    this.$ajax.getJSON('/server/api/template_name_list').then((data) => {
      this.templates = data;
      this.model.template_name = data[0];
    }).catch((err) => {
      this.$tip.error(`获取数据失败: ${err.message || err.err_msg}`);
    });

    this.$watch('model.node_name', (val, oldVal) => {
      if (val === oldVal) {
        return;
      }

      this.model.adapters.forEach((d) => {
        d.bind_ip = val; // eslint-disable-line no-param-reassign
      });
    });
  },

  methods: {
    addAdapter(template) {
      this.model.adapters.push(Object.assign({}, template));
    },
    deploy() {
      this.$confirm('确定部署？', '提示').then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/deploy_server', this.model).then(() => {
          loading.hide();
          this.$tip.success('部署成功');
          this.model = getInitialModel();
          this.model.template_name = this.templates[0];
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`部署失败: ${err.message || err.err_msg}`);
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
          this.$tip.error(`自动获取端口失败: ${err.message || err.err_msg}`);
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
            this.$tip.error('系统中已存在此服务，请更换应用名，服务名或节点后重试');
          } else {
            this.deploy();
          }
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`部署失败: ${err.message || err.err_msg}`);
        });
      }
    },
  },
};
</script>

<style>
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
  }
}
</style>
