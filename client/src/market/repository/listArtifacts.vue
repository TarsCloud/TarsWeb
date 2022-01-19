<template>
  <el-dialog title="Artifacts" :visible.sync="addDialogVisible" width="80%">
    <el-table :data="artifacts" border stripe style="width: 100%">
      <el-table-column prop="digest_short" label="digest" min-width="200">
        <template slot-scope="props">
          <el-link type="primary">{{ props.row.digest_short }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="tag" min-width="200">
        <template slot-scope="props">
          <el-tag
            v-for="tag in props.row.tags"
            :key="tag"
            style="margin-right:5px"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="push_time" label="推送时间" min-width="100">
      </el-table-column>
      <el-table-column prop="pull_time" label="拉取时间" min-width="100">
      </el-table-column>
      <el-table-column label="操作" min-width="80">
        <template slot-scope="scope">
          <el-button
            type="danger"
            style="text-align: center"
            @click="deleteArtifact(scope.row)"
            size="small"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <br />
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size.sync="page_size"
      :current-page.sync="page"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    >
    </el-pagination>
  </el-dialog>
</template>

<script>
import moment from "moment";
export default {
  name: "ListArtifacts",
  components: {},
  data() {
    return {
      project: "",
      name: "",
      artifacts: [],
      total: 0,
      page_size: 5,
      page: 1,
      addDialogVisible: false,
    };
  },
  methods: {
    show(project, repo) {
      this.project = project;
      this.repo = repo;
      this.fetchArtifactsList();
      this.addDialogVisible = true;
    },
    changePage(page) {
      this.page = page;
      this.fetchArtifactsList();
    },
    fetchArtifactsList() {
      this.$loading.show();
      this.$market
        .call("cloud-harbor", "getArtifactsList", {
          project: this.project,
          repo: this.repo.substr(this.project.length + 1),
          page_size: this.page_size,
          page: this.page,
        })
        .then((data) => {
          data.info.gList.forEach((e) => {
            e.digest_short = e.digest.substr(0, 17);
            e.pull_time = moment(e.pull_time).format("YYYY-MM-DD HH:mm:ss");
            e.push_time = moment(e.push_time).format("YYYY-MM-DD HH:mm:ss");
          });
          this.total = data.info.total;
          this.artifacts = data.info.gList;

          this.$loading.hide();
        })
        .catch((err) => {
          this.$message({
            message: this.$t("market.repoRet." + err.tars_ret || "-1"),
            type: "error",
          });
          this.$loading.hide();
        });
    },
    deleteArtifact(row) {
      // console.log(row);

      this.$confirm("确定取消该Artifact么?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$loading.show();

          this.$market
            .call("cloud-harbor", "delArtifacts", {
              project: this.project,
              repo: this.repo.substr(this.project.length + 1),
              reference: row.digest,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.deleteArtifactSucc"),
                type: "success",
              });
              this.$loading.hide();

              this.fetchArtifactsList();
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.repoRet." + err.tars_ret || "-1"),
                type: "error",
              });
              this.$loading.hide();
            });
        })
        .catch(() => {});
    },
  },
  created() {},
  mounted() {},
};
</script>
