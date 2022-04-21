<template>
  <div class="page_operation_undeploy">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('deployService.form.app')">
        <let-input size="small" v-model="query.ServerApp"></let-input>
      </let-form-item>
      <let-form-item :label="$t('deployService.form.serviceName')">
        <let-input size="small" v-model="query.ServerName"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{
          $t("operate.search")
        }}</let-button>
        <span>
          <i
            class="el-icon-refresh-right"
            style="margin:10px"
            @click="fetchData()"
          ></i>
        </span>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="serverList" :empty-msg="$t('common.nodata')">
      <let-table-column width="60px">
        <template slot="head" slot-scope="props">
          <let-checkbox v-model="isCheckedAll"></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox
            v-model="scope.row.isChecked"
            @change="checkChange(scope.row)"
          ></let-checkbox>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('deployService.form.app')"
        prop="ServerApp"
      ></let-table-column>
      <let-table-column
        :title="$t('deployService.form.serviceName')"
        prop="ServerName"
      ></let-table-column>
      <let-table-column :title="$t('deployService.form.source')">
        <template slot-scope="scope"
          ><el-tag
            style="cursor:pointer"
            v-if="scope.row.Source['tars.io/CloudInstall']"
            @click="goMarket(scope.row)"
          >
            {{
              scope.row.Source["tars.io/CloudInstall"].group +
                "/" +
                scope.row.Source["tars.io/CloudInstall"].name +
                ":" +
                scope.row.Source["tars.io/CloudInstall"].version
            }}
          </el-tag>
        </template>
      </let-table-column>
    </let-table>

    <div style="overflow:hidden;">
      <div class="btn_group">
        <let-button theme="primary" size="small" @click="undeployServer">{{
          $t("operate.undeploy")
        }}</let-button>
      </div>
      <let-pagination
        align="right"
        style="float:right;"
        :page="pagination.page"
        @change="gotoPage"
        :total="pagination.total"
      >
      </let-pagination>
      <!-- <div style="float:left;">
        <let-button theme="primary" size="small" @click="configServer">{{$t('operate.update')}}</let-button>
        <let-button theme="primary" size="small" @click="manageServant">{{$t('operate.servant')}}</let-button>
        <let-button theme="primary" size="small" @click="manageK8S">{{$t('operate.k8s')}}</let-button>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: "OperationUndeploy",

  data() {
    return {
      query: {
        ServerApp: "",
        ServerName: "",
      },
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 1,
      },
      viewModal: {
        show: false,
        model: null,
      },
      serverList: [],
      isCheckedAll: false,
      checkedList: [],
    };
  },

  watch: {
    isCheckedAll() {
      let { isCheckedAll } = this;
      this.serverList.forEach((item) => {
        item.isChecked = isCheckedAll;
      });

      if (isCheckedAll) {
        this.checkedList = [].concat(this.serverList);
      } else {
        this.checkedList = [];
      }
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    // 切换服务实时状态页码
    gotoPage(num) {
      this.pagination.page = num;
      this.fetchData();
    },
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax
        .getJSON("/k8s/api/server_list", {
          ServerApp: this.query.ServerApp,
          ServerName: this.query.ServerName,
          page: this.pagination.page,
          size: this.pagination.size,
        })
        .then((data) => {
          loading.hide();
          this.serverList = [];
          if (data.hasOwnProperty("Data")) {
            data.Data.forEach((item) => {
              item.isChecked = false;
              item.Source = item.Source || "{}";
              // console.log(item.Source);
              item.Source = JSON.parse(item.Source);
            });
            this.serverList = data.Data;
          }
          this.pagination.total = Math.ceil(
            data.Count.AllCount / this.pagination.size
          );
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },

    search() {
      this.fetchData();
    },

    closeViewModal() {
      this.viewModal.show = false;
      this.viewModal.model = null;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    checkChange(data) {
      const checkedList = this.checkedList;

      let isChecked = data.isChecked;
      if (isChecked) {
        let isTrue = false;
        checkedList.forEach((item) => {
          if (item.ServerId === data.ServerId) {
            isTrue = true;
          }
        });
        if (!isTrue) {
          checkedList.push(data);
        }
      } else {
        let isTrue = false;
        let index = -1;
        checkedList.forEach((iitem, iindex) => {
          if (iitem.ServerId === data.ServerId) {
            isTrue = true;
            index = iindex;
          }
        });
        if (isTrue) {
          checkedList.splice(index, 1);
        }
      }
    },

    undeployServer() {
      // let { checkedList } = this

      const checkedServerList = this.checkedList.filter(
        (item) => item.isChecked
      );
      if (checkedServerList.length <= 0) {
        this.$tip.warning(this.$t("dialog.tips.item"));
        return;
      }

      let ServerId = checkedServerList.map((item) => item.ServerId);

      this.$confirm(
        this.$t("serverList.dlg.msg.undeploy"),
        this.$t("common.alert")
      ).then(() => {
        const loading = this.$Loading.show();
        this.$ajax
          .postJSON("/k8s/api/server_undeploy", {
            ServerId,
          })
          .then((res) => {
            loading.hide();
            this.fetchData();
            this.$tip.success(this.$t("common.success"));
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.err_msg || err.message}`
            );
          });
      });
    },
    goMarket(row) {
      let href;
      if (row.Source["tars.io/CloudProduct"]) {
        href = `/static/market/index.html#/market/product/${row.Source["tars.io/CloudInstall"].group}/${row.Source["tars.io/CloudInstall"].name}/${row.Source["tars.io/CloudInstall"].version}`;
      } else {
        href = `/static/market/index.html#/market/service/${row.Source["tars.io/CloudInstall"].group}/${row.Source["tars.io/CloudInstall"].name}/${row.Source["tars.io/CloudInstall"].version}`;
      }

      window.open(href);
    },
  },
};
</script>

<style>
.page_operation_undeploy {
  pre {
    color: #909fa3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .success {
    color: #49cc8f;
  }
  .warn {
    color: #e0543f;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom: 20px;
  }
}
</style>
