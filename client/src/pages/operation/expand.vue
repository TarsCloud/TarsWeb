<template>
  <div class="page_operation_expand">
    <!-- 预扩容配置 -->
    <let-form
      ref="configForm"
      inline
      label-position="top"
      itemWidth="480px"
      @submit.native.prevent="previewExpand"
    >
      <let-form-item label="应用" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="model.application"
          required
          required-tip="应用名不能为空"
          @change="changeSelect('application')"
        >
          <let-option v-for="d in applications" :key="d" :value="d">
            {{d}}
          </let-option>
        </let-select>
      </let-form-item>
      <let-form-item label="服务" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="model.server_name"
          required
          required-tip="服务名不能为空"
          @change="changeSelect('server_name')"
          >
          <let-option v-for="d in serverNames" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>

      <let-form-item label="Set" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="model.set"
          required
          required-tip="set不能为空"
          @change="changeSelect('set')"
          >
          <let-option v-for="d in sets" :key="d" :value="d ? d : -1">
            {{d ? d : '不启用Set'}}
          </let-option>
        </let-select>
      </let-form-item>

      <let-form-item label="节点" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="model.node_name"
          required
          required-tip="节点不能为空"
          >
          <let-option v-for="d in nodeNames" :key="d" :value="d">{{d}}</let-option>
        </let-select>
      </let-form-item>

      <let-form-item label="目标IP" itemWidth="100%" required>
        <let-input
          type="textarea"
          :rows="3"
          v-model="expandIpStr"
          placeholder="可输入多个IP，以以逗号（,）、分号（;）或换行（\n）分隔"
          required
          required-tip="目标IP不能为空"
          >
        </let-input>
      </let-form-item>

      <let-form-item label="Set分组">
        <SetInputer
          :enabled.sync="model.enable_set"
          :name.sync="model.set_name"
          :area.sync="model.set_area"
          :group.sync="model.set_group"
        ></SetInputer>
      </let-form-item>

      <let-form-item label="节点配置" itemWidth="100%">
          <let-checkbox
            v-model="model.enable_node_copy">
            复制节点配置
          </let-checkbox>
      </let-form-item>

      <let-button type="sumbit" theme="primary">预扩容</let-button>
    </let-form>
    <!-- 预扩容列表 -->
    <let-form
      ref="expandForm"
      inline
      @submit.native.prevent="expand"
      class="mt40"
      v-show="previewItems.length > 0"
    >
      <let-table ref="table" :data="previewItems"  empty-msg="暂无扩容数据">
        <let-table-column>
          <template slot="head" slot-scope="props">
            <let-checkbox v-model="isCheckedAll"></let-checkbox>
          </template>
          <template slot-scope="scope">
            <let-checkbox v-model="scope.row.isChecked" v-if="scope.row.status == '未扩容'"></let-checkbox>
          </template>
        </let-table-column>
        <let-table-column title="应用" prop="application"></let-table-column>
        <let-table-column title="服务" prop="server_name"></let-table-column>
        <let-table-column title="Set" prop="set"></let-table-column>
        <let-table-column title="OBJ名称" prop="obj_name"></let-table-column>
        <let-table-column title="节点" prop="node_name"></let-table-column>
        <let-table-column title="绑定IP">
          <template slot-scope="scope">
            <let-input
              v-model="scope.row.bind_ip"
              :pattern="scope.row.isChecked ? ipReg : null"
              pattern-tip="请填写正确的IP地址"
            ></let-input>
          </template>
        </let-table-column>
        <let-table-column title="端口">
          <template slot-scope="scope">
            <let-input v-model="scope.row.port"></let-input>
          </template>
        </let-table-column>
        <let-table-column title="模板名" prop="template_name"></let-table-column>
        <let-table-column title="状态" prop="status"></let-table-column>
       </let-table>

       <let-button type="button" theme="sub-primary" @click="getAutoPort()">自动获取端口</let-button>
       <let-button type="sumbit" theme="primary">扩容</let-button>
    </let-form>
  </div>
</template>

<script>
import SetInputer from '@/components/set-inputer';

const ipReg = '((\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])';
const getInitialModel = () => ({
  application: '',
  server_name: '',
  set: '',
  node_name: '',
  expand_nodes: [],
  enable_set: false,
  set_name: '',
  set_area: '',
  set_group: '',
  enable_node_copy: false,
});

export default {
  name: 'OperationExpand',

  components: {
    SetInputer,
  },

  data() {
    return {
      model: getInitialModel(),
      applications: [],
      serverNames: [],
      sets: [],
      nodeNames: [],
      expandIpStr: '',
      previewItems: [],
      ipReg: `^${ipReg}$`,
      isCheckedAll: false,
    };
  },

  mounted() {
    this.getCascadeSelectServer({
      level: 1,
    }, '获取应用失败').then((data) => {
      this.applications = data;
    });
  },

  methods: {
    changeSelect(attr) {
      switch (attr) {
        case 'application':
          // 修改应用
          this.model.server_name = '';
          this.serverNames = [];
          if (this.model.application) {
            this.getCascadeSelectServer({
              level: 2,
              application: this.model.application,
            }, '获取服务失败').then((data) => {
              this.serverNames = data;
            });
          }
          break;
        case 'server_name':
          // 修改服务
          this.model.set = '';
          this.sets = [];
          if (this.model.server_name) {
            this.getCascadeSelectServer({
              level: 3,
              application: this.model.application,
              server_name: this.model.server_name,
            }, '获取set失败').then((data) => {
              this.sets = data;
            });
          }
          break;
        case 'set': // 修改set
          this.model.node_name = '';
          this.model.nodeName = [];
          if (this.model.set) {
            const modelSet = parseInt(this.model.set, 10) === -1 ? '' : this.model.set;
            this.getCascadeSelectServer({
              level: 4,
              application: this.model.application,
              server_name: this.model.server_name,
              set: modelSet,
            }, '获取节点失败').then((data) => {
              this.nodeNames = data;
            });
          }
          break;
        default:
          break;
      }
    },
    getCascadeSelectServer(params, prefix = '获取数据失败') {
      return this.$ajax.getJSON('/server/api/cascade_select_server', params).then(data => data).catch((err) => {
        this.$tip.error(`${prefix}: ${err.message || err.err_msg}`);
      });
    },
    previewExpand() {
      // 预扩容
      if (this.$refs.configForm.validate()) {
        const model = Object.assign({}, this.model);
        model.set = parseInt(model.set, 10) === -1 ? '' : model.set;
        model.expand_nodes = this.expandIpStr.trim().split(/[,;\n]/);

        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/expand_server_preview', model).then((data) => {
          loading.hide();
          const items = data || [];
          items.forEach((item) => {
            item.isChecked = false;
          });
          // hw-todo: let-ui bug
          this.isCheckedAll = false;
          this.previewItems = items;
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`预扩容失败: ${err.message || err.err_msg}`);
        });
      }
    },
    getAutoPort(){
      const loading = this.$Loading.show();
      var adapters = this.previewItems.filter(item => item.status === '未扩容' && item.isChecked);
      var bindIps = [];
      adapters.forEach((adapter)=>{
        bindIps.push(adapter.bind_ip);
      });
      this.$ajax.getJSON('/server/api/auto_port', {node_name: bindIps.join(';')}).then((data) => {
          loading.hide();
        for(var i = 0; i< data.length; i++){
          this.$set(adapters[i], 'port', String(data[i].port || ''))
        }
      }).catch(function(err){
          loading.hide();
          this.$tip.error(`自动获取端口失败: ${err.message || err.err_msg}`);
        });
    },
    expand() {
      // 扩容
      if (this.$refs.expandForm.validate()) {
        const previewItems = this.previewItems.filter(item => item.status === '未扩容' && item.isChecked);
        if (previewItems.length > 0) {
          const previewServers = [];
          previewItems.forEach((item) => {
            previewServers.push({
              bind_ip: item.bind_ip,
              node_name: item.node_name,
              obj_name: item.obj_name,
              port: item.port,
              set: item.set,
            });
          });
          const params = {
            application: this.model.application,
            server_name: this.model.server_name,
            set: parseInt(this.model.set, 10) === -1 ? '' : this.model.set,
            node_name: this.model.node_name,
            enable_node_copy: this.model.enable_node_copy,
            expand_preview_servers: previewServers,
          };

          const loading = this.$Loading.show();
          this.$ajax.postJSON('/server/api/expand_server', params).then(() => {
            // hw-todo: 是否需要更新状态待定
            /*
            this.previewItems.forEach((item) => {
              if (item.status === '未扩容' && item.isChecked) {
                item.status = '已存在';
              }
            }); */
            loading.hide();
            this.$tip.success('扩容成功');
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`扩容失败: ${err.message || err.err_msg}`);
          });
        } else {
          this.$tip.error('请先勾选要扩容的对象');
        }
      }
    },
  },
  watch: {
    isCheckedAll() {
      const isCheckedAll = this.isCheckedAll;
      this.previewItems.forEach((item) => {
        item.isChecked = isCheckedAll;
      });
    },
  },
};
</script>

<style>
.mt40 {
  margin-top: 40px;
}
</style>
