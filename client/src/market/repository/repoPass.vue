<template>
  <div>
    <!-- 重置密码 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">{{ $t("market.repo.resetPass") }}</h1>
      <el-form
        label-width="120px"
        :model="data"
        ref="ruleForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item
          :label="$t('market.repo.inputPassword')"
          prop="password"
          required
        >
          <el-input
            :placeholder="$t('market.repo.passwordInfo')"
            v-model="data.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('market.repo.repeatPassword')"
          prop="checkPass"
          required
        >
          <el-input
            :placeholder="$t('market.repo.inputRepeatPassword')"
            v-model="data.checkPass"
            show-password
          ></el-input>
        </el-form-item>
        <el-button type="primary" size="small" round @click="createRepoUser">{{
          $t("market.repo.resetPass")
        }}</el-button>
        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="back">{{ $t("market.repo.back") }}</a>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import "@/assets/css/market.css";

export default {
  name: "createRepoUser",
  data() {
    // 判断是否含有大写字母/小写字母/数字
    var passwordIsValid = (str) => {
      var result = str.match(/^.*[A-Z]+.*$/);
      if (result == null) return false;
      var result = str.match(/^.*[a-z]+.*$/);
      if (result == null) return false;
      var result = str.match(/^.*[0-9]+.*$/);
      if (result == null) return false;

      return true;
    };

    var validatePass = (rule, value, callback) => {
      if (value.length < 8) {
        callback(new Error(this.$t("market.repo.passwordInfo")));
      } else if (!passwordIsValid(value)) {
        callback(new Error(this.$t("market.repo.passwordInfo")));
      } else {
        callback();
      }
    };

    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("market.login.inputPasswordAgain")));
      } else if (value !== this.data.password) {
        callback(new Error(this.$t("market.login.passwordDiff")));
      } else {
        callback();
      }
    };
    return {
      data: {
        uid: window.localStorage.uid || "",
        password: "",
        checkPass: "",
      },
      rules: {
        password: [
          {
            required: true,
            message: this.$t("market.repo.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("market.repo.passwordInfo"),
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
        ],
        checkPass: [
          {
            required: true,
            message: this.$t("market.repo.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("market.repo.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        activeCode: [
          {
            required: true,
            message: this.$t("market.repo.inputPassword"),
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    createRepoUser: function() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-harbor", "createRepoUser", {
              password: this.data.password,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.repo.resetPassSucc"),
                type: "success",
              });

              setTimeout(() => {
                this.$router.go(-1);
              }, 1000);
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.repoRet." + err.tars_ret || "-1"),
                type: "error",
              });
            });
        } else {
          return false;
        }
      });
    },
  },
  mounted() {},
};
</script>
