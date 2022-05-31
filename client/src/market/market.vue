<template>
  <div style="width:100%;height:800px">
    <div
      style="text-align: center;margin-top:300px"
      v-if="!show"
      v-loading="!show"
    ></div>
    <iframe
      id="market_frame"
      frameborder="0"
      style="width:100%;height:800px"
      v-show="show"
    ></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return { k8s: false, show: false };
  },
  mounted() {
    this.k8s = location.pathname.indexOf("k8s.html") != -1;
    let iframe = document.getElementById("market_frame");
    if (iframe.attachEvent) {
      iframe.attachEvent("onload", () => {
        this.show = true;
      });
    } else {
      iframe.addEventListener(
        "load",
        () => {
          this.show = true;
        },
        false
      );
    }

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
