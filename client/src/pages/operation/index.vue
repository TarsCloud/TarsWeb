<template>
  <div class="page_operation">
    <el-tabs @tab-click="onTabClick" v-model="value">
      <el-tab-pane
        :label="$t('deployService.title.deploy')"
        name="/operation/deploy"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.expand')"
        name="/operation/expand"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.template')"
        name="/operation/templates"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.nodes')"
        name="/operation/nodes"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.check')"
        name="/operation/check"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.application')"
        name="/operation/application"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.business')"
        name="/operation/business"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.businessRelation')"
        name="/operation/businessRelation"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.idcManage')"
        name="/operation/idc"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('deployService.title.image')"
        name="/operation/image"
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
import plugins from "@/common/operationPlugins";

let oldPath = "/operation/deploy";

export default {
  name: "Operation",
  components: {
    plugins: plugins,
  },
  data() {
    return {
      name: "",
      value: "",
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
  mounted() {
    this.getPlugins();
    this.value = this.$route.path;
    console.log(this.$route);
  },
  methods: {
    onTabClick(tabkey) {
      this.name = tabkey.name;
      this.$router.replace(tabkey.name);
    },
    getPlugins() {
      this.$ajax
        .getJSON("/plugin/api/list", { k8s: true, type: 3 })
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
