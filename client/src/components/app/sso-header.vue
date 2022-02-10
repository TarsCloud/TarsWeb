<template>
  <!-- <div id="app"> -->
  <div class="app_index__header">
    <div class="main-width">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="logo-wrap">
            <a
              v-if="enable === 'true' && show === 'true'"
              :class="{ active: false }"
              href="/"
              ><img class="logo" src="/static/img/tars-logo.png"
            /></a>
            <a v-if="k8s === 'true'" :class="{ active: true }" href="/k8s.html"
              ><img class="logo" src="/static/img/K8S.png"
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
              :tab="$t('ssoHeader.tab.tab1')"
              tabkey="/"
              :icon="serverIcon"
            ></let-tab-pane>
            <let-tab-pane
              v-if="isAdmin"
              :tab="$t('ssoHeader.tab.tab2')"
              tabkey="/user"
              :icon="userIcon"
            ></let-tab-pane>
            <let-tab-pane
              :tab="$t('ssoHeader.tab.tab4')"
              tabkey="/token"
              :icon="tokenIcon"
            ></let-tab-pane>
            <let-tab-pane
              v-if="isAdmin"
              :tab="$t('ssoHeader.tab.tab5')"
              tabkey="/set"
              :icon="opaIcon"
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
            <el-dropdown style="margin-bottom:10px;" @command="handleCommand">
              <span class="el-dropdown-link">
                {{ uid
                }}<i
                  class="el-icon-arrow-down el-icon--right"
                  v-show="enableLogin"
                ></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="modifyPass">{{
                  $t("header.modifyPass")
                }}</el-dropdown-item>
                <el-dropdown-item command="quit">{{
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
import userIcon from "@/assets/img/operator-l.png";
import opaIcon from "@/assets/img/opa-icon.png";
import tokenIcon from "@/assets/img/create-l.png";
import packageIcon from "@/assets/img/package.png";
import { localeMessages } from "@/locale/i18n";

export default {
  name: "App",
  data() {
    return {
      serverIcon,
      opaIcon,
      userIcon,
      packageIcon,
      tokenIcon,
      locale: this.$cookie.get("locale") || "cn",
      localeMessages: localeMessages,
      enableLogin: true,
      isAdmin: false,
      uid: "--",
      k8s: this.$cookie.get("k8s") || "false",
      enable: this.$cookie.get("enable") || "false",
      show: this.$cookie.get("show") || "false",
      enableLdap: false,
    };
  },
  methods: {
    handleCommand(command) {
      if (command == "modifyPass") {
        location.href = "/pass.html";
      }
      if (command == "quit") {
        location.href = "/pages/server/api/logout";
        // location.href = "/logout";
      }
    },
    clickTab(tabkey) {
      this.$router.replace(tabkey);
    },
    changeLocale() {
      this.$cookie.set("locale", this.locale, { expires: "1Y" });
      location.reload();
    },
    getLoginUid() {
      this.$ajax
        .getJSON("/server/api/getLoginUid")
        .then((data) => {
          if (data && data.uid) {
            this.uid = data.uid;
          } else {
            this.uid = "***";
          }
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("login.getUidFailed")}: ${err.err_msg || err.message}`
          );
        });
    },
    checkEnableLogin() {
      this.$ajax
        .getJSON("/server/api/isEnableLogin")
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
    async checkAdmin() {
      this.isAdmin = false;
      return this.$ajax
        .getJSON("/server/api/isAdmin")
        .then((data) => {
          this.isAdmin = data.admin;
        })
        .catch((err) => {});
    },
  },
  async mounted() {
    this.getLoginUid();
    this.checkEnableLogin();
    await this.checkAdmin();
    this.checkEnableLdap();
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
