<template>
  <div class="page_operation_templates">
    <!-- <let-button size="small" theme="primary" style="float: right" @click="addItem">{{$t('nodes.btn.addNode')}}</let-button> -->
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
      v-model="detailModal.show"
      :title="this.$t('nodes.add.title')"
      width="450px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="400px">
        <let-form-item :label="$t('nodes.node_name')" required>
          <let-input
            type="textarea"
            :rows="3"
            v-model="detailModal.model.node_name"
            :placeholder="$t('nodes.nodeNameTips')"
            required
            :required-tip="$t('nodes.nodeNameTips')"
            pattern="^[^\s]+$"
            :pattern-tip="$t('nodes.nodeNameTips')"
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
        <let-form-item :label="$t('nodes.password')" required>
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

    addItem() {
      this.detailModal.show = true;
    },
    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;

        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/install_tars_node', model).then((data) => {
          loading.hide();

          data.forEach(n => {
            if(n.rst) {
              this.$tip.success(n.ip + ":" + n.msg);
            } else {
              this.$tip.error(n.ip + ":" + n.msg);
            }

          })
          this.closeDetailModal();
          this.getNodeList(1);
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },
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
