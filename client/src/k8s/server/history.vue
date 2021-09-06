<template>
  <div class="page_server_manage">

    <!-- 服务列表 -->
    <div class="table_head" style="height:50px">
      <h4>{{this.$t('serverList.title.serverList')}} <i class="icon iconfont el-icon-third-shuaxin" style="font-family: iconfont  !important; cursor: pointer" @click="getServerList()"></i></h4>
    </div>

    <let-table v-if="serverList" :data="serverList" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('deployService.form.app')" prop="ServerApp"></let-table-column>
      <let-table-column :title="$t('deployService.form.serviceName')" prop="ServerName"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.podName')" prop="PodName">
        <template slot-scope="scope">
          <let-table-operation @click="gotoLog(scope.row)">{{ scope.row.PodName }}</let-table-operation>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.podIP')" prop="PodIp"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.ip')" prop="NodeIp"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.version')" prop="ServiceVersion"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.createTime')" prop="CreateTime"></let-table-column>
      <let-table-column :title="$t('serverList.table.th.deleteTime')" prop="DeleteTime"></let-table-column>
    </let-table>

  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ServerManage',
  data() {
    return {
      serverList: [],
    };
  },
  props: ['treeid'],
  methods: {
    gotoLog(data) {
       let url = `/logview.html?History=true&NodeIP=${data.NodeIp}&ServerApp=${data.ServerApp}&ServerName=${data.ServerName}&PodName=${data.PodName}`;
       window.open(url)

      // this.$ajax.getJSON("/k8s/api/shell_domain").then(domain => {
      //   let url = `${domain.fromPage}?History=true&NodeIP=${data.NodeIp}&ServerApp=${data.ServerApp}&ServerName=${data.ServerName}&PodName=${data.PodName}`
      //   window.open(url)
      // })
    },
    getServerId() {
      return this.treeid
    },
    // 获取服务列表
    getServerList(c) {
      this.$ajax.getJSON('/k8s/api/pod_history_list', {
        ServerId: this.getServerId(),
      }).then((data) => {

          data.Data.forEach(item => {
            item.CreateTime = moment(item.CreateTime).format("YYYY-MM-DD HH:mm:ss");
            item.DeleteTime = moment(item.DeleteTime).format("YYYY-MM-DD HH:mm:ss");
          })

        this.serverList = data.Data
      }).catch((err) => {
        this.$confirm(err.err_msg || err.message || this.$t('serverList.msg.fail'), this.$t('common.alert')).then(() => {
          this.getServerList();
        });
      });
    },
    more() {
      this.getServerList(this.continue);

    },
  },
  created() {
  },
  mounted() {
    this.getServerList();
  },
};
</script>

<style>
@import '../../assets/css/variable.css';

.page_server_manage {
  .tbm16 {
    margin: 16px 0;
  }
  .danger {
    color: var(--off-color);
  }

  .more-cmd {
    .let-form-item__content {
      display: flex;
      align-items: center;
    }
    span.let-radio {
      margin-right: 5px;
    }
    label.let-radio {
      width: 200px;
    }
  }
}

</style>
