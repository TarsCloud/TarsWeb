<template>
  <div>
    <el-card class="box-card market_page">
      <el-alert
        :title="$t('market.login.registerSucc')"
        type="success"
      ></el-alert>

      <div>
        <h1 class="top_txt">
          {{ $t("market.login.activing") }}
        </h1>
      </div>

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

        <el-form-item
          :label="$t('market.login.activeCode')"
          prop="activeCode"
          required
        >
          <el-input
            v-model="login.activeCode"
            :placeholder="$t('market.login.inputActiveCode')"
            prefix-icon="el-icon-bell"
          ></el-input>
        </el-form-item>

        <el-button
          class="btn_long btn_submit"
          type="primary"
          size="small"
          round
          @click="activate"
          >{{ $t("market.login.activate") }}</el-button
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
  name: "Activate",
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
        uid: window.localStorage.uid || "",
        activeCode: "",
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
        activeCode: [
          {
            required: true,
            message: this.$t("market.login.inputActiveCode"),
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    console.log(this.$route.params);

    this.login.activeCode = this.$route.params.uid;
    // this.activate();
  },
  methods: {
    // getQueryVariable(variable) {
    //   let pos = location.href.indexOf("?");
    //   if (pos == -1) {
    //     return "";
    //   }

    //   let query = location.href.substring(pos + 1);

    //   let vars = query.split("&");
    //   for (let i = 0; i < vars.length; i++) {
    //     let pair = vars[i].split("=");

    //     if (pair[0] == variable) {
    //       return pair[1];
    //     }
    //   }
    //   return "";
    // },
    show_login() {
      this.$router.push("/market/user/login");
    },
    activate: function() {
      // const token = this.getQueryVariable("token");
      this.$market
        .call("cloud-user", "activate", {
          uid: this.login.uid,
          activeCode: this.login.activeCode,
        })
        .then(() => {
          this.$message({
            message: this.$t("market.login.activateSuccAndRedirect"),
            type: "success",
          });

          setTimeout(() => {
            this.$router.push("/market/user/login");
          }, 1000);
        })
        .catch((err) => {
          this.$message({
            message: this.$t("market.login.resetFailed"),
            type: "warning",
          });
        });
    },
  },
};
</script>
