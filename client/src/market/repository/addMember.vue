<template>
  <el-dialog
    title="授权用户"
    :visible.sync="project.addDialogVisible"
    width="500px"
  >
    <el-form :rules="rules" :model="project" ref="ruleForm">
      <el-form-item required label="用户名" prop="uid" label-width="200">
        <el-autocomplete
          style="width:100%"
          v-model="project.uid"
          :fetch-suggestions="searchUserName"
          placeholder="请输入用户名"
          :trigger-on-focus="false"
          @select="handleSelect"
          :suffix-icon="suffixIcon"
        ></el-autocomplete>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="project.addDialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        @click="submit"
        :disabled="suffixIcon != 'el-icon-check'"
        >授权用户</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "addMember",
  data() {
    var validateEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if (!value) {
        return callback(new Error(this.$t("market.login.userNameRegTips")));
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("market.login.userNameRegTips")));
        }
      }, 100);
    };

    return {
      project: {
        addDialogVisible: false,
        project: "",
        uid: "",
      },
      uids: [],
      suffixIcon: "",
      interval: null,
      rules: {
        uid: [
          {
            required: true,
            message: this.$t("market.login.inputUserName"),
            trigger: "blur",
          },
          { message: this.$t("market.login.userNameRegTips"), trigger: "blur" },
          { validator: validateEmail, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    show(project) {
      this.project.project = project;
      this.project.uid = "";
      this.project.addDialogVisible = true;
    },
    closeDialog() {
      this.project.addDialogVisible = false;
      this.$emit("addMemberSucc");
    },
    searchUserName(queryString, cb) {
      if (queryString) {
        let results = this.uids.filter((e) => {
          return e.toLowerCase().indexOf(queryString.toLowerCase()) == 0;
        });

        let doCallback = (uids) => {
          let v = [];
          uids.forEach((e) => {
            v.push({
              value: e,
            });
          });

          if (uids.length > 0 && queryString == uids[0]) {
            this.suffixIcon = "el-icon-check";
          } else {
            this.suffixIcon = "el-icon-close";
          }
          cb(v);
        };

        if (results.length == 0 && queryString) {
          this.$market
            .call("cloud-harbor", "searchRepoUser", {
              userId: queryString,
            })
            .then((data) => {
              this.uids = data.uids;
              doCallback(this.uids);
            })
            .catch((err) => {});
        } else {
          doCallback(results || []);
        }
      }
    },
    handleSelect(item) {
      this.suffixIcon = "el-icon-check";
    },
    submit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-harbor", "addProjectDeveloper", {
              project: this.project.project,
              uid: this.project.uid,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.createMemberSucc"),
                type: "success",
              });

              this.closeDialog();
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.repoRet." + err.tars_ret || "-1"),
                type: "error",
              });
            });
        }
      });
    },
  },
  created() {},
  mounted() {
    setInterval(() => {
      this.searchUserName();
    }, 200);
  },
};
</script>
