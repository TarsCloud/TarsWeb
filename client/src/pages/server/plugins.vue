<template>
  <div style="width:100%;margin-top:0px">
    <iframe :id="id" frameborder="0" style="width:100%;"> </iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: "iframe_" + this.treeid,
    };
  },

  mounted() {
    console.log("here");
    this.load();

    setInterval(() => {
      this.setIframeHeight(this.id);
    }, 500);
  },
  props: ["treeid", "path"],
  methods: {
    load() {
      document.getElementById(this.id).src =
        this.path + "?treeid=" + this.treeid;

      // console.log(document.getElementById(this.id).src);
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

        if (height < 800 && iframe.height < 800) {
          iframe.height = 800;
        }
      } catch (e) {
        // throw new Error(e);
      }
    },
  },
};
</script>
