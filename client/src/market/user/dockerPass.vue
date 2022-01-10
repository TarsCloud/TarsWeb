<template>
  <div>
    <!-- 重置密码 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">{{ $t("market.login.resetPass") }}</h1>
      <el-form
        label-width="120px"
        :model="data"
        ref="ruleForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item
          :label="$t('market.login.inputPassword')"
          prop="password"
          required
        >
          <el-input
            :placeholder="$t('market.login.passwordInfo')"
            v-model="data.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('market.login.repeatPassword')"
          prop="checkPass"
          required
        >
          <el-input
            :placeholder="$t('market.login.inputRepeatPassword')"
            v-model="data.checkPass"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          type="primary"
          size="small"
          round
          @click="createDockerUser"
          >{{ $t("market.login.resetPass") }}</el-button
        >
        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="back">{{ $t("market.login.back") }}</a>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import "@/assets/css/market.css";

export default {
  name: "createDockerUser",
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
        callback(new Error(this.$t("market.login.passwordInfo")));
      } else if (!passwordIsValid(value)) {
        callback(new Error(this.$t("market.login.passwordInfo")));
      } else {
        callback();
      }
    };

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
        uid: [
          {
            required: true,
            message: this.$t("market.login.inputUserName"),
            trigger: "blur",
          },
          { message: this.$t("market.login.userNameRegTips"), trigger: "blur" },
          { validator: validateEmail, trigger: "blur" },
        ],
        password: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
        ],
        checkPass: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        activeCode: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
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
    createDockerUser: function() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-user", "createUser", {
              password: this.data.password,
            })
            .then((data) => {})
            .catch((err) => {
              this.$message({
                message: err.err_msg,
                type: "error",
              });
            });
        } else {
          return false;
        }
      });
    },
  },
  mounted() {
    this.reloadCaptcha();
  },
};
</script>
