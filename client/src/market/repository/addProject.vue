<template>
  <el-dialog
    :title="$t('cloud.repo.project')"
    :visible.sync="project.addDialogVisible"
    width="500px"
  >
    <el-form :rules="rules" :model="project" ref="ruleForm">
      <el-form-item
        required
        :label="$t('cloud.repo.projectName')"
        prop="project"
        label-width="200"
      >
        <el-input
          v-model="project.project"
          :placeholder="$t('cloud.repo.inputProjectName')"
          maxlength="40"
          @input="inputProjectName"
          :suffix-icon="suffixIcon"
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="project.addDialogVisible = false">{{
        $t("cloud.deploy.cancel")
      }}</el-button>
      <el-button type="primary" @click="submit">{{
        $t("cloud.repo.project")
      }}</el-button>
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
        callback(new Error(this.$t("cloud.repo.projectNameRegTips")));
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
            message: this.$t("cloud.repo.projectNameRegTips"),
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
          this.$cloud
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
          this.$cloud
            .call("cloud-harbor", "createProject", {
              project: this.project.project,
            })
            .then((data) => {
              this.$common.showSucc(this.$t("cloud.repo.createProjectSucc"));

              this.closeDialog();
            })
            .catch((err) => {
              this.$common.showCloudError("repoRet", err);
            });
        }
      });
    },
  },
  created() {},
  mounted() {},
};
</script>
