<template>
  <div>
    <!-- 重置密码 -->
    <el-card class="box-card market_page">
      <h1>{{ $t("market.login.resetPass") }}</h1>
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
        <el-button type="primary" size="small" round @click="resetPass">{{
          $t("market.login.submit")
        }}</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import "@/assets/css/market.css";

import sha1 from "sha1";
export default {
  name: "ResetPass",
  data() {
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
        password: "",
        checkPass: "",
      },
      rules: {
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
    getQueryVariable(variable) {
      let pos = location.href.indexOf("?");
      if (pos == -1) {
        return "";
      }

      let query = location.href.substring(pos + 1);

      let vars = query.split("&");
      for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");

        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return "";
    },
    resetPass: function() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          const token = this.getQueryVariable("token");
          this.$ajax
            .postJSON("/sso/resetPass", {
              password: sha1(this.data.password),
              token: token,
            })
            .then((res) => {
              this.$message({
                message: this.$t("market.login.resetSuccAndRedirect"),
                type: "success",
              });

              setTimeout(() => {
                location.href = res.href;
              }, 1000);
            })
            .catch((err) => {
              this.$message({
                message: this.$t("market.login.resetFailed"),
                type: "warning",
              });
            });
        } else {
          return false;
        }
      });
    },
  },
};
</script>
