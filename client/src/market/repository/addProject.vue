<template>
  <el-dialog
    title="添加项目"
    :visible.sync="project.addDialogVisible"
    width="500px"
  >
    <el-form :rules="rules" :model="project" ref="ruleForm">
      <el-form-item required label="项目名称" prop="project" label-width="200">
        <el-input
          v-model="project.project"
          placeholder="请输入项目名称"
          maxlength="40"
          @input="inputProjectName"
          :suffix-icon="suffixIcon"
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="project.addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">添加项目</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "addProject",
  data() {
    var nameIsValid = (str) => {
      var result = str.match(/^[a-z]+$/);
      if (result == null) return false;

      return true;
    };
    var validateProjectName = (rule, value, callback) => {
      if (!nameIsValid(value)) {
        callback(new Error(this.$t("market.repo.projectNameRegTips")));
      } else {
        callback();
      }
    };
    return {
      project: {
        addDialogVisible: false,
        project: "",
      },
      suffixIcon: "",
      interval: null,
      rules: {
        project: [
          {
            required: true,
            message: "项目名称不能为空",
            trigger: "blur",
          },
          {
            message: this.$t("market.repo.projectNameRegTips"),
            trigger: "blur",
          },
          { validator: validateProjectName, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    show() {
      this.project.addDialogVisible = true;
    },
    closeDialog() {
      this.project.addDialogVisible = false;
      this.$emit("addProjectSucc");
    },
    inputProjectName(project) {
      if (project) {
        if (this.interval) {
          clearTimeout(this.interval);
          this.interval = null;
        }

        this.interval = setTimeout(() => {
          this.$market
            .call("cloud-harbor", "hasProject", {
              project: project,
            })
            .then((data) => {
              this.interval = null;
              if (project == this.project.project) {
                if (!data.exists) {
                  this.suffixIcon = "el-icon-check";
                } else {
                  this.suffixIcon = "el-icon-close";
                }
              }
            })
            .catch((err) => {});
        }, 500);
      }
    },
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-harbor", "createProject", {
              project: this.project.project,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.createProjectSucc"),
                type: "success",
              });

              this.closeDialog();
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.marketRet." + err.tars_ret || "-1"),
                type: "error",
              });
            });
        }
      });
    },
  },
  created() {},
  mounted() {},
};
</script>
