<template>
  <div style="width:100%;height:800px">
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
  methods: {
    load() {
      // console.log(this.$route);

      let src = `${this.$route.path}?ticket=` + this.$cookie.get("ticket");
      console.log("load:" + src);
      document.getElementById("iframe").src = src;
    },
    setIframeHeight(id) {
      try {
        // document.getElementById("iframe").height=document.getElementById("iframe").contentWindow.document.body.scrollHeight;

        var iframe = document.getElementById(id);

        let height = 0;
        if (iframe.attachEvent) {
          height = iframe.contentWindow.document.documentElement.scrollHeight;
        } else {
          height = iframe.contentDocument.body.scrollHeight;
        }

        // console.log(iframe.height);

        if (height < 800 && iframe.height < 800) {
          iframe.height = 800;
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
</script>
