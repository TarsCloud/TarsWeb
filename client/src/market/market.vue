<template>
  <div style="width:100%;">
    <iframe
      id="market_frame"
      frameborder="0"
      style="width:100%;height:800px"
    ></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return { k8s: false };
  },
  mounted() {
    this.k8s = location.pathname.indexOf("k8s.html") != -1;
    this.load();
  },
  methods: {
    load() {
      if (this.k8s) {
        document.getElementById("market_frame").src = "/static/market/k8s.html";
      } else {
        document.getElementById("market_frame").src =
          "/static/market/index.html";
      }
    },
  },
};
</script>

<style></style>
