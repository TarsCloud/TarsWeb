<template>
  <div style="width:100%;">
    <iframe id="iframe" scrolling="no" frameborder="0" style="width:100%;">
    </iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      k8s: false,
    };
  },

  mounted() {
    this.k8s = location.pathname == "/k8s.html";

    this.load();

    setInterval(() => {
      this.setIframeHeight("iframe");
    }, 200);
  },
  watch: {
    $route(to, from) {
      this.load();
    },
  },
  methods: {
    load() {
      let ticket = this.$cookie.get("ticket") || "";

      let src = `${this.$route.path}?k8s=${this.k8s}&ticket=` + ticket;
      // console.log("load:" + src);
      document.getElementById("iframe").src = src;
    },
    setIframeHeight(id) {
      try {
        var iframe = document.getElementById(id);

        var bodyDom =
          iframe.contentWindow || iframe.contentDocument.parentWindow;

        iframe.height = bodyDom.outerHeight;
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
</script>
