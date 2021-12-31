<template>
  <div>
    <!-- 注册 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">
        {{ $t("market.login.register") }}
      </h1>

      <el-form
        label-width="120px"
        :model="login"
        ref="ruleRegisterForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item :label="$t('market.login.userName')" prop="uid" required>
          <el-input
            v-model="login.uid"
            :placeholder="$t('market.login.inputUserName')"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('market.login.password')" prop="password">
          <el-input
            prefix-icon="el-icon-key"
            :placeholder="$t('market.login.passwordInfo')"
            v-model="login.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('market.login.repeatPassword')"
          prop="checkPass"
          required
        >
          <el-input
            prefix-icon="el-icon-key"
            :placeholder="$t('market.login.inputRepeatPassword')"
            v-model="login.checkPass"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          class="btn_long"
          type="primary"
          size="small"
          round
          @click="register"
          >{{ $t("market.login.register") }}</el-button
        >
        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="show_login">{{
            $t("market.login.back")
          }}</a>
        </div>
        <!--         
        <el-button
          class="btn_long"
          type="info"
          size="small"
          round
          @click="show_login"
          >{{ $t("market.login.back") }}</el-button
        > -->
        <!-- <div class="sub_menu">
          <a size="small" round @click="show_login">{{
            $t("market.login.bacbackk")
          }}</a>
        </div> -->
      </el-form>
    </el-card>
  </div>
</template>
<script>
import sha1 from "sha1";
import "@/assets/css/market.css";
export default {
  name: "Register",
  data() {
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("market.login.inputPasswordAgain")));
      } else if (value !== this.login.password) {
        callback(new Error(this.$t("market.login.passwordDiff")));
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
        checkPass: "",
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
            min: 6,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
    };
  },
  methods: {
    show_login() {
      this.$router.push("/market/user/login");
    },
    show_activate() {
      this.$router.push(`/market/user/activate`);
    },
    register: function() {
      this.$refs["ruleRegisterForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-user", "register", {
              uid: this.login.uid,
              password: sha1(this.login.password),
              origin: window.location.origin,
            })
            .then((data) => {
              window.localStorage.uid = this.login.uid;
              this.show_activate();
            })
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
  mounted() {},
};
</script>
