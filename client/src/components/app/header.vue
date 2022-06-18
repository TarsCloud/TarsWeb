<template>
  <div class="app_index__header">
    <div class="main-width">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="logo-wrap">
            <a
              v-if="enable === 'true' && show === 'true'"
              :class="{ active: true }"
              href="/tars.html"
              ><img class="logo" src="/static/img/tars-logo.png"
            /></a>
            <a v-if="k8s === 'true'" href="/k8s.html"
              ><img class="logo" src="/static/img/K8S.png"
            /></a>
          </div>
        </el-col>

        <el-col :span="9">
          <let-tabs
            class="tabs"
            :center="true"
            @click="clickTab"
            :activekey="$route.matched[0].path"
          >
            <let-tab-pane
              :tab="$t('header.tab.tab1')"
              tabkey="/server"
              :icon="serverIcon"
            ></let-tab-pane>
            <let-tab-pane
              :tab="$t('header.tab.tab2')"
              tabkey="/operation"
              :icon="opaIcon"
            ></let-tab-pane>
            <let-tab-pane
              :tab="$t('header.tab.tab9')"
              tabkey="/market"
              :icon="packageIcon"
            ></let-tab-pane>
          </let-tabs>
        </el-col>
        <el-col :span="3">
          <div class="plugin-wrap">
            <extentionSelect></extentionSelect>
          </div>
        </el-col>
        <el-col :span="2">
          <span class="version-wrap">
            <div>web:{{ web_version }}</div>
            <div>framework:{{ framework_version }}</div>
            <el-link
              style="font-size:9px"
              href="https://doc.tarsyun.com"
              target="_blank"
              >{{ locale == "cn" ? "在线文档" : "Online Manual" }}</el-link
            >
          </span>
        </el-col>
        <el-col :span="2">
          <span class="language-wrap">
            <localeSelect></localeSelect>
          </span>
        </el-col>
        <el-col :span="2">
          <div class="user-wrap">
            <el-dropdown
              style="display: block!important;"
              @command="handleCommand"
            >
              <span class="el-dropdown-link">
                {{ uid }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="center" v-show="enableLogin">{{
                  $t("header.userCenter")
                }}</el-dropdown-item>
                <el-dropdown-item command="modifyPass" v-if="!enableLdap">{{
                  $t("header.modifyPass")
                }}</el-dropdown-item>
                <el-dropdown-item command="quit" v-if="!enableLdap">{{
                  $t("header.logout")
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import serverIcon from "@/assets/img/server-icon.png";
import opaIcon from "@/assets/img/opa-icon.png";
import cacheIcon from "@/assets/img/cache-l.png";
import packageIcon from "@/assets/img/package-l.png";
import localeSelect from "@/components/locale-select";
import extentionSelect from "@/components/extention-select";

import Axios from "axios";
export default {
  components: {
    localeSelect,
    extentionSelect,
  },
  data() {
    return {
      // 图标
      serverIcon,
      opaIcon,
      cacheIcon,
      packageIcon,
      locale: this.$cookie.get("locale") || "cn",
      uid: "--",
      enableLogin: false,
      isAdmin: false,
      k8s: this.$cookie.get("k8s") || "false",
      enable: this.$cookie.get("enable") || "false",
      show: this.$cookie.get("show") || "false",
      enableLdap: false,
      web_version: "loading··",
      framework_version: "loading··",
    };
  },
  computed: {
    marketUid() {
      return this.$store.state.marketUid;
    },
  },
  methods: {
    clickTab(tabkey) {
      this.$router.replace(tabkey);
    },
    userCenter() {
      window.open("/pages/server/api/userCenter");
    },
    handleCommand(command) {
      if (command == "center") {
        location.href = "/auth.html";
      } else if (command == "modifyPass") {
        location.href = "/pass.html";
      }
      if (command == "quit") {
        location.href = "/pages/server/api/logout";
      }
    },
    getLoginUid() {
      this.$ajax
        .getJSON("/server/api/get_login_uid")
        .then((data) => {
          if (data && data.uid) {
            this.uid = data.uid;
            window.localStorage.localUid = this.uid;
          } else {
            this.uid = "***";
            window.localStorage.localUid = this.uid;
          }
        })
        .catch((err) => {
          this.$tip.error(
            `get user login info error: ${err.err_msg || err.message}`
          );
        });
    },
    checkEnableLogin() {
      this.$ajax
        .getJSON("/server/api/is_enable_login")
        .then((data) => {
          this.enableLogin = data.enableLogin || false;
        })
        .catch((err) => {});
    },
    checkEnableLdap() {
      this.$ajax
        .getJSON("/server/api/isEnableLdap")
        .then((data) => {
          this.enableLdap = data.enableLdap || false;
        })
        .catch((err) => {});
    },
    checkAdmin() {
      this.isAdmin = false;
      this.$ajax
        .getJSON("/server/api/isAdmin")
        .then((data) => {
          this.isAdmin = data.admin;
        })
        .catch((err) => {});
    },
  },
  mounted() {
    this.getLoginUid();
    this.checkEnableLogin();
    this.checkAdmin();
    this.checkEnableLdap();

    Axios.create({ baseURL: "/" })({
      method: "get",
      url: "/web/web_version",
    }).then((response) => {
      this.web_version = response.data.webVersion;
      this.framework_version = response.data.frameworkVersion;
      this.$store.commit({
        type: "version",
        version: this.web_version,
        framework_version: this.frameworkVersion,
      });
    });

    window.header = this;
  },
};
</script>

<style lang="postcss">
@import "../../assets/css/variable.css";

.app_index__header {
  height: 80px;
  border-bottom: 1px solid var(--border-color);

  .main-width {
    position: relative;
  }

  .tabs .let-tabs__header {
    border-bottom: none;
    height: 80px;
  }

  .version-wrap {
    top: 0;
    font-size: 12px;
    height: 80px;
    text-align: center;
    padding: 15px var(--gap-small);
    display: inline-block;
  }

  .logo-wrap {
    left: 0;
    width: auto;
    z-index: 100;
    padding: 0px;

    a {
      display: inline-block;
      height: 80px;
      padding: 30px 20px 0;
      position: relative;
      &.active {
        &::after {
          content: "";
          display: inline-block;
          height: 3px;
          width: 100%;
          background: #457ff5;
          position: absolute;
          top: 76px;
          left: 0px;
        }
      }
      .logo {
        height: 25px;
      }
    }
    .logo {
      height: 28px;
    }
  }

  .plugin-wrap {
    height: 80px;
    padding-top: 20px;
    display: inline-block;
  }

  .language-wrap {
    height: 80px;
    padding-top: 20px;
    display: inline-block;
  }

  .user-wrap {
    height: 50px;
    text-align: right;
    margin-top: 30px;
  }
}
</style>
