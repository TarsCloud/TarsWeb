<template>
  <el-table :data="logs" stripe style="width: 100%" :show-header="false">
    <el-table-column :label="$t('market.table.version')">
      <template slot-scope="props">
        <el-row :gutter="24">
          <el-col :span="24">
            <span>
              <span :style="getLogStyle(props.row.logLevel)">{{
                props.row.text
              }}</span>
            </span>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "Logs",
  data() {
    return { logs: [] };
  },
  props: ["serviceVersion"],
  methods: {
    getLogStyle(logLevel) {
      if (logLevel == 1) {
        return "color:green";
      } else if (logLevel == 2) {
        return "color:red";
      } else {
        return "";
      }
    },
    fetchLogs() {
      this.$cloud
        .call("cloud-market", "getServiceLogs", {
          req: {
            group: this.serviceVersion.group,
            name: this.serviceVersion.name,
            version: this.serviceVersion.version,
          },
        })
        .then((data) => {
          this.logs = data.logs;
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },
  created() {},
  mounted() {
    this.fetchLogs();
  },
};
</script>

<style>
ol,
ul,
li {
  list-style: disc outside none;
}
</style>
