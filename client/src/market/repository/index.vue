<template>
  <div>
    <el-button
      style=" margin-top:20px"
      type="primary"
      @click="showAddProject()"
      size="small"
      >添加项目</el-button
    >
    <br />
    <el-table :data="data" stripe border style="width: 100%; margin-top:20px">
      <el-table-column prop="project" label="项目名称" min-width="150">
        <template slot-scope="scope">
          <el-link type="primary" @click="showListRepo(scope.row.name)">{{
            scope.row.name
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="repo_count" label="镜像仓库数" min-width="100">
      </el-table-column>
      <el-table-column label="开发者" min-width="800px">
        <template slot-scope="props">
          <el-tag
            v-for="tag in props.row.uids"
            :key="tag"
            :closable="closable[tag]"
            style="margin-right:5px"
            @close="deleteMember(props.row, tag)"
          >
            {{ tag }}
          </el-tag>
          <el-tag style="cursor:pointer" @click="showAddMember(props.row.name)"
            >+</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="update_time" label="更新时间" min-width="200">
      </el-table-column>
      <el-table-column label="操作" min-width="150">
        <template slot-scope="scope">
          <el-button
            type="danger"
            style="text-align: center"
            @click="deleteProject(scope.row)"
            size="small"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <br />
    <div>
      <el-pagination
        style="display: inline"
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
    </div>

    <addProject ref="addProject" @addProjectSucc="addProjectSucc"></addProject>
    <addMember ref="addMember" @addMemberSucc="addMemberSucc"></addMember>
    <listRepo ref="listRepo" @showListArtifacts="showListArtifacts"></listRepo>
    <listArtifacts ref="listArtifacts"></listArtifacts>
  </div>
</template>

<script>
import moment from "moment";
import addProject from "./addProject";
import addMember from "./addMember";
import listRepo from "./listRepo";
import listArtifacts from "./listArtifacts";

export default {
  name: "ListProject",
  components: {
    addProject,
    addMember,
    listRepo,
    listArtifacts,
  },
  data() {
    return {
      data: [],
      total: 0,
      page_size: 15,
      page: 1,
      closable: {},
    };
  },
  methods: {
    showAddProject() {
      this.$refs.addProject.show();
    },
    showAddMember(project) {
      this.$refs.addMember.show(project);
    },
    showListRepo(project) {
      this.$refs.listRepo.show(project);
    },
    showListArtifacts(project, repo) {
      this.$refs.listArtifacts.show(project, repo);
    },
    addMemberSucc() {
      this.fetchProjects();
    },
    addProjectSucc() {
      this.fetchProjects();
    },
    deleteMember(row, uid) {
      this.$confirm("确定取消该用户的权限么?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$market
            .call("cloud-harbor", "delProjectDeveloper", {
              project: row.name,
              uid: uid,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.deleteMemberSucc"),
                type: "success",
              });
              row.uids.splice(row.uids.indexOf(uid), 1);
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
    deleteProject(row) {
      this.$confirm("确定删除该项目么?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$market
            .call("cloud-harbor", "delProject", {
              project: row.name,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.deleteProjectSucc"),
                type: "success",
              });
              this.fetchProjects();
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
    changePage(page) {
      this.page = page;
      this.fetchProjects();
    },
    fetchProjects() {
      this.$loading.show();
      this.$market
        .call("cloud-harbor", "getProjectList", {
          page_size: this.page_size,
          page: this.page,
        })
        .then((data) => {
          this.data = data.info.gList;
          this.data.forEach((e) => {
            e.update_time = moment(e.update_time).format("YYYY-MM-DD HH:mm:ss");

            e.uids.forEach((u) => {
              this.closable[u] = u != window.localStorage.uid;
            });
          });
          this.total = data.info.total;
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
  },
  created() {},
  mounted() {
    this.fetchProjects();
  },
};
</script>

<style>
.el-card-define .el-card__body {
  padding: 0px;
  height: 260px;
  position: relative;
}

.el-card-define .el-icon-plus {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 200%;
  font-weight: 100;
  transform: translate(-50%, -50%);
}
</style>
