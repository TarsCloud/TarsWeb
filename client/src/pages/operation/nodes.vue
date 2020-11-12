<template>
  <div class="page_operation_templates">

    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('nodes.node_name')">
        <let-input size="small" v-model="query.node_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
      <div style="float: right">
        <let-button size="small" theme="primary" @click="manualAddItem">{{$t('nodes.btn.manualAddNode')}}</let-button>
        &nbsp;&nbsp;&nbsp;
        <let-button size="small" theme="primary" @click="autoAddItem">{{$t('nodes.btn.autoAddNode')}}</let-button>
        &nbsp;&nbsp;&nbsp;
        <let-button size="small" theme="primary" @click="autoUpdateItem">{{$t('nodes.btn.autoUpdateNode')}}</let-button>
      </div>
    </let-form>

    <let-modal :title="$t('nodes.btn.manualAddNode')" v-model="showManualAddItem" :footShow="false"  width="800px">
      <div>
        <br>
        <br>
        <let-tag>{{$t('nodes.manualAddNode.OS1.title')}}</let-tag>
        <p>1 {{$t('nodes.manualAddNode.OS1.step1')}}</p>
        <p>2 {{$t('nodes.manualAddNode.OS1.step2')}}</p>
        <p>3 {{$t('nodes.manualAddNode.OS1.step3')}}</p>
        <p>4 {{$t('nodes.manualAddNode.OS1.step4')}}</p>
        <p>5 {{$t('nodes.manualAddNode.OS1.step5')}}</p>
        <br>
        <let-tag>{{$t('nodes.manualAddNode.OS2.title')}}</let-tag>
        <p>1 {{$t('nodes.manualAddNode.OS2.step1')}}</p>
        <p>2 {{$t('nodes.manualAddNode.OS2.step2')}}</p>
        <p>3 {{$t('nodes.manualAddNode.OS2.step3')}}</p>
        <p>4 {{$t('nodes.manualAddNode.OS2.step4')}}</p>
        <p>5 {{$t('nodes.manualAddNode.OS2.step5')}}</p>
        <p>6 {{$t('nodes.manualAddNode.OS2.step6')}}</p>
        <br>
        <let-tag theme="success" checked>{{$t('nodes.manualAddNode.info1')}}</let-tag><br><br>
        <let-tag theme="success" checked>{{$t('nodes.manualAddNode.info2')}}</let-tag>
      </div>
    </let-modal>

    <let-table :data="nodeList" stripe :empty-msg="$t('common.nodata')" :row-class-name="tableRowClassName" ref="nodeListLoading">
      <let-table-column :title="$t('nodeList.table.th.node_name')" prop="node_name"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.present_state')">
        <template slot-scope="scope">
          <span :class="scope.row.present_state === 'active' ? 'active' : 'inactive'">{{scope.row.present_state}}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('common.time')" prop="last_reg_time"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.last_heartbeat')" prop="last_heartbeat"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.label')" prop="label" width="20%"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.tars_version')" prop="tars_version"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.load_avg5')" prop="load_avg5"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.check')">

        <template slot-scope="scope">
          <let-table-operation @click="editNode(scope.row.node_name)">{{$t('nodeList.table.edit')}}</let-table-operation>
          &nbsp;&nbsp;
          <let-table-operation @click="checkNode(scope.row.node_name)">{{$t('nodeList.table.check')}}</let-table-operation>
          &nbsp;&nbsp;
          <let-table-operation @click="deleteNode(scope.row.node_name)">{{$t('nodeList.table.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>
    <let-pagination
      :page="pageNum" @change="gotoPage" style="margin-bottom: 32px;"
      :total="total">
    </let-pagination>

    <let-modal
      v-model="connectModal.show"
      :title="this.$t('connectNodeList.title')"
      width="1200px"
      :footShow="false"
      :showClose="false"
    >
      <let-table :data="connectNodeList" stripe :empty-msg="$t('common.nodata')" ref="connectNodeListLoading" style="margin-top: 20px;"> 
        <let-table-column type="expand" width="40px">
          <template slot-scope="scope">
              <div class="install_step">
                <let-steps :current="scope.row.step || 0">
                  <let-step :title="$t('connectNodeList.step1')"></let-step>
                  <let-step :title="$t('connectNodeList.step2')"></let-step>
                  <let-step :title="$t('connectNodeList.step3')"></let-step>
                  <let-step :title="$t('connectNodeList.step4')"></let-step>
                  <let-step :title="$t('connectNodeList.step5')"></let-step>
                </let-steps>
                <p v-if="scope.row.installState == 'fail' && scope.row.step == 1" class="fail_txt">Error: please check file /usr/local/app/web/files/tarsnode.tgz</p>
                <p v-if="scope.row.installState == 'fail' && scope.row.step == 2" class="fail_txt">Error: please ensure the ssh service is enabled, and the ip/port/user/password config is right</p>
                <p v-if="scope.row.installState == 'fail' && scope.row.step == 3" class="fail_txt">Error: please install curl on the node</p>
                <p v-if="scope.row.installState == 'fail' && scope.row.step == 4" class="fail_txt">Error: please ensure the registry is available</p>
                <p v-if="scope.row.installState == 'fail' && scope.row.step == 5" class="fail_txt">Error: some unknown error, please check log</p>
                <pre class="stdout">{{scope.row.stdout}}</pre>
              </div>
          </template>
        </let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.node_name')" prop="ip"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.connect')" prop="connectInfo"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.exists')" prop="existsInfo"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.install')">
          <template slot-scope="scope">
            <span :class="{'success_txt':scope.row.installState=='success', 'fail_txt':scope.row.installState=='fail'}">{{scope.row.installInfo}}</span>
          </template>
        </let-table-column>
      </let-table>

      <let-button theme="primary" @click="connectNode" :disabled="executeConnect">{{btnConnectText}}</let-button>
      &nbsp;&nbsp;
      <let-button theme="primary" @click="installNode" :disabled="executeInstall">{{btnInstallText}}</let-button>
      &nbsp;&nbsp;
      <let-button theme="primary" @click="closeConnectModal" style="float:right">{{$t('connectNodeList.btnClose')}}</let-button>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="this.$t('nodes.add.title')"
      width="500px"
      @on-confirm="showConnectNode"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" itemWidth="450px">
        <let-form-item :label="$t('nodes.node_name')" required>

<!--新增-->
          <let-input
            v-if="detailModal.add"
            type="textarea"
            :rows="3"
            v-model="detailModal.model.node_name"
            :placeholder="$t('nodes.nodeNameTips')"
            required
            :required-tip="$t('nodes.nodeNameTips')"
          ></let-input>
<!--批量升级-->
          <let-select v-model="detailModal.model.update_node_name" v-else size="small" required multiple>
            <let-option v-for="d in nodeList" :key="d.node_name" :value="d.node_name">
              {{d.node_name + '(' + d.tars_version + ')'}}
            </let-option>
          </let-select>

        </let-form-item>
        <let-form-item :label="$t('nodes.user')" required>
            <let-input
              size="small"
              v-model="detailModal.model.user"
            ></let-input>
        </let-form-item>
        <let-form-item :label="$t('nodes.port')" required>
            <let-input
            size="small"
            v-model="detailModal.model.port"
            :placeholder="$t('nodes.portTips')"
            required
            :required-tip="$t('nodes.portTips')"
            pattern="^[^\s]+$"
            :pattern-tip="$t('nodes.portTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('nodes.password')">
          <let-input
            size="small"
            v-model="detailModal.model.password"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('nodes.runuser')" required>
            <let-input
              size="small"
              v-model="detailModal.model.runuser"
              required
              :required-tip="$t('nodes.runuserTips')"
              pattern="^[^\s]+$"
              :pattern-tip="$t('nodes.runuserTips')"
            ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>


    <let-modal
      v-model="labelModel.show"
      :title="this.$t('nodes.label.title')"
      width="500px"
      @on-confirm="onAddLabel"
    >
      <let-form ref="labelForm" itemWidth="450px">
        <let-table :data="labelModel.labelList" stripe :empty-msg="$t('common.nodata')" style="margin-top: 20px;"> 
          <let-table-column :title="$t('nodes.label.name')" prop="name"></let-table-column>
          <let-table-column :title="$t('nodes.label.value')" prop="value"></let-table-column>
          <let-table-column :title="$t('nodes.label.operator')">
            <template slot-scope="scope">
              <let-table-operation @click="deleteLabel(labelModel.node_name, scope.row.name)">{{$t('nodes.label.delete')}}</let-table-operation>
            </template>
          </let-table-column>
        </let-table>

        <let-form-item :label="$t('nodes.label.name')" required itemWidth="150">
            <let-input
              size="small"
              required
              width="150px"
              pattern="^[a-zA-Z0-9]([a-zA-Z0-9]+)?$"
              v-model="labelModel.model.name"
            ></let-input>
        </let-form-item>
        <let-form-item :label="$t('nodes.label.value')" required itemWidth="150">
            <let-input
            size="small"
            required
            width="150px"
            v-model="labelModel.model.value"
            pattern="^[a-zA-Z0-9]([a-zA-Z0-9]+)?$"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>

import moment from 'moment';

export default {
  name: 'OperationNodes',

  data() {
    return {
      query: {
        node_name: ''
      },
      nodeList: [],
      pageNum: 1,
      pageSize: 20,
      total:1,

      executeInstall: false,
      executeConnect: false,
      btnConnectText: '',
      btnInstallText: '',
      isCheckedAll: false,
      connectNodeList: [],
      connectModal: {
        show: false
      },
      showManualAddItem: false,
      detailModal: {
        show: false,
        add: true,
        model: {
          node_name: '',
          update_node_name: [],
          user: 'root',
          password:'',
          port: '22',
          runuser: 'tars'
        }
      },
      labelModel: {
        show: false,
        node_name:'',
        labelList: [],
        model: {
          name: '',
          value:''
        }
      }
    };
  },

  mounted() {
    this.getNodeList(1);
  },

  methods: {
    updateLabel(node_name, label) {
      for(var i = 0; i < this.nodeList.length; i++) {
        let item = this.nodeList[i];
        if(item.node_name == node_name) {
          item.label = label;
          return;
        }
      }
    },
    updateLabelList(data) {
      this.labelModel.labelList = [];
      if (data) {

        let labels = data;

        for(var key in labels){
          this.labelModel.labelList.push({name: key, value: labels[key]});
        }
      }
    },
    editNode(node_name) {
      this.$ajax.getJSON('/server/api/load_node_label', {
        node_name: node_name,
      }).then((data) => {

        this.labelModel.node_name = node_name;
        this.updateLabelList(data);
        this.updateLabel(this.labelModel.node_name, data);

        this.labelModel.show = true;

      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
    onAddLabel(){
      this.$ajax.postJSON('/server/api/add_node_label', {
        node_name: this.labelModel.node_name,
        name: this.labelModel.model.name,
        value: this.labelModel.model.value
      }).then((labels) => {
        this.updateLabelList(labels);
        this.updateLabel(this.labelModel.node_name, labels);

        this.labelModel.model.name = '';
        this.labelModel.model.value = '';

      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
    deleteLabel(node_name, name) {
      this.$ajax.postJSON('/server/api/delete_node_label', {
        node_name: node_name,
        name: name,
      }).then((data) => {


        this.updateLabelList(data);
        this.updateLabel(node_name, data);

        this.$tip.success(`${this.$t('common.success')}` );
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
    checkNode(node_name) {
      const loading = this.$refs.nodeListLoading.$loading.show();
      this.$ajax.getJSON('/server/api/check_tars_node', {
        node_name: node_name,
      }).then((data) => {
        loading.hide();
        if(data) {
          this.$tip.success(`${this.$t('nodeList.checkNode')}: ${data}` );
        } else {
          this.$tip.error(`${this.$t('nodeList.checkNode')}: ${data}` );
        }
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
    deleteNode(node_name) {

      this.$confirm(this.$t('nodeList.confirmDeleteNode'), this.$t('common.alert')).then(() => {
        const loading = this.$refs.nodeListLoading.$loading.show();
        this.$ajax.getJSON('/server/api/uninstall_tars_node', {
          node_name: node_name,
        }).then((data) => {
          loading.hide();
          if(data.rst) {
            this.$tip.success(`${this.$t('nodeList.deleteNode')}: ${data.msg}` );
          } else {
            this.$tip.error(`${this.$t('nodeList.deleteNode')}: ${data.msg}` );
          }
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
        });
      });
    },
    tableRowClassName({row, rowIndex}) {
        if (row.present_state === "active") {
          return 'red-row';
        }
        return '';
      },
    getNodeList(curr_page) {
      const loading = this.$refs.nodeListLoading.$loading.show();

      if(!curr_page) {
        curr_page = this.pageNum || 1; 
      }

      this.$ajax.getJSON('/server/api/list_tars_node', {
        node_name: this.query.node_name,
        page_size: this.pageSize,
        curr_page: curr_page,
      }).then((data) => {
        loading.hide();
        this.pageNum = curr_page;
        this.total = Math.ceil(data.count/this.pageSize);
        this.nodeList = data.rows;

        this.nodeList.forEach(x => {
          x.last_heartbeat = moment(x.last_heartbeat).format("YYYY-MM-DD HH:mm:ss");
          x.last_reg_time = moment(x.last_reg_time).format("YYYY-MM-DD HH:mm:ss")
        });
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });

    },
    gotoPage(num) {
      this.getNodeList(num);
    },
    search() {
      this.getNodeList(1);
    },
    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
    },
    closeConnectModal() {

      if(this.executeConnect || this.executeInstall) {
        alert(this.$t('connectNodeList.execute'));
        return;
      }

      this.btnConnectText = this.$t('connectNodeList.btnConnect');
      this.btnInstallText = this.$t('connectNodeList.btnInstall');

      this.connectModal.show = false;

    },
    manualAddItem() {
      this.showManualAddItem = true;
    },
    autoAddItem() {
      this.detailModal.show = true;
      this.detailModal.add = true;
    },
    autoUpdateItem() {
      this.detailModal.show = true;
      this.detailModal.add = false;
    },
    showConnectNode() {
      if (this.$refs.detailForm.validate()) {

          this.btnConnectText = this.$t('connectNodeList.btnConnect');
          this.btnInstallText = this.$t('connectNodeList.btnInstall');
          this.connectNodeList = [];

          const model = this.detailModal.model;

          let node_name = [];

          if(!this.detailModal.add) {
            node_name = model.update_node_name; 
          } else {
            node_name = model.node_name.split(/[,;\n]/) 
          }
          
          node_name.forEach(x=>{

            if(x.trim() === '') {
              return;
            }

            var connect = {ip: x,
              connect: false,
              connectInfo: '',
              exists: false,
              existsInfo: '',
              step:0,
              stdout:'',
              installState:'',
              installInfo: ''
            };

            this.connectNodeList.push(connect);

          });
        // }

        this.connectModal.show = true;
      }
    },
    connectNode($event) {
      if(this.executeInstall) {
        alert(this.$t('connectNodeList.executeInstall'));
        return;
      }

      if(this.connectNodeList.length == 0) {
        return;
      }

      this.btnConnectText = this.$t('connectNodeList.install.connect');
      this.executeConnect = true;

      let count = this.connectNodeList.length;
      this.connectNodeList.forEach(connect=>{

        var obj = Object.assign({}, this.detailModal.model);

        obj.node_name = connect.ip;
        connect.installState = '';
        connect.connectInfo = '';
        connect.existsInfo  = '';
        connect.installInfo = this.$t('connectNodeList.install.connect');

        //一个一个请求, 体验更好一些
        this.$ajax.postJSON('/server/api/connect_tars_node', obj).then((data) => {

            connect.connectInfo = data.connectInfo;
            connect.existsInfo  = data.existsInfo;
            connect.installInfo = data.installInfo;
            connect.connect     = data.connect;

            if((--count) == 0) {
              this.btnConnectText = this.$t('connectNodeList.btnConnect');
              this.executeConnect = false;
            }

          }).catch((err) => {

            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            connect.installInfo = this.$t('common.error');
            if((--count) == 0) {
              this.btnConnectText = this.$t('connectNodeList.btnConnect');
              this.executeConnect = false;
            }
          })
      });
    },

    installNode($event) {

        if(this.executeConnect) {
          alert(this.$t('connectNodeList.executeConnect'));
          return;
        }

        var nodes = [];
        this.connectNodeList.forEach(x=>{
          nodes.push(x.ip);
          x.installState = '';
        });
        
        const model = this.detailModal.model;

        var obj = Object.assign({}, model);
        obj.node_name = nodes.join(';');

        this.btnInstallText = this.$t('connectNodeList.btnInstalling');

        this.executeInstall = false;
        this.$ajax.postJSON('/server/api/install_tars_nodes', obj).then((data) => {

          data.forEach(n => {
            
          let node = this.connectNodeList.filter(x=>x.ip == n.ip);
          
          if(node.length > 0) {
            node[0].installInfo = n.msg;
            node[0].installState = n.installState;
            node[0].step = n.step;
            node[0].stdout = n.stdout;
          }

          if(!n.rst) {
            this.$tip.error(n.ip + ":" + n.msg);
          }

          })
          this.getNodeList(1);

          this.btnInstallText = this.$t('connectNodeList.btnInstalled');
          this.executeInstall = false;

        }).catch((err) => {
          this.btnInstallText = this.$t('connectNodeList.btnInstalled');
          this.executeInstall = false;

          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);

        });
    }
  },
};
</script>

<style scoped lang="postcss">
.page_operation_templates {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }
}
.install_step{
  margin:10px;
}
.success_txt{
  color:#6accab;
}
.fail_txt{
  color:#f56c77;
}
.let-table tr.red-row td {
  background: #F56C77 !important;
  color: #FFF;
}
.active, .inactive{
  &:before{
    content: ' ';
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 100%;
    margin-right: 5px;
  }
}
.active{
  color:green;
  &:before{
    background: green;
  }
}
.inactive{
  color:red;
  &:before{
    background: red;
  }
}
.stdout{
  width: 650px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
