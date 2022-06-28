<template>
  <div class="page_operation">
    <el-tabs @click="onTabClick" :activekey="$route.path">
      <el-tab-pane
        :label="$t('deployService.title.deploy')"
        name="/operation/deploy"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.undeploy')"
        name="/operation/undeploy"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.template')"
        name="/operation/templates"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.business')"
        name="/operation/business"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.application')"
        name="/operation/application"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.node')"
        name="/operation/node"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.event')"
        name="/operation/event"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.image')"
        name="/operation/image"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.framework')"
        name="/operation/tfc"
        v-if="isAdmin"
      ></el-tab-pane>
      <el-tab-pane
        v-for="plugin in plugins"
        v-bind:key="plugin.f_id"
        :name="'/operation/plugins' + plugin.f_path"
        :label="plugin.f_name"
      ></el-tab-pane>
    </el-tabs>
    <router-view class="page_operation_children" :path="name"></router-view>
  </div>
</template>

<script>
let oldPath = "/operation/deploy";
import plugins from "@/common/operationPlugins";
export default {
  name: "Operation",
  components: {
    plugins: plugins,
  },
  data() {
    return {
      isAdmin: false,
      name: "",
      plugins: [],
    };
  },

  beforeRouteEnter(to, from, next) {
    if (to.path === "/operation") {
      next(oldPath);
    } else {
      next();
    }
  },

  beforeRouteLeave(to, from, next) {
    oldPath = from.path;
    next();
  },
  created() {
    this.checkAdmin();
  },
  mounted() {
    this.getPlugins();
  },
  methods: {
    async checkAdmin() {
      this.isAdmin = false;
      return this.$ajax
        .getJSON("/server/api/isAdmin")
        .then((data) => {
          this.isAdmin = data.admin;
        })
        .catch((err) => {});
    },
    selectTree(nodeKey) {
      // console.log('selectTree', nodeKey);

      if (this.$route.path === "/operation") {
        this.$router.push(oldPath);
      } else {
        this.$router.push({
          params: {
            treeid: nodeKey,
          },
        });
      }
    },
    getPlugins() {
      this.$ajax
        .getJSON("/plugin/api/list", { k8s: false, type: 3 })
        .then((data) => {
          this.plugins = data;

          this.plugins.forEach((plugin) => {
            if (this.$cookie.get("locale") == "en") {
              plugin.f_name = plugin.f_name_en;
            }
          });
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    onTabClick(tabkey) {
      this.name = tabkey.name;
      this.$router.replace(tabkey.name);
    },
    // clickEvent(tabkey) {
    //   this.$router.replace(tabkey);
    // },
  },
};
</script>

<style>
.page_operation {
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow: hidden;
  padding-top: 30px;
  padding-bottom: 20px;
  width: 100%;

  &_children {
    display: flex;
    flex: 1;
    flex-flow: column;
    margin-top: 20px;
    overflow: auto;
    padding: 0 40px 20px 0;
    position: relative;
  }
  &_children::-webkit-scrollbar {
    border-radius: 10px;
  }
}
</style>
