<template>
  <div class="page_operation_templates"  style="text-align: center;" >
    <let-form inline itemWidth="200px">
      <div style="float: right">
        <let-button size="small" theme="primary" @click="checkFramework">{{$t('nodes.btn.check')}}</let-button>
        &nbsp;&nbsp;&nbsp;
        <let-button size="small" theme="info" @click="openShowProblem">{{$t('nodes.btn.question')}}</let-button>
      </div>
    </let-form>

    <br />

    <let-table ref="checkLoading" :data="servers" stripe :row-class-name="tableRowClassName" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('checkTable.table.th.server_name')" prop="serverName"></let-table-column>
      <let-table-column :title="$t('checkTable.table.th.node_name')" prop="nodeName"></let-table-column>
      <let-table-column :title="$t('checkTable.table.th.obj_name')" prop="objName"></let-table-column>
      <let-table-column :title="$t('checkTable.table.th.status')" width="100px">
        <template slot-scope="scope">
          <span class="status">{{scope.row.status}}</span>
        </template>
      </let-table-column>
    </let-table>
    <let-modal :title="$t('checkTable.problemDialog.title')" v-model="showProblem"  width="600px">
      <div>
        <br>
        <p>{{$t('checkTable.problemDialog.info')}}</p>
        <br>
        <p>{{$t('checkTable.problemDialog.restartFramework')}}</p>
        <p>{{$t('checkTable.problemDialog.stopFramework')}}</p>
        <p>{{$t('checkTable.problemDialog.restartServer')}}</p>
      </div>
    </let-modal>
  </div>

</template>

<script>

export default {
  name: 'OperationCheck',

  data() {
    return {
      showProblem: false,
      servers: []
    };
  },

  mounted() {
  },

  methods: {
    openShowProblem() {
      this.showProblem = true;
    },
    tableRowClassName({row, rowIndex}) {
      if (row.check === 1) {
        return '';
      } else if (row.check === 2) {
        return "checking-row";
      } else if (row.check === 0) {
        return 'success-row';
      } else if (row.check === -1) {
        return 'warning-row';
      }
      return '';
    },
    checkFramework() {
      const loading = this.$refs.checkLoading.$loading.show();
      this.$ajax.getJSON('/server/api/get_framework_list').then((data) => {

        loading.hide();
        for(var i = 0; i < data.servers.length; i++)
        {
          data.servers[i].check  = 1;
          data.servers[i].status = "waiting";
        }

        this.servers = data.servers;

        var that = this;
        for(var i = 0; i < that.servers.length; i++)
        {
          (function(i) {
            setTimeout(function(){
              that.checkServer(i)
            }, i*100);
          })(i);
        }
      }).catch((err) => {
        loading.hide();

        this.$Notice({
          title: this.$t('checkTable.adminRegistryFailed'),
          message: this.$t('checkTable.restartAdminRegistry'),
          type: 'error',
          duration: 0
        })
      });
    },
    checkServer(index) {
      var server = this.servers[index];

      server.check  = 2;
      server.status = "checking"; 

      this.$ajax.postJSON('/server/api/check_framework_server', {server:server}).then((data) => {
        server.check  = 0;
        server.status = "succ";

      }).catch((err) => {
        server.check  = -1;
        server.status = this.$t('checkTable.failed');
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

.let-table tr.checking-row td {
  background: burlywood !important;
  color: #FFF;
}
.let-table tr.warning-row td {
  background: #F56C77 !important;
  color: #FFF;
}
.let-table tr.success-row td {
  background: #6ACCAB !important;
  color: #FFF;
}
.let-table tr.checking-row td .let-table__operation {
  color: #FFF;
}
.let-table tr.warning-row td .let-table__operation {
  color: #FFF;
}
.let-table tr.success-row td .let-table__operation {
  color: #FFF;
}
.checking-row .status, .success-row .status, .warning-row .status{
  &:before{
    content: ' ';
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 100%;
    margin-right: 5px;
  }
}
.success-row .status{
  color:green;
  &:before{
    background: green;
  }
}
.warning-row .status{
  color:red;
  &:before{
    background: red;
  }
}
.checking-row .status{
  color:orange;
  &:before{
    background: orange;
  }
}
</style>
