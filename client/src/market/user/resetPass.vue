<template>
  <div>
    <!-- 重置密码 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">{{ $t("market.login.resetPass") }}</h1>
      <el-form
        label-width="200px"
        :model="data"
        ref="ruleForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item :label="$t('market.login.userName')" prop="uid" required>
          <el-input
            v-model="data.uid"
            :placeholder="$t('market.login.inputUserName')"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>

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
        <el-form-item
          :label="$t('market.login.activeCode')"
          prop="activeCode"
          required
        >
          <el-input
            :placeholder="$t('market.login.inputActiveCode')"
            v-model="data.activeCode"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item required>
          <div class="captcha_box">
            <el-input
              prefix-icon="el-icon-finished"
              type="text"
              :placeholder="$t('market.login.captcha')"
              v-model="data.captcha"
              required
              :required-tip="$t('market.login.captchaTips')"
              @keydown.enter="login"
            ></el-input>
            <img
              class="captcha_code"
              :title="$t('market.login.refresh')"
              :src="data.captchaUrl"
              @click="reloadCaptcha"
            />
          </div>
        </el-form-item>

        <el-button type="primary" size="small" round @click="resetPass">{{
          $t("market.login.resetPass")
        }}</el-button>
        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="show_login">{{
            $t("market.login.back")
          }}</a>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import "@/assets/css/market.css";

import sha1 from "sha1";
export default {
  name: "ResetPass1",
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
        activeCode: "",
        password: "",
        checkPass: "",
        captchaUrl: "",
        session: "",
        captcha: "",
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
    show_login() {
      this.$router.push("/market/user/login");
    },
    reloadCaptcha() {
      this.$cloud
        .call("cloud-user", "captcha")
        .then((data) => {
          this.data.captchaUrl =
            "data:image/svg+xml;base64," + data.ci.captchaBase64;
          this.data.session = data.ci.session;
        })
        .catch((err) => {
          this.$message({
            message: err.err_msg,
            type: "error",
          });
        });
    },
    resetPass: function() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$cloud
            .call("cloud-user", "resetPassByActiveCode", {
              rp: {
                uid: this.data.uid,
                activeCode: this.data.activeCode,
                password: sha1(this.data.password),
                captcha: this.data.captcha,
                session: this.data.session,
              },
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.login.findPasswordSucc"),
                type: "success",
              });

              window.localStorage.uid = this.data.uid;

              this.$router.push("/market/user/login");
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.userRet." + err.tars_ret || "-1"),
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
