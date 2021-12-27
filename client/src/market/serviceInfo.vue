<template>
  <div>
    <el-header>
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
                  >创建</el-tag
                ><el-tag effect="dark" type="danger" size="mini">{{
                  serviceVersion.create_time
                }}</el-tag>
              </span>

              <span>
                <el-tag effect="dark" size="mini" style=" margin-right:5px"
                  >更新</el-tag
                ><el-tag effect="dark" type="danger" size="mini">{{
                  serviceVersion.update_time
                }}</el-tag>
              </span>
            </div>
            <span class="description"
              ><el-alert
                :title="serviceVersion.description"
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
          <markdown :serviceVersion="serviceVersion"></markdown>
        </el-tab-pane>
        <el-tab-pane label="部署文件" name="deploy">
          <deploy :serviceVersion="serviceVersion"></deploy>
        </el-tab-pane>
        <el-tab-pane label="协议文件" name="protocols">
          <protocols :serviceVersion="serviceVersion"></protocols>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <install
      v-if="serviceVersion"
      ref="install"
      :serviceVersion="serviceVersion"
    ></install>
  </div>
</template>

<script>
import moment from "moment";

import markdown from "./inc/markdown";
import deploy from "./inc/deploy";
import protocols from "./inc/protocols";
import install from "./inc/install";
export default {
  name: "ServiceInfo",
  components: {
    markdown,
    deploy,
    protocols,
    install,
  },
  data() {
    return {
      group: "",
      name: "",
      version: "",
      versions: [],
      serviceVersion: null,
      activeName: "readme",
    };
  },
  watch: {
    $route(to, from) {
      this.loadData(to.params.group, to.params.name);
    },
  },
  methods: {
    handleClick() {},
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
          this.serviceVersion = data.rsp;
          this.serviceVersion.logo =
            this.serviceVersion.prefix + this.serviceVersion.logo;
          this.serviceVersion.readme =
            this.serviceVersion.prefix + this.serviceVersion.readme;
          this.serviceVersion.deploy =
            this.serviceVersion.prefix + this.serviceVersion.deploy;

          this.serviceVersion.create_time = moment(
            this.serviceVersion.create_time
          ).format("YYYY-MM-DD HH:mm:ss");

          this.serviceVersion.update_time = moment(
            this.serviceVersion.update_time
          ).format("YYYY-MM-DD HH:mm:ss");
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
      this.$refs.install.showInstall();
    },
  },
  created() {},
  mounted() {
    this.loadData(
      this.$route.params.group,
      this.$route.params.name,
      this.$route.params.version
    );
  },
};
</script>

<style>
.el-select .el-input__inner {
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
