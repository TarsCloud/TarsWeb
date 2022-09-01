<template>
  <div>
    <div style="display: inline-block; width: 70%">
      <el-select v-model="pluginPath" @change="changePlugin">
        <el-option
          :key="0"
          :label="$t('header.extension')"
          value="/plugins-manage"
        >
        </el-option>
        <el-option
          v-for="item in plugins"
          :key="item.f_id"
          :label="locale == 'cn' ? item.f_name : item.f_name_en"
          :value="item.f_path"
        >
        </el-option>
      </el-select>
    </div>
    <div style="margin-left: 10px; width: 20%; display: inline-block">
      <i class="el-icon-refresh-right" @click="refreshPlugin()"></i>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      locale: this.$cookie.get("locale") || "cn",
      pluginPath: "",
      plugins: [],
      k8s: false,
    };
  },
  watch: {
    $route(to, from) {
      if (to.path.startsWith("/plugins") && !to.path.startsWith("/plugins/*")) {
        this.pluginPath = to.path;
      } else {
        this.pluginPath = "";
      }
    },
  },
  methods: {
    refreshPlugin() {
      this.getPlugins();
    },
    changePlugin() {
      //   console.log("changePlugin:", this.pluginPath);

      let data = this.plugins.filter((plugin) => {
        return plugin.f_path == this.pluginPath;
      });

      //   console.log(data);

      if (data.length > 0) {
        if (data[0].f_extern == 0) {
          this.$router.replace(this.pluginPath);
        } else {
          window.open(data[0].f_path);
        }
      } else {
        this.$router.replace(this.pluginPath);
      }
    },
    getPlugins() {
      this.$ajax
        .getJSON("/plugin/api/list", { k8s: this.k8s, type: 1 })
        .then((data) => {
          this.plugins = data;
          if (this.$route.path.startsWith("/plugins")) {
            this.pluginPath = this.$route.path;
          } else {
            this.pluginPath = "";
          }
        })
        .catch((err) => {
          this.$common.showError(err);
        });
    },
  },
  mounted() {
    this.k8s = location.pathname == "/k8s.html";

    this.getPlugins();
  },
};
</script>

<style></style>
