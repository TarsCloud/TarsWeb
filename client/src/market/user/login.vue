<template>
  <div>
    <!-- 登录 -->
    <el-card class="box-card market_page">
      <div>
        <h1 class="top_txt">
          {{ $t("market.login.loginTitle") }}
        </h1>
      </div>
      <el-form
        label-width="0"
        ref="ruleFormLogin"
        :model="login"
        :rules="rules"
        autocomplete="on"
      >
        <el-form-item prop="uid">
          <el-input
            v-model="login.uid"
            :placeholder="$t('market.login.userName')"
            prefix-icon="el-icon-message"
            autocomplete="on"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            :placeholder="$t('market.login.password')"
            v-model="login.password"
            show-password
            prefix-icon="el-icon-lock"
            autocomplete="on"
          >
          </el-input>
        </el-form-item>
        <el-form-item required>
          <div class="captcha_box">
            <el-input
              prefix-icon="el-icon-finished"
              type="text"
              :placeholder="$t('market.login.captcha')"
              v-model="login.captcha"
              required
              :required-tip="$t('market.login.captchaTips')"
              @keydown.enter="login"
            ></el-input>
            <img
              class="captcha_code"
              :title="$t('market.login.refresh')"
              :src="login.captchaUrl"
              @click="reloadCaptcha"
            />
          </div>
        </el-form-item>

        <el-button
          type="primary"
          size="small"
          round
          @click="doLogin"
          class="btn_long"
          >{{ $t("market.login.login") }}</el-button
        >

        <br />
        <br />
        <div class="sub_menu">
          <div class="bot_txt">
            <span
              >{{ $t("market.login.registerInfo") }}
              <a size="small" round @click="show_registry">{{
                $t("market.login.register")
              }}</a>

              {{ $t("market.login.and") }}
              <a size="small" round @click="show_active">{{
                $t("market.login.activated")
              }}</a>
            </span>
            <br />
            <span
              >{{ $t("market.login.forget") }}
              <a size="small" style="float: right" round @click="forget_pass">{{
                $t("market.login.findPassword")
              }}</a>
              {{ $t("market.login.and") }}
              <a size="small" style="float: right" round @click="reset_pass">{{
                $t("market.login.resetPassword")
              }}</a>
              {{ $t("market.login.password") }}
            </span>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import sha1 from "sha1";
import "@/assets/css/market.css";

export default {
  name: "Login",
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

    return {
      login: {
        ticket: "",
        uid: window.localStorage.uid || "",
        captcha: "",
        password: "",
        captchaUrl: "",
        session: "",
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
      },
    };
  },
  methods: {
    reloadCaptcha() {
      this.$market
        .call("cloud-user", "captcha")
        .then((data) => {
          this.login.captchaUrl =
            "data:image/svg+xml;base64," + data.ci.captchaBase64;
          this.login.session = data.ci.session;
        })
        .catch((err) => {
          this.$message({
            message: this.$t("market.userRet." + err.tars_ret || "-1"),
            type: "error",
          });
        });
    },
    forget_pass() {
      this.$router.push("/market/user/forget");
    },
    show_registry() {
      this.$router.push("/market/user/register");
    },
    show_active() {
      this.$router.push("/market/user/activate");
    },
    reset_pass() {
      this.$router.push("/market/user/resetPass");
    },
    doLogin() {
      this.$refs["ruleFormLogin"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-user", "login", {
              li: {
                uid: this.login.uid,
                password: sha1(this.login.password),
                captcha: this.login.captcha,
                session: this.login.session,
              },
            })
            .then((data) => {
              if (data.ticket) {
                this.login.ticket = data.ticket;
                this.login.isLogin = true;

                window.localStorage.ticket = data.ticket;
                window.localStorage.uid = this.login.uid;

                this.$store.commit({
                  type: "marketUid",
                  uid: window.localStorage.uid,
                });

                this.$router.push("/market/list");
              } else {
                this.login.ticket = "";
                this.login.isLogin = false;

                window.localStorage.ticket = "";
              }
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
    this.$refs["ruleFormLogin"].resetFields();
  },
};
</script>
