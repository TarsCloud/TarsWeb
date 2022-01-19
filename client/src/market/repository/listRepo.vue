<template>
  <el-dialog title="仓库列表" :visible.sync="addDialogVisible" width="80%">
    <el-table :data="repos" border stripe style="width: 100%">
      <el-table-column label="镜像仓库名称" min-width="200">
        <template slot-scope="scope">
          <el-link type="primary" @click="showListArtifacts(scope.row.name)">{{
            scope.row.name
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="artifact_count" label="Artifacts">
      </el-table-column>
      <el-table-column prop="pull_count" label="下载数" min-width="50">
      </el-table-column>
      <el-table-column prop="update_time" label="变更时间" min-width="200">
      </el-table-column>
      <el-table-column label="操作" min-width="100">
        <template slot-scope="scope">
          <el-button
            type="danger"
            style="text-align: center"
            @click="deleteRepo(scope.row)"
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
  name: "ListRepo",
  components: {},
  data() {
    return {
      project: "",
      repos: [],
      total: 0,
      page_size: 15,
      page: 1,
      addDialogVisible: false,
    };
  },
  methods: {
    show(project) {
      this.project = project;
      this.fetchRepoList();
      this.addDialogVisible = true;
    },
    showListArtifacts(repo) {
      this.$emit("showListArtifacts", this.project, repo);
    },
    changePage(page) {
      this.page = page;
      this.fetchRepoList();
    },
    fetchRepoList() {
      this.$loading.show();
      this.$market
        .call("cloud-harbor", "getRepositoryList", {
          project: this.project,
          page_size: this.page_size,
          page: this.page,
        })
        .then((data) => {
          data.info.gList.forEach((e) => {
            e.update_time = moment(e.update_time).format("YYYY-MM-DD HH:mm:ss");
            e.create_time = moment(e.create_time).format("YYYY-MM-DD HH:mm:ss");
          });
          this.total = data.info.total;
          this.repos = data.info.gList;
          this.$loading.hide();
        })
        .catch((err) => {
          this.$loading.hide();
          this.$message({
            message: this.$t("market.repoRet." + err.tars_ret || "-1"),
            type: "error",
          });
        });
    },
    deleteRepo(row) {
      this.$confirm("确定删除该镜像仓库么?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          console.log(row);

          this.$market
            .call("cloud-harbor", "delRepository", {
              project: this.project,
              repo: row.name.substr(this.project.length + 1),
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.deleteRepoSucc"),
                type: "success",
              });
              this.fetchRepoList();
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.repoRet." + err.tars_ret || "-1"),
                type: "error",
              });
            });
        })
        .catch(() => {});
    },
  },
  created() {},
  mounted() {},
};
</script>
