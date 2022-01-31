<template>
  <div>
    <el-header class="header">
      <el-row :gutter="24" v-if="serviceVersion">
        <el-col :span="3">
          <el-avatar :size="100" :src="serviceVersion.logo"> </el-avatar>
        </el-col>
        <el-col :span="21">
          <span>
            <div style="margin-bottom:5px">
              <span class="title">{{ serviceVersion.name }}</span>

              <el-select
                v-model="serviceVersion.version"
                style="width:100px"
                @visible-change="visibleChange"
                @change="change"
              >
                <el-option
                  v-for="item in versions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </div>
            <div style="margin-bottom:5px">
              <span style="margin-bottom:10px; margin-right:10px">
                <el-tag effect="dark" size="mini" style=" margin-right:5px"
                  >语言</el-tag
                ><el-tag effect="plain" type="success" size="mini">{{
                  serviceVersion.lang
                }}</el-tag>
              </span>
            </div>
            <div style="margin-bottom:5px">
              <span style="margin-bottom:10px; margin-right:10px">
                <el-tag effect="dark" size="mini" style=" margin-right:5px"
                  >贡献者</el-tag
                ><el-tag
                  effect="plain"
                  type="success"
                  style="margin-right:5px"
                  size="mini"
                  v-for="u in serviceVersion.collaborators.split(',')"
                  v-bind:key="u"
                  >{{ u }}</el-tag
                >
              </span>
            </div>
            <div style="margin-bottom:5px">
              <span style="margin-bottom:10px; margin-right:10px">
                <el-tag
                  effect="dark"
                  type="warning"
                  size="mini"
                  style=" margin-right:5px"
                  >仓库</el-tag
                ><el-tag
                  effect="plain"
                  type="warning"
                  size="mini"
                  style="cursor:pointer"
                  @click="goRepository(serviceVersion.repository)"
                  >{{ serviceVersion.repository }}</el-tag
                >
              </span>
            </div>
            <div style="margin-bottom:5px">
              <span style="margin-bottom:10px; margin-right:10px">
                <el-tag
                  effect="dark"
                  size="mini"
                  type="danger"
                  style=" margin-right:5px"
                  >创建</el-tag
                ><el-tag effect="plain" type="danger" size="mini">{{
                  serviceVersion.create_time
                }}</el-tag>
              </span>

              <span>
                <el-tag
                  effect="dark"
                  size="mini"
                  type="danger"
                  style=" margin-right:5px"
                  >更新</el-tag
                ><el-tag effect="plain" type="danger" size="mini">{{
                  serviceVersion.update_time
                }}</el-tag>
              </span>
            </div>
            <span class="description"
              ><el-alert
                :title="getDescription(serviceVersion)"
                type="info"
                :closable="false"
              ></el-alert
            ></span>

            <el-tag
              style="margin-top:10px; cursor: pointer"
              type="danger"
              @click="showInstall"
              >安装</el-tag
            >
          </span>
        </el-col>
      </el-row>
    </el-header>

    <el-main v-if="serviceVersion">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="服务说明" name="readme">
          <markdown
            v-if="activeName == 'readme'"
            :serviceVersion="serviceVersion"
            :file="getReadme(serviceVersion)"
          ></markdown>
        </el-tab-pane>
        <el-tab-pane label="部署文件" name="deploy">
          <deploy
            v-if="activeName == 'deploy'"
            :serviceVersion="serviceVersion"
          ></deploy>
        </el-tab-pane>
        <el-tab-pane label="协议文件" name="protocols">
          <protocols
            v-if="activeName == 'protocols'"
            :serviceVersion="serviceVersion"
          ></protocols>
        </el-tab-pane>
        <el-tab-pane label="变更历史" name="changelist">
          <markdown
            v-if="activeName == 'changelist'"
            :serviceVersion="serviceVersion"
            :file="serviceVersion.changelist"
          ></markdown>
        </el-tab-pane>
        <el-tab-pane label="日志" name="logs">
          <logs
            v-if="activeName == 'logs'"
            :serviceVersion="serviceVersion"
          ></logs>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <install
      v-if="installServiceVersion"
      ref="install"
      :serviceVersion="installServiceVersion"
    ></install>
  </div>
</template>

<script>
import moment from "moment";

import markdown from "./markdown";
import deploy from "./deploy";
import protocols from "./protocols";
import install from "./install";
import logs from "./logs";

export default {
  name: "ServiceInfo",
  components: {
    markdown,
    deploy,
    protocols,
    install,
    logs,
  },
  data() {
    return {
      group: "",
      name: "",
      version: "",
      versions: [],
      installServiceVersion: null,
      serviceVersion: null,
      activeName: "readme",
      k8s: true,
    };
  },
  watch: {
    $route(to, from) {
      if (to.path.startsWith("/market/service")) {
        this.loadData(to.params.group, to.params.name, to.params.version);
      }
    },
  },
  methods: {
    handleClick() {
      console.log(this.activeName);
    },
    goRepository(repository) {
      window.open(repository);
    },
    loadData(group, name, version) {
      this.group = group;
      this.name = name;
      this.version = version;
      this.fetchServiceVersionData(this.version);
    },
    change(version) {
      this.version = version;
      this.fetchServiceVersionData(version);
    },
    visibleChange(open) {
      if (open) {
        this.fetchVersionListData();
      }
    },
    getDescription(row) {
      if (this.$cookie.get("locale") == "cn") {
        return row.description_cn || row.description;
      }
      return row.description;
    },
    getReadme(row) {
      if (this.$cookie.get("locale") == "cn") {
        return row.readme_cn || row.readme;
      }
      return row.readme;
    },
    fetchServiceVersionData(version) {
      this.$market
        .call("cloud-market", "getServiceVersion", {
          req: {
            group: this.group,
            name: this.name,
            version: version,
          },
        })
        .then((data) => {
          this.serviceVersion = null;
          this.$nextTick(() => {
            this.serviceVersion = data.rsp;
            this.serviceVersion.logo =
              this.serviceVersion.prefix +
              this.serviceVersion.logo +
              "?t=" +
              this.serviceVersion.update_time;
            this.serviceVersion.readme =
              this.serviceVersion.prefix +
              this.serviceVersion.readme +
              "?t=" +
              this.serviceVersion.update_time;
            this.serviceVersion.readme_cn =
              this.serviceVersion.prefix +
              this.serviceVersion.readme_cn +
              "?t=" +
              this.serviceVersion.update_time;
            this.serviceVersion.deploy =
              this.serviceVersion.prefix +
              this.serviceVersion.deploy +
              "?t=" +
              this.serviceVersion.update_time;
            this.serviceVersion.changelist =
              this.serviceVersion.prefix +
              this.serviceVersion.changelist +
              "?t=" +
              this.serviceVersion.update_time;

            this.serviceVersion.create_time = moment(
              this.serviceVersion.create_time
            ).format("YYYY-MM-DD");

            this.serviceVersion.update_time = moment(
              this.serviceVersion.update_time
            ).format("YYYY-MM-DD");
          });
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    fetchVersionListData() {
      this.$market
        .call("cloud-market", "getServiceVersionList", {
          req: {
            group: this.group,
            name: this.name,
          },
        })
        .then((data) => {
          this.versions = data.rsp.versions;
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    showInstall() {
      this.installServiceVersion = this.serviceVersion;
      this.$nextTick(() => {
        this.$refs.install.show();
      });
    },
  },
  created() {},
  mounted() {
    this.k8s = location.pathname == "/k8s.html";
    this.loadData(
      this.$route.params.group,
      this.$route.params.name,
      this.$route.params.version
    );
  },
};
</script>

<style>
.header .el-select .el-input__inner {
  border: 0px;
}
.title {
  font-size: 20pt;
  margin-bottom: 15px;
}

.description {
  font-size: 12pt;
}

.overflow {
  padding-top: 5px;
  padding-bottom: 5px;
  text-align: left;
  /* font-size: 12px; */
  color: #777777;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
