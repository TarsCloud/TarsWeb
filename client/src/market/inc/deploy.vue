<template>
  <div>
    <yaml-editor
      v-model="data.deploy"
      style="margin: 1px"
      ref="yamlEdit"
    ></yaml-editor>
  </div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import YamlEditor from "@/components/editor/yaml-editor";

export default {
  name: "Deploy",
  components: {
    YamlEditor,
  },
  props: ["serviceVersion"],
  data() {
    return {
      data: {
        deploy: "",
      },
    };
  },
  methods: {
    fetchDeploy() {
      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy, {
          t: this.serviceVersion.update_time,
        })
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              this.data.deploy = content;

              this.$refs.yamlEdit.refresh();
            });
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
  created() {},
  mounted() {
    this.$refs.yamlEdit.readonly();
    this.fetchDeploy();
  },
};
</script>
