<template>
  <router-view ref="childView"></router-view>
</template>
<script>
export default {
  name: "Index",
  data() {
    return {};
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      let ticket = window.localStorage.ticket;
      if (!ticket) {
        vm.$loginUtil.onLogin(false);
        return;
      }
    });
  },
  methods: {},
  mounted() {},
};
</script>
