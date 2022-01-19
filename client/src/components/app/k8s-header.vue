<template>
  <div class="app_index__header">
    <div class="main-width">
      <!-- <h1 class="hidden">TARS/K8S</h1> -->
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="logo-wrap">
            <a v-if="enable === 'true' && show === 'true'" href="/"
              ><img class="logo" src="/static/img/tars-logo.png"
            /></a>
            <a v-if="k8s === 'true'" :class="{ active: true }" href="/k8s.html"
              ><img class="logo" src="/static/img/K8S.png"
            /></a>
            <a v-if="enable === 'true'" href="/dcache.html"
              ><img class="logo" alt="dcache" src="/static/img/dcache-logo.png"
            /></a>
          </div>
        </el-col>

        <el-col :span="12">
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
              :tab="$t('header.tab.tab8')"
              tabkey="/gateway"
              :icon="cacheIcon"
            ></let-tab-pane>
            <let-tab-pane
              v-if="enableMarket == 'true'"
              :tab="$t('header.tab.tab9')"
              tabkey="/market/list"
              :icon="packageIcon"
            ></let-tab-pane>
          </let-tabs>
        </el-col>

        <el-col :span="2">
          <div class="language-wrap">
            <let-select
              v-model="locale"
              @change="changeLocale"
              :clearable="false"
            >
              <template v-for="locale in localeMessages">
                <let-option
                  :value="locale.localeCode"
                  :key="locale.localeCode"
                  >{{ locale.localeName }}</let-option
                >
              </template>
            </let-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="user-wrap">
            <el-dropdown
              @command="handleCommand"
              style="display: block!important;"
            >
              <span class="el-dropdown-link">
                {{ uid
                }}<i
                  class="el-icon-arrow-down el-icon--right"
                  v-show="enableLogin"
                ></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="center" v-show="enableLogin">{{
                  $t("header.userCenter")
                }}</el-dropdown-item>
                <el-dropdown-item command="modifyPass">{{
                  $t("header.modifyPass")
                }}</el-dropdown-item>
                <el-dropdown-item command="quit">{{
                  $t("header.logout")
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown @command="handleMarketCommand" v-if="marketUid">
              <span class="el-dropdown-link">
                <i class="el-icon-cloudy el-icon--left"></i>
                {{ marketUid.uid
                }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="pass">设置仓库密码</el-dropdown-item>
                <el-dropdown-item command="project"
                  >管理仓库项目</el-dropdown-item
                >
                <el-dropdown-item command="modify"
                  >修改服务市场密码</el-dropdown-item
                >
                <el-dropdown-item command="quit">退出市场登录</el-dropdown-item>
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
import releaseIcon from "@/assets/img/package-l.png";
import cacheIcon from "@/assets/img/cache-l.png";
import operatorIcon from "@/assets/img/operator-l.png";
import packageIcon from "@/assets/img/package-l.png";
import { localeMessages } from "@/locale/i18n";

export default {
  data() {
    return {
      // 图标
      serverIcon,
      opaIcon,
      releaseIcon,
      cacheIcon,
      operatorIcon,
      packageIcon,
      locale: this.$cookie.get("locale") || "en",
      enableMarket: this.$cookie.get("market") || "false",
      uid: "--",
      enableLogin: false,
      isAdmin: false,
      localeMessages: localeMessages,
      k8s: this.$cookie.get("k8s") || "false",
      enable: this.$cookie.get("enable") || "false",
      show: this.$cookie.get("show") || "false",
      enableLdap: false,
    };
  },
  computed: {
    marketUid() {
      console.log("marketUid", this.$store.state.marketUid);
      return this.$store.state.marketUid;
    },
  },
  methods: {
    handleCommand(command) {
      if (command == "center") {
        location.href = "/auth.html";
      } else if (command == "modifyPass") {
        location.href = "/pass.html";
      }
      if (command == "quit") {
        location.href = "/logout";
      }
    },
    handleMarketCommand(command) {
      if (command == "quit") {
        this.$store.commit({
          type: "quit",
        });

        this.$router.push("/market/user/login");
      } else if (command == "pass") {
        this.$router.push("/market/repo/pass");
      } else if (command == "project") {
        this.$router.push("/market/repo/project");
      } else if (command == "modify") {
        this.$router.push("/market/user/modifyPass");
      }
    },
    clickTab(tabkey) {
      this.$router.replace(tabkey);
    },
    userCenter() {
      window.open("/pages/server/api/userCenter");
    },
    getLoginUid() {
      this.$ajax
        .getJSON("/server/api/get_login_uid")
        .then((data) => {
          if (data && data.uid) {
            this.uid = data.uid;
          } else {
            this.uid = "***";
          }
        })
        .catch((err) => {
          this.$tip.error(`获取用户登录信息: ${err.err_msg || err.message}`);
        });
    },
    changeLocale() {
      this.$cookie.set("locale", this.locale, { expires: "1Y" });
      location.reload();
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

  .logo-wrap {
    /* position: absolute; */
    top: 0;
    height: 80px;
    padding: 26px var(--gap-small);
    z-index: 100;
    .logo {
      height: 28px;
    }
  }

  .language-wrap {
    /* right: 150px; */
    width: 150px;
    height: 80px;
    padding-top: 20px;
  }

  .user-wrap {
    height: 50px;
    text-align: right;
    margin-top: 30px;
  }
}
</style>
