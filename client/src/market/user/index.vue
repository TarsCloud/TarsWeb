<template>
  <div>
    <router-view ref="childView"></router-view>
  </div>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      login: {
        ticket: "",
        isLogin: false,
        uid: window.localStorage.uid || "",
      },
    };
  },

  methods: {
    isLogin() {
      return this.login.isLogin;
    },
    checkLogin() {
      if (!this.login.ticket) {
        this.login.isLogin = false;

        return;
      }
      this.$market
        .call("cloud-user", "isLogin", {
          ticket: this.login.ticket,
        })
        .then((data) => {
          if (!data.userId) {
            this.login.showLogin = true;
          } else {
            this.login.isLogin = true;
            this.login.uid = data.uid;
            window.localStorage.uid = this.login.uid;
            this.$emit("onLogin", window.localStorage.uid);
          }
        })
        .catch((err) => {
          this.$message({
            message: this.$t("market.userRet." + err.tars_ret || "-1"),
            type: "error",
          });
        });
    },
  },
  mounted() {
    this.login.ticket = window.localStorage.ticket || "";
    this.checkLogin();
  },
};
</script>
