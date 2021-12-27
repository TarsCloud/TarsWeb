<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane v-for="p in protocols" :label="p.name" :key="p.name">
        <el-tag type="success" @click="download(p.name)">{{
          $t("market.download")
        }}</el-tag>
        <br />
        <br />

        <div style="border: 1px solid grey">
          <pre style="margin: 5px 10px 10px 10px" v-html="p.content"></pre>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import hljs from "highlight.js";

export default {
  name: "Protocols",
  components: {},
  props: ["serviceVersion"],
  data() {
    return {
      protocols: [],
    };
  },
  methods: {
    download(name) {
      new AjaxUtil().download(this.serviceVersion.prefix + name);
    },
    fetchProtocol() {
      for (let i in this.serviceVersion.protocols) {
        new AjaxUtil()
          .getPlain(
            this.serviceVersion.prefix + this.serviceVersion.protocols[i],
            {
              t: this.serviceVersion.update_time,
            }
          )
          .then((data) => {
            if (data.ok) {
              data.text().then((content) => {
                this.protocols.push({
                  name: i,
                  content: hljs.highlight(content, { language: "cpp" }).value,
                });
              });
            }
          })
          .catch((err) => {
            this.$message({
              message: err,
              type: "error",
            });
          });
      }
    },
  },
  created() {},
  mounted() {
    this.fetchProtocol();
  },
};
</script>
