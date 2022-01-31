<template>
  <div class="list">
    <el-row v-for="i in row" :key="i" :gutter="24" style="padding-bottom: 10px">
      <el-col :span="24 / column" v-for="j in column" :key="j">
        <el-card
          class="box-card"
          :body-style="{ padding: '0px' }"
          v-if="valid(i, j)"
        >
          <div slot="header" style="line-height:25px; position:relative">
            <el-avatar :size="25" :src="getServerLogo(i, j)"> </el-avatar>
            <span style="margin-left: 5px;position: absolute;">{{
              getServerName(i, j)
            }}</span>
            <el-popover
              placement="bottom"
              style="float: right;"
              v-model="isVisible[i + '_' + j]"
            >
              版本列表:
              <el-select
                v-if="serviceVersion"
                v-model="version"
                style="width:100px; "
                class="pop"
              >
                <el-option
                  v-for="item in versions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>

              <el-button
                size="small"
                style="line-height:25px; padding: 0px 10px 0 10px"
                @click="changeVersion(i, j)"
                >切换</el-button
              >
              <el-badge
                slot="reference"
                is-dot
                class="item"
                v-if="isUpgrade(i, j)"
              >
                <el-button
                  size="small"
                  style="line-height:25px; padding: 0px 10px 0 10px"
                  @click="fetchVersionListData(i, j)"
                  >切换版本</el-button
                >
              </el-badge>
              <el-button
                v-else
                slot="reference"
                size="small"
                style="line-height:25px; padding: 0px 10px 0 10px"
                @click="fetchVersionListData(i, j)"
                >切换版本</el-button
              >
            </el-popover>
          </div>
          <div slot="header">
            <el-button
              type="text"
              @click="goService(getCloudServerName(i, j))"
              >{{ getCloudServerName(i, j) }}</el-button
            >
            <br />
            <el-tooltip
              class="item"
              effect="dark"
              :content="getDigest(i, j)"
              placement="top-start"
            >
              <span style="font-size:10px">{{ getDigest(i, j, 10) }}</span>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <upgrade
      v-if="upgradeServiceVersion"
      ref="upgrade"
      @upgradeSucc="upgradeSucc"
      :serviceVersion="upgradeServiceVersion"
    ></upgrade>
  </div>
</template>

<script>
import upgrade from "./install";
import moment from "moment";
export default {
  name: "List",
  components: {
    upgrade,
  },
  data() {
    return {
      column: 4,
      row: 0,
      data: [],
      upgrade: {},
      isVisible: {},
      serviceVersion: null,
      upgradeServiceVersion: null,
      version: "",
      versions: [],
      k8s: true,
    };
  },
  methods: {
    valid(i, j) {
      return (i - 1) * this.column + j - 1 < this.data.length;
    },
    get(i, j) {
      let index = (i - 1) * this.column + j - 1;

      return this.data[index];
    },
    isUpgrade(i, j) {
      let e = this.getUpgrade(this.get(i, j));

      return this.upgrade[e.group + "-" + e.name + "-" + e.version];
    },
    getServerLogo(i, j) {
      return this.get(i, j)["tars.io/CloudLogo"];
    },
    getServerName(i, j) {
      return (
        this.get(i, j)["tars.io/ServerApp"] +
        "/" +
        this.get(i, j)["tars.io/ServerName"]
      );
    },
    getCloudServerName(i, j) {
      return this.get(i, j)["tars.io/CloudInstall"];
    },
    getDigest(i, j, length) {
      if (!length) return this.get(i, j)["tars.io/CloudDigest"];
      return this.get(i, j)["tars.io/CloudDigest"].substr(0, length + 7);
    },
    getUpgrade(data) {
      let str = data["tars.io/CloudInstall"];

      let pos1 = str.indexOf("-");

      let group = str.substr(0, pos1);

      let pos2 = str.indexOf("-", pos1 + 1);
      let name = str.substr(pos1 + 1, pos2 - pos1 - 1);

      let version = str.substr(pos2 + 1);

      return {
        group: group,
        name: name,
        version: version,
        digest: data["tars.io/CloudDigest"],
      };
    },
    goService(service) {
      this.$router.push("/market/service/" + service.replace(/-/g, "/"));
    },
    fetchListInstall() {
      this.$ajax
        .getJSON("/market/api/list_install", {
          k8s: this.k8s,
        })
        .then((data) => {
          this.data = data;

          this.row = Math.ceil((this.data.length + 1) / this.column);

          this.fetchCheckUpgrade();
        })
        .catch((err) => {
          this.$message({
            message: err.err_msg,
            type: "error",
          });
        });
    },
    fetchServiceVersionData(i, j, callback) {
      let service = this.getUpgrade(this.get(i, j));
      this.$market
        .call("cloud-market", "getServiceVersion", {
          req: {
            group: service.group,
            name: service.name,
            version: service.version,
          },
        })
        .then((data) => {
          this.serviceVersion = null;
          this.$nextTick(() => {
            this.serviceVersion = data.rsp;

            this.version = this.serviceVersion.version;

            if (callback) {
              callback();
            }
          });
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    fetchVersionListData(i, j) {
      this.fetchServiceVersionData(i, j, () => {
        let data = this.getUpgrade(this.get(i, j));

        this.$market
          .call("cloud-market", "getServiceVersionList", {
            req: {
              group: data.group,
              name: data.name,
            },
          })
          .then((data) => {
            this.versions = data.rsp.versions;
            this.isVisible[i + "_" + j] = true;
          })
          .catch((err) => {
            this.$message({
              message: err,
              type: "error",
            });
          });
      });
    },
    changeVersion(i, j) {
      let service = this.getUpgrade(this.get(i, j));
      this.$market
        .call("cloud-market", "getServiceVersion", {
          req: {
            group: service.group,
            name: service.name,
            version: this.version,
          },
        })
        .then((data) => {
          this.upgradeServiceVersion = data.rsp;
          this.upgradeServiceVersion.logo =
            this.upgradeServiceVersion.prefix +
            this.upgradeServiceVersion.logo +
            "?t=" +
            this.upgradeServiceVersion.update_time;
          this.upgradeServiceVersion.readme =
            this.upgradeServiceVersion.prefix +
            this.upgradeServiceVersion.readme +
            "?t=" +
            this.upgradeServiceVersion.update_time;
          this.upgradeServiceVersion.deploy =
            this.upgradeServiceVersion.prefix +
            this.upgradeServiceVersion.deploy +
            "?t=" +
            this.upgradeServiceVersion.update_time;
          this.upgradeServiceVersion.changelist =
            this.upgradeServiceVersion.prefix +
            this.upgradeServiceVersion.changelist +
            "?t=" +
            this.upgradeServiceVersion.update_time;

          this.upgradeServiceVersion.create_time = moment(
            this.upgradeServiceVersion.create_time
          ).format("YYYY-MM-DD");

          this.upgradeServiceVersion.update_time = moment(
            this.upgradeServiceVersion.update_time
          ).format("YYYY-MM-DD");

          this.upgradeServiceVersion.installData = {
            group: this.get(i, j)["tars.io/ServerApp"],
            name: this.get(i, j)["tars.io/ServerName"],
          };

          this.isVisible[i + "_" + j] = false;
          this.$nextTick(() => {
            this.$refs.upgrade.showUpgrade();
          });
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    upgradeSucc() {
      this.fetchInstallFromCloud();
    },
    fetchCheckUpgrade() {
      let info = [];

      this.data.forEach((e) => {
        let v = this.getUpgrade(e);
        info.push(v);
      });

      this.$market
        .call("cloud-market", "checkUpgrade", {
          req: {
            info: info,
          },
        })
        .then((data) => {
          this.upgrade = {};
          data.rsp.info.forEach((e) => {
            this.upgrade[e.group + "-" + e.name + "-" + e.version] = e.upgrade;
          });
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

    this.fetchListInstall();
  },
};
</script>

<style>
.list .text {
  font-size: 14px;
}

.pop .el-input__inner {
  border: 0px;
}

.list .item {
  margin-bottom: 18px;
}

.list .clearfix:before,
.list .clearfix:after {
  display: table;
  content: "";
}
.list .clearfix:after {
  clear: both;
}
</style>
