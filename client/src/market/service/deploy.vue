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
        k8s: true,
      },
    };
  },
  methods: {
    fetchDeploy() {
      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy)
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              this.data.deploy = content;

              // this.$refs.yamlEdit.refresh();
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
    this.k8s = location.pathname == "/k8s.html";
    this.$refs.yamlEdit.readonly();
    this.fetchDeploy();
  },
};
</script>
