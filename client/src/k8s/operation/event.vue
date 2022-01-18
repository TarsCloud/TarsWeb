<!--
* @date: 2021-11-07 09:51
* @description：event 事件管理
-->
<template>
  <div>
    <let-form inline itemWidth="180px" @submit.native.prevent="search">
      <let-form-item :label="$t('callChain.date')" style="width: 400px;">
        <el-date-picker
          size="small"
          v-model="eventDate"
          type="datetimerange"
          range-separator="~"
          :start-placeholder="$t('board.alarm.form.startDate')"
          :end-placeholder="$t('board.alarm.form.endDate')"
          value-format="timestamp"
        >
        </el-date-picker>
      </let-form-item>
      <let-form-item :label="$t('filter.title.app')">
        <el-select
          v-model="query.application"
          :placeholder="$t('pub.dlg.defaultValue')"
          size="small"
          style="width: 100%"
          @change="getServerList(query.application)"
          :disabled="!serverEnable"
          clearable
        >
          <el-option
            v-for="item in appList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </let-form-item>
      <let-form-item :label="$t('filter.title.serverName')">
        <el-select
          v-model="query.serverName"
          :placeholder="$t('pub.dlg.defaultValue')"
          style="width: 100%"
          clearable
          :disabled="!serverEnable"
          size="small"
          @change="getPods"
        >
          <el-option
            v-for="item in serverNames"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </let-form-item>
      <let-form-item :label="$t('serverList.table.th.podName')">
        <el-select
          v-model="query.pod"
          :placeholder="$t('pub.dlg.defaultValue')"
          @change="search"
          style="width: 100%"
          clearable
          :disabled="!serverEnable"
          size="small"
        >
          <el-option
            v-for="item in pods"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </let-form-item>
      <let-form-item :label="$t('event.eventLevel')">
        <el-select
          v-model="query.level"
          :placeholder="$t('pub.dlg.defaultValue')"
          style="width: 100%"
          clearable
          size="small"
          @change="search"
        >
          <el-option
            v-for="item in levels"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </let-form-item>
      <let-form-item style="width: 240px">
        <el-radio-group
          v-model="query.check"
          size="small"
          @change="checkedChange"
        >
          <el-radio-button label="Server">{{
            $t("event.type.server")
          }}</el-radio-button>
          <el-radio-button label="Cluster">{{
            $t("event.type.cluster")
          }}</el-radio-button>
          <el-radio-button label="Downtime">{{
            $t("event.type.downtime")
          }}</el-radio-button>
        </el-radio-group>
      </let-form-item>

      <let-form-item>
        <let-button size="small" @click="search" theme="primary">{{
          $t("operate.search")
        }}</let-button>
      </let-form-item>
    </let-form>

    <el-table
      ref="table"
      :data="events"
      border
      stripe
      highlight-current-row
      v-loading="loading"
    >
      <el-table-column label="kind" width="200" show-overflow-tooltip>
        <template slot-scope="scope">{{
          scope.row.involvedObject.kind || ""
        }}</template>
      </el-table-column>
      <el-table-column label="namespace" width="100">
        <template slot-scope="scope">{{
          scope.row.involvedObject.namespace || ""
        }}</template>
      </el-table-column>
      <el-table-column label="name" width="200" show-overflow-tooltip>
        <template slot-scope="scope">{{
          scope.row.involvedObject.name || ""
        }}</template>
      </el-table-column>
      <el-table-column label="type" prop="type" width="150"></el-table-column>
      <el-table-column
        label="reason"
        prop="reason"
        width="200"
      ></el-table-column>
      <el-table-column
        label="message"
        prop="message"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="firstTime" width="180" show-overflow-tooltip>
        <template slot-scope="scope">{{
          scope.row.firstTimestamp | timeFormat
        }}</template>
      </el-table-column>
      <el-table-column label="lastTime" width="180">
        <template slot-scope="scope">{{
          scope.row.lastTimestamp | timeFormat
        }}</template>
      </el-table-column>
    </el-table>

    <br />
    <let-pagination
      align="right"
      style="float:right;"
      :page="pagination.page"
      @change="handleCurrentChange"
      :total="pagination.total"
    >
    </let-pagination>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "event",
  data() {
    return {
      query: {
        application: "",
        serverName: "",
        check: "Server",
      },
      eventDate: [
        new Date(new Date().getTime() - 2 * 60 * 60 * 1000).getTime(),
        new Date().getTime(),
      ],

      appList: [],
      serverNames: [],
      pods: [],
      levels: ["Normal", "Warning"],

      loading: false,
      pagination: { page: 1, size: 20, total: 1 },
      events: [],
    };
  },
  filters: {
    timeFormat(val) {
      return moment(val).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  watch: {
    //监听路由变化
    $route(to, from) {
      this.$set(this.query, "application", this.$route.query.application || "");
      this.$set(this.query, "serverName", this.$route.query.serverName || "");
      this.search();
    },
  },
  mounted() {
    this.$set(this.query, "application", this.$route.query.application || "");
    this.$set(this.query, "serverName", this.$route.query.serverName || "");
    this.getAppList();
    this.search();
  },
  computed: {
    serverEnable() {
      return this.query.check == "Server";
    },
  },
  methods: {
    checkedChange() {
      this.pagination.page = 1;
      this.loadData(1);
    },
    handleCurrentChange(val) {
      this.loadData(val);
    },
    search() {
      this.loadData(1);
    },
    loadData(curr_page) {
      if (!curr_page) {
        curr_page = 1;
      }
      let startDate = "",
        endDate = "";
      if (this.eventDate) {
        startDate = this.eventDate[0];
        endDate = this.eventDate[1];
      }
      let query = Object.assign(
        {},
        this.query,
        { currPage: curr_page, pageSize: this.pagination.size },
        { startDate, endDate }
      );
      this.loading = true;
      this.$ajax
        .getJSON("/k8s/api/get_events", query)
        .then((data) => {
          this.events = data.rows;
          this.pagination.total = data.total;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    //获取应用列表
    getAppList() {
      this.$ajax
        .getJSON("/k8s/api/application_select", {})
        .then((data) => {
          this.appList = data.Data.map((item) => {
            return item.ServerApp;
          });
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    async getServerList(app) {
      this.$set(this.query, "serverName", "");
      let servers = await this.$ajax.getJSON("/k8s/api/server_list", {
        ServerApp: app,
        isAll: true,
      });
      this.serverNames = servers.Data.map((item) => {
        return item.ServerName;
      });
      this.search();
    },
    getPods() {
      this.$set(this.query, "pod", "");
      let startDate = "",
        endDate = "";
      if (this.eventDate) {
        startDate = this.eventDate[0];
        endDate = this.eventDate[1];
      }
      let query = Object.assign({}, this.query, { startDate, endDate });
      this.$ajax
        .getJSON("/k8s/api/get_pods", query)
        .then((data) => {
          this.pods = data;
          this.search();
        })
        .catch((err) => {
          this.$set(this, "pods", "");
        });
      this.search();
    },
  },
};
</script>

<style scoped></style>
