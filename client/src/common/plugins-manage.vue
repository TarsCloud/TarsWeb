<template>
  <div style="width: 90%; margin-top: 50px">
    <div class="page_operation_approval">
      <el-card style="margin-top: 10px; padding: 15px">
        <div>
          <span
            >{{ $t("plugin.title") }}
            <i class="el-icon-refresh-right" @click="fetchPlugins()"></i>
          </span>

          <el-link
            style="float: right"
            href="https://doc.tarsyun.com/#/base/plugins.md"
            target="_black"
            >{{ $t("plugin.doc") }}</el-link
          >
        </div>
        <br />
        <let-table :data="plugins" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('plugin.name')" prop="name" width="25%">
          </let-table-column>

          <let-table-column
            :title="$t('plugin.obj')"
            prop="f_obj"
            width="15%"
          ></let-table-column>
          <let-table-column
            :title="$t('plugin.path')"
            prop="f_path"
            width="20%"
          ></let-table-column>
          <let-table-column
            :title="$t('plugin.extern')"
            prop="extern"
            width="10%"
          ></let-table-column>
          <let-table-column :title="$t('plugin.type')" prop="type" width="15%">
          </let-table-column>

          <let-table-column :title="$t('operate.operates')" width="15%">
            <template slot-scope="scope">
              <let-table-operation @click="removePlugin(scope.row)"
                >{{ $t("operate.delete") }}
              </let-table-operation>
            </template>
          </let-table-column>
        </let-table>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      k8s: false,
      plugins: [],
    };
  },

  mounted() {
    this.k8s = location.pathname == "/k8s.html";
    this.fetchPlugins();
  },
  watch: {
    $route(to, from) {},
  },
  methods: {
    fetchPlugins() {
      this.$ajax
        .getJSON("/plugin/api/listAll", {
          k8s: this.k8s,
        })
        .then((data) => {
          this.plugins = data;

          let locale = this.$cookie.get("locale");

          this.plugins.forEach((plugin) => {
            switch (plugin.f_type) {
              case 1:
                plugin.type = locale == "cn" ? "全局扩展" : "Global Plugin";
                break;
              case 2:
                plugin.type = locale == "cn" ? "服务扩展" : "Server Plugin";
                break;
              case 3:
                plugin.type = locale == "cn" ? "运维扩展" : "Operate Plugin";
                break;
              default:
                plugin.type = "Unknown Type";
                break;
            }

            switch (plugin.f_extern) {
              case 0:
                plugin.extern =
                  locale == "cn" ? "内部扩展" : "Internal extension";
                break;
              case 1:
                plugin.extern =
                  locale == "cn" ? "外部扩展" : "External extension";
                break;
            }
            plugin.name = plugin.f_name + "(" + plugin.f_name_en + ")";
          });
        })
        .catch((err) => {
          this.$common.showError(err);
        });
    },

    removePlugin(row) {
      this.$confirm(this.$t("plugin.delete"), this.$t("common.alert"))
        .then(() => {
          this.$ajax
            .postJSON("/plugin/api/delete", {
              id: row.f_id,
              k8s: this.k8s,
            })
            .then((data) => {
              this.fetchPlugins();
            })
            .catch((err) => {
              this.$common.showError(err);
            });
        })
        .catch(() => {});
    },
  },
};
</script>
