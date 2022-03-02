<template>
  <div>
    <!-- 找回密码 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">
        {{ $t("market.login.findPasswordTitle") }}
      </h1>

      <el-form
        label-width="80px"
        :model="login"
        ref="ruleForgetForm"
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

        <el-button
          class="btn_long btn_submit"
          type="primary"
          size="small"
          round
          @click="forget"
          >{{ $t("market.login.submit") }}</el-button
        >
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

export default {
  name: "Forget",
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
      login: {
        ticket: "",
        uid: window.localStorage.uid || "",
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
      },
    };
  },
  methods: {
    show_login() {
      this.$router.push("/market/user/login");
    },
    forget() {
      this.$refs["ruleForgetForm"].validate((valid) => {
        if (valid) {
          this.$cloud
            .call("cloud-user", "forget", {
              uid: this.login.uid,
              origin: window.location.origin,
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.login.findPasswordSucc"),
                type: "success",
              });

              window.localStorage.uid = this.login.uid;

              this.$router.push("/market/user/resetPass");
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
  mounted() {},
};
</script>
