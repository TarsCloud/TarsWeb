<template>
  <div style="width:100%;height:1200px">
    <iframe id="iframe" frameborder="0" style="width:100%;"> </iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  mounted() {
    this.load();

    setInterval(() => {
      this.setIframeHeight("iframe");
    }, 200);
  },
  watch: {
    $route(to, from) {
      console.log(to);
      this.load();
    },
  },
  methods: {
    load() {
      let ticket = this.$cookie.get("ticket");

      console.log(this.$route);

      let src = `${this.$route.path}?ticket=` + ticket;
      console.log("load:" + src);
      document.getElementById("iframe").src = src;
    },
    setIframeHeight(id) {
      try {
        var iframe = document.getElementById(id);

        let height = 0;
        if (iframe.attachEvent) {
          height = iframe.contentWindow.document.documentElement.scrollHeight;
        } else {
          height = iframe.contentDocument.body.scrollHeight;
        }

        // console.log(iframe.height);

        if (height < 1200 && iframe.height < 1200) {
          iframe.height = 1200;
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
</script>
