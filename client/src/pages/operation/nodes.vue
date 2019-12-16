<template>
  <div class="page_operation_templates">
    <let-button size="small" theme="primary" style="float: right" @click="addItem">{{$t('nodes.btn.addNode')}}</let-button>
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('nodes.node_name')">
        <let-input size="small" v-model="query.node_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
    </let-form>

    <let-table :data="nodeList" stripe :empty-msg="$t('common.nodata')" ref="nodeListLoading">
      <let-table-column :title="$t('nodeList.table.th.node_name')" prop="node_name"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.present_state')" prop="present_state"></let-table-column>
      <let-table-column :title="$t('common.time')" prop="last_reg_time"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.last_heartbeat')" prop="last_heartbeat"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.tars_version')" prop="tars_version"></let-table-column>
      <let-table-column :title="$t('nodeList.table.th.load_avg5')" prop="load_avg5"></let-table-column>
    </let-table>
    <let-pagination
      :page="pageNum" @change="gotoPage" style="margin-bottom: 32px;"
      :total="total">
    </let-pagination>

    <let-modal
      v-model="connectModal.show"
      :title="this.$t('connectNodeList.title')"
      width="650px"
      :footShow="false"
      :showClose="false"
    >
      <let-table :data="connectNodeList" stripe :empty-msg="$t('common.nodata')" ref="connectNodeListLoading" style="margin-top: 20px;"> 
        <let-table-column :title="$t('connectNodeList.table.th.node_name')" prop="ip"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.connect')" prop="connectInfo"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.exists')" prop="existsInfo"></let-table-column>
        <let-table-column :title="$t('connectNodeList.table.th.install')" prop="installInfo"></let-table-column>
      </let-table>

      <let-button theme="primary" @click="connectNode">{{btnConnectText}}</let-button>
      <let-button theme="primary" @click="installNode">{{btnInstallText}}</let-button>
      <let-button theme="primary" @click="closeConnectModal" style="float:right">{{$t('connectNodeList.btnClose')}}</let-button>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      :title="this.$t('nodes.add.title')"
      width="500px"
      @on-confirm="showConnectNode"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="450px">
        <let-form-item :label="$t('nodes.node_name')" required>
          <let-input
            type="textarea"
            :rows="3"
            v-model="detailModal.model.node_name"
            :placeholder="$t('nodes.nodeNameTips')"
            required
            :required-tip="$t('nodes.nodeNameTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('nodes.user')" required>
            <let-input
              size="small"
              v-model="detailModal.model.user"
              disabled
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
      // canInstall: false,

      detailModal: {
        show: false,
        model: {
          user: 'root',
          password:'',
          port: '22',
          runuser: 'tars'
        }
      },
    };
  },

  mounted() {
    this.getNodeList(1);
  },

  methods: {
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
        })
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
    addItem() {
      this.detailModal.show = true;
    },
    showConnectNode() {
      if (this.$refs.detailForm.validate()) {

        // if(this.connectNodeList.length == 0) {
          this.btnConnectText = this.$t('connectNodeList.btnConnect');
          this.btnInstallText = this.$t('connectNodeList.btnInstall');
          this.connectNodeList = [];

          const model = this.detailModal.model;
          
          model.node_name.split(/[,;\n]/).forEach(x=>{

            if(x.trim() === '') {
              return;
            }

            var connect = {ip: x,
              connect: false,
              connectInfo: '',
              exists: false,
              existsInfo: '',
              installInfo: '',
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
      //let-ui有bug, 只能改dom了!!!
      $event.target.disabled = true;

      let count = this.connectNodeList.length;
      this.executeConnect = true;
      this.connectNodeList.forEach(connect=>{

        var obj = Object.assign({}, this.detailModal.model);

        obj.node_name = connect.ip;

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
              $event.target.disabled = false;
              this.executeConnect = false;
            }

          }).catch((err) => {

            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            connect.installInfo = this.$t('common.error');
            if((--count) == 0) {
              this.btnConnectText = this.$t('connectNodeList.btnConnect');
              $event.target.disabled = false;
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
      this.connectNodeList.forEach(x=>nodes.push(x.ip));

        const model = this.detailModal.model;

        var obj = Object.assign({}, model);
        obj.node_name = nodes.join(';');

        // console.log('installNode', obj);

        this.btnInstallText = this.$t('connectNodeList.btnInstalling');

        this.executeInstall = false;
        this.$ajax.postJSON('/server/api/install_tars_nodes', obj).then((data) => {

          // console.log(data);

          data.forEach(n => {
            
            let node = this.connectNodeList.filter(x=>x.ip == n.ip);
            
            if(node.length > 0) {
              node[0].installInfo = n.msg;
            }

            if(!n.rst) {
              this.$tip.error(n.ip + ":" + n.msg);
            }

          })
          this.getNodeList(1);

          this.btnInstallText = this.$t('connectNodeList.btnInstalled');
          $event.target.disabled = false;
          this.executeInstall = false;

        }).catch((err) => {
          this.btnInstallText = this.$t('connectNodeList.btnInstalled');
          $event.target.disabled = false;
          this.executeInstall = false;
        });
    }
  },
};
</script>

<style>
.page_operation_templates {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

}
</style>
