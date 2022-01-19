<template>
  <router-view ref="childView"></router-view>
</template>
<script>
export default {
  name: "Index",
  data() {
    return {};
  },
  watch: {
    $route(to, from) {
      if (to.path == "/market") {
        this.checkLogin();
      }
    },
  },
  methods: {
    onLogin(isLogin) {
      if (isLogin) {
        this.$store.commit({
          type: "marketUid",
          uid: window.localStorage.uid,
        });
      }
      if (!isLogin && !location.hash.startsWith("#/market/user")) {
        this.$router.push("/market/user/login");
      } else if (isLogin && location.hash == "#/market") {
        this.$router.push("/market/list");
      }
    },
    checkLogin() {
      let ticket = window.localStorage.ticket;
      if (!ticket) {
        this.onLogin(false);
        return;
      }
      this.$market
        .call("cloud-user", "isLogin", {
          ticket: ticket,
        })
        .then((data) => {
          if (!data.uid) {
            this.onLogin(false);
          } else {
            window.localStorage.uid = data.uid;
            this.onLogin(true);
          }
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },
  mounted() {
    this.checkLogin();
  },
};
</script>
