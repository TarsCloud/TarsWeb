<template>
  <!--  基础信息-->
  <div class="page_operation_deploy">
    <baseInfo @next="next" v-if="deployObj" :deployObj="deployObj"></baseInfo>
    <install
      ref="install"
      v-if="show"
      :deployObj="deployObj"
      @doInstall="doInstall"
    ></install>
  </div>
</template>

<script>
const getInitialModel = () => ({
  app: "",
  server: "",
  template: "",
  profile: "",
  servants: [
    {
      name: "",
      port: 10000,
      isTars: true,
      isTcp: true,
      thread: 2,
      capacity: 100000,
      connection: 10000,
      timeout: 30000,
    },
  ],
  replicas: 2,
  hostNetwork: false,
  hostIPC: false,
  hostPorts: [],
  new: true,
});

import baseInfo from "@/k8s/inc/k8s/base";
import install from "@/k8s/inc/k8s/install";

export default {
  name: "OperationDeploy",

  components: {
    baseInfo,
    install,
  },

  data() {
    return {
      templates: [],
      appList: [],
      show: false,
      deployObj: getInitialModel(),
    };
  },
  mounted() {},
  methods: {
    next(deployObj) {
      console.log(deployObj);

      this.deployObj = deployObj;

      this.show = true;

      this.$nextTick(() => {
        this.$refs.install.show();
      });
    },
    doInstall() {
      this.$confirm(this.$t("cloud.deploy.install"), "Hint", {
        confirmButtonText: this.$t("cloud.deploy.confirm"),
        cancelButtonText: this.$t("cloud.deploy.cancel"),
        type: "warning",
      })
        .then(() => {
          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/k8s/api/install", {
              deploy: this.deployObj,
            })
            .then((res) => {
              loading.hide();
              this.$message({
                message: `${this.$t("common.success")}`,
                type: "success",
              });
              this.dialogVisible = false;
              this.$refs.install.closeDetailModel();
            })
            .catch((err) => {
              loading.hide();
              if (err.ret_code == 201) {
                this.$message({
                  showClose: true,
                  message: this.$t("cloud.deploy.existsK8S"),
                  type: "warning",
                });
              } else {
                this.$message({
                  message: err,
                  type: "error",
                });
              }
            });
        })
        .catch(() => {});
    },
  },
};
</script>

</style>
