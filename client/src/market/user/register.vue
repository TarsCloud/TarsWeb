<template>
  <div>
    <!-- 注册 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">
        {{ $t("cloud.login.register") }}
      </h1>

      <el-form
        label-width="200px"
        :model="login"
        ref="ruleRegisterForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item :label="$t('cloud.login.userName')" prop="uid" required>
          <el-input
            v-model="login.uid"
            :placeholder="$t('cloud.login.inputUserName')"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('cloud.login.password')" prop="password">
          <el-input
            prefix-icon="el-icon-key"
            :placeholder="$t('cloud.login.passwordInfo')"
            v-model="login.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('cloud.login.repeatPassword')"
          prop="checkPass"
          required
        >
          <el-input
            prefix-icon="el-icon-key"
            :placeholder="$t('cloud.login.inputRepeatPassword')"
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
          >{{ $t("cloud.login.register") }}</el-button
        >
        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="show_login">{{
            $t("cloud.login.back")
          }}</a>
        </div>
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
        callback(new Error(this.$t("cloud.login.passwordInfo")));
      } else if (!passwordIsValid(value)) {
        callback(new Error(this.$t("cloud.login.passwordInfo")));
      } else {
        callback();
      }
    };

    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("cloud.login.inputPasswordAgain")));
      } else if (value !== this.login.password) {
        callback(new Error(this.$t("cloud.login.passwordDiff")));
      } else {
        callback();
      }
    };

    var validateEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if (!value) {
        return callback(new Error(this.$t("cloud.login.userNameRegTips")));
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("cloud.login.userNameRegTips")));
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
            message: this.$t("cloud.login.inputUserName"),
            trigger: "blur",
          },
          { message: this.$t("cloud.login.userNameRegTips"), trigger: "blur" },
          { validator: validateEmail, trigger: "blur" },
        ],
        password: [
          {
            required: true,
            message: this.$t("cloud.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("cloud.login.passwordInfo"),
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
        ],
        checkPass: [
          {
            required: true,
            message: this.$t("cloud.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 8,
            max: 16,
            message: this.$t("cloud.login.passwordInfo"),
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
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
          this.$cloud
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
              this.$common.showCloudError("userRet", err);
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
