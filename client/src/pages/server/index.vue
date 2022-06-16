<template>
  <div class="page_server">
    <div class="left-view">
      <div class="tree_search">
        <input
          v-model="treeSearchKey"
          class="tree_search_key"
          type="text"
          @keydown.enter="treeSearch(0)"
          :placeholder="$t('home.placeholder')"
        />
        <i
          class="el-icon-refresh-right"
          id="img"
          :class="{ active: isIconPlay }"
          @click="treeSearch(1)"
        ></i>
      </div>

      <div class="tree_wrap">
        <let-tree
          class="left-tree"
          v-if="treeData && treeData.length"
          :data="treeData"
          :activeKey="treeid"
          @on-select="selectTree"
        />
        <div class="left-tree" v-if="treeData && !treeData.length">
          <p class="loading">{{ $t("common.noService") }}</p>
        </div>
        <div class="left-tree" v-if="!treeData" ref="treeLoading">
          <div class="loading" v-if="treeData === false">
            <p>{{ treeErrMsg }}</p>
            <a href="javascript:;" @click="getTreeData()">{{
              $t("common.reTry")
            }}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="right-view">
      <div class="btabs_wrap">
        <ul ref="btabs" class="btabs" v-vscroll>
          <li
            class="btabs_item"
            :class="{ active: homeTab === treeid }"
            :key="homeTab"
          >
            <a
              class="btabs_link"
              href="javascript:;"
              @click="clickBTabs($event, homeTab)"
              style="padding-right: 20px"
            >
              {{ $t("home.homeTab") }}
            </a>
          </li>
          <li
            class="btabs_item"
            :class="{ active: item.id === treeid }"
            v-for="item in BTabs"
            :key="item.id"
          >
            <a
              class="btabs_link"
              href="javascript:;"
              @click="clickBTabs($event, item.id)"
              >{{ getNewServerName(item.id) }}</a
            >
            <a
              class="btabs_close"
              href="javascript:;"
              @click="closeBTabs(item.id)"
            >
              {{ $t("home.close") }}</a
            >
          </li>
        </ul>
        <a
          class="btabs_all"
          href="javascript:;"
          :title="$t('home.closeAll')"
          @click="closeAllBTabs"
        >
          {{ $t("home.closeAll") }}</a
        >
      </div>

      <div
        v-show="treeid === homeTab"
        class="btabs_con_home"
        style="height: 800px"
      >
        <serverHistory></serverHistory>
      </div>
      <div class="btabs_con">
        <div
          class="btabs_con_item"
          v-for="item in BTabs"
          :key="item.id"
          v-show="item.id === treeid"
        >
          <el-tabs @tab-click="clickTab" v-model="item.path">
            <el-tab-pane
              :name="base + '/manage'"
              :label="$t('header.tab.tab1')"
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/publish'"
              :label="$t('index.rightView.tab.patch')"
              v-if="serverData.level === 5"
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/config'"
              :label="
                serverData.level === 5
                  ? $t('index.rightView.tab.serviceConfig')
                  : serverData.level === 4
                  ? $t('index.rightView.tab.setConfig')
                  : serverData.level === 1
                  ? $t('index.rightView.tab.appConfig')
                  : ''
              "
              v-if="
                serverData.level === 5 ||
                  serverData.level === 4 ||
                  serverData.level === 1
              "
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/server-monitor'"
              :label="$t('index.rightView.tab.statMonitor')"
              v-if="serverData.level === 5"
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/property-monitor'"
              :label="$t('index.rightView.tab.propertyMonitor')"
              v-if="serverData.level === 5"
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/user-manage'"
              :label="$t('index.rightView.tab.privileage')"
              v-if="serverData.level === 5"
            ></el-tab-pane>
            <el-tab-pane
              :name="base + '/callChain'"
              :label="$t('index.rightView.tab.treeConfig')"
              v-if="serverData.level === 5"
            ></el-tab-pane>
            <el-tab-pane
              v-if="serverData.level === 5"
              v-for="plugin in plugins"
              v-bind:key="plugin.f_id"
              :name="base + plugin.f_path + '/plugins'"
              :label="plugin.f_name"
            ></el-tab-pane>
          </el-tabs>

          <router-view
            :is="getName(item.path)"
            :treeid="item.id"
            :path="item.pluginPath"
            :k8s="false"
            ref="childView"
            class="page_server_child"
          ></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import manage from "./manage";
import callChain from "@/common/callchain";
import publish from "./publish";
import config from "./config";
import serverHistory from "./history";
import serverMonitor from "@/common/monitor-server";
import propertyMonitor from "@/common/monitor-property";
// import interfaceDebuger from "@/common/interface-debuger";
import userManage from "@/common/user-manage";
import serverPlugins from "@/components/serverPlugins";

export default {
  name: "Server",
  components: {
    callChain,
    manage,
    publish,
    config,
    "server-monitor": serverMonitor,
    "property-monitor": propertyMonitor,
    // "interface-debuger": interfaceDebuger,
    "user-manage": userManage,
    serverHistory,
    plugins: serverPlugins,
  },
  data() {
    return {
      treeErrMsg: "load failed",
      treeData: null,
      treeSearchKey: "",
      treeid: "home",
      isIconPlay: false,
      plugins: [],
      // 当前页面信息
      serverData: {
        level: 5,
        application: "",
        server_name: "",
        set_name: "",
        set_area: "",
        set_group: "",
      },
      homeTab: "home",
      BTabs: [],
    };
  },
  computed: {
    base() {
      return `/server/${this.treeid}`;
    },
  },
  watch: {
    treeid() {
      this.serverData = this.getServerData();
      this.$store.commit({
        type: "increment",
        name: this.serverData,
      });
      // this.isTrueTreeLevel();
    },
    $route(to, from) {
      if (to.path === "/server") {
        this.getTreeData();
      }
    },
  },
  directives: {
    vscroll: {
      componentUpdated(el) {
        let boxEl = el || "";
        let itemEl = el.children || [];
        let currEl = "";

        for (let index in itemEl) {
          let item = itemEl[index];

          const iclass = item.attributes["class"];

          if (iclass && iclass.value.indexOf("active") > -1) {
            currEl = item;
            break;
          }
        }

        if (currEl.offsetLeft < boxEl.scrollLeft) {
          const x = currEl.offsetLeft;
          boxEl.scrollTo(x, 0);
        } else if (
          currEl.offsetLeft + currEl.offsetWidth >
          boxEl.scrollLeft + boxEl.offsetWidth
        ) {
          const x = currEl.offsetLeft + currEl.offsetWidth - boxEl.offsetWidth;
          boxEl.scrollTo(x, 0);
        }
      },
    },
  },
  methods: {
    getNewServerName(id) {
      const v = id && id.split(".");
      if (!v) {
        return id;
      }
      if (v.length == 1) {
        const app = id && id.split(".")[0].substring(1);
        return `${app}`;
      }
      if (v.length > 1) {
        const app = id && id.split(".")[0].substring(1);
        const server =
          id && id.split(".")[id.split(".").length - 1].substring(1);
        return `${app}.${server}`;
      }
    },
    getName(val) {
      let result = "";
      if (val.lastIndexOf("/") > -1) {
        result = val.substring(val.lastIndexOf("/") + 1, val.length);
      }
      // console.log("val:", result);
      return result;
    },
    getPlugins() {
      this.$ajax
        .getJSON("/plugin/api/list", { k8s: false, type: 2 })
        .then((data) => {
          this.plugins = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    iconLoading() {
      const that = this;
      if (!that.isIconPlay) {
        that.isIconPlay = true;
        setTimeout(function() {
          that.isIconPlay = false;
        }, 1000);
      }
    },
    treeSearch(type) {
      this.iconLoading();
      this.getTreeData(this.treeSearchKey, type);
    },
    selectTree(nodeKey) {
      this.selectBTabs(nodeKey);
      this.checkCurrBTabs();
    },
    // 处理接口返回数据
    handleData(res, isFirstLayer) {
      if (!res || !res.length) return;
      res.forEach((node) => {
        node.label = node.name; //eslint-disable-line
        node.nodeKey = node.id; //eslint-disable-line

        if (this.treeSearchKey) {
          node.expand = true;
        }

        if (node.children && node.children.length) {
          this.handleData(node.children);
        }
      });
    },
    getTreeData(key, type) {
      this.treeData = null;

      this.$nextTick(() => {
        const loading = this.$loading.show();

        this.$ajax
          .getJSON("/server/api/tree", {
            searchKey: key || "",
            type,
          })
          .then((res) => {
            loading.hide();
            this.treeData = res;
            this.handleData(this.treeData, true);
          })
          .catch((err) => {
            loading.hide();
            this.treeErrMsg = err.err_msg || err.message || "load failed";
            this.treeData = false;
          });
      });
    },
    getServerData() {
      const serverData = {
        level: 5,
        application: "",
        server_name: "",
        set_name: "",
        set_area: "",
        set_group: "",
      };
      if (!this.treeid) {
        return {};
      }
      if (this.treeid == "home") {
        return serverData;
      }
      const treeArr = this.treeid.split(".");

      treeArr.forEach((item) => {
        const level = +item.substr(0, 1);
        const name = item.substr(1);
        switch (level) {
          case 1:
            serverData.application = name;
            break;
          case 2:
            serverData.set_name = name;
            break;
          case 3:
            serverData.set_area = name;
            break;
          case 4:
            serverData.set_group = name;
            break;
          case 5:
            serverData.server_name = name;
            break;
          default:
            break;
        }
        serverData.level = level;
      });

      return serverData;
    },

    checkTreeid() {
      this.treeid = this.getLocalStorage("_treeid_") || "";
    },

    clickTab(tabkey) {
      // console.log(tabkey);
      let { treeid, BTabs } = this;
      //       console.log("treeid",treeid);

      BTabs &&
        BTabs.forEach((item) => {
          if (item.id === treeid) {
            // console.log(item.path, tabkey.name);
            item.path = tabkey.name;
            item.pluginPath = tabkey.name.substr(this.base.length);
            item.pluginPath = item.pluginPath.substr(
              0,
              item.pluginPath.length - "/plugins".length
            );
          }
        });

      this.setLocalStorage("_tabs_", JSON.stringify(BTabs));
    },

    // 有些目录层级不显示某些标签，处理之
    isTrueTreeLevel() {
      const routeArr = this.$route.path.split("/");
      const route = routeArr[routeArr.length - 1];

      // 默认不处理
      let shouldRedirect = false;
      // publish、server-monitor、property-monitor 只有 level 5 可访问
      if (
        this.serverData.level !== 5 &&
        (route === "publish" ||
          route === "server-monitor" ||
          route === "property-monitor" ||
          route === "user-manage" ||
          route === "interface-debuger")
      ) {
        shouldRedirect = true;
      }
      // config 有 level 5、4、1 可访问
      if (
        this.serverData.level !== 5 &&
        this.serverData.level !== 4 &&
        this.serverData.level !== 1 &&
        route === "config"
      ) {
        shouldRedirect = true;
      }
      // 命中不可访问进行跳转
      if (shouldRedirect) {
        this.$router.replace("manage");
      }
    },

    checkBTabs() {
      let { BTabs } = this;
      const tabs = this.getLocalStorage("_tabs_");
      if (tabs && tabs.length > 0) {
        tabs.forEach((item) => {
          BTabs.push({
            id: item.id,
            path: item.path,
          });
        });
      }
    },

    checkCurrBTabs() {
      this.$nextTick(() => {
        let boxEl = this.$refs.btabs || "";
        let itemEl = boxEl.children || [];
        let currEl = "";

        itemEl.forEach((item) => {
          const iclass = item.getAttribute("class");
          if (iclass.indexOf("active") > -1) {
            currEl = item;
          }
        });

        if (currEl.offsetLeft < boxEl.scrollLeft) {
          const x = currEl.offsetLeft;
          boxEl.scrollTo(x, 0);
        } else if (
          currEl.offsetLeft + currEl.offsetWidth >
          boxEl.scrollLeft + boxEl.offsetWidth
        ) {
          const x = currEl.offsetLeft + currEl.offsetWidth - boxEl.offsetWidth;
          boxEl.scrollTo(x, 0);
        }
      });
    },

    selectBTabs(nodeKey) {
      let { BTabs } = this;
      let isBTabTrue = false;
      BTabs.forEach((item) => {
        if (item.id === nodeKey) {
          isBTabTrue = true;
          item.path = `/server/${nodeKey}/manage`;
        }
      });
      if (!isBTabTrue) {
        this.BTabs.push({
          id: nodeKey,
          path: `/server/${nodeKey}/manage`,
        });
      }

      this.treeid = nodeKey;
      this.setLocalStorage("_treeid_", JSON.stringify(nodeKey));
      this.setLocalStorage("_tabs_", JSON.stringify(BTabs));
    },

    clickBTabs(e, nodeKey) {
      if (nodeKey == this.homeTab) {
        serverHistory.data.serverListShow = false;
      }
      this.treeid = nodeKey;
      this.setLocalStorage("_treeid_", JSON.stringify(nodeKey));
    },
    closeBTabs(nodeKey) {
      let { BTabs } = this;
      let BIndex = 0;

      BTabs.forEach((item, index) => {
        if (item.id === nodeKey) {
          BIndex = index;
        }
      });
      BTabs.splice(BIndex, 1);

      this.setLocalStorage("_tabs_", JSON.stringify(BTabs));

      if (BTabs.length > 0) {
        this.treeid = BTabs[BTabs.length - 1].id;
      } else {
        this.treeid = "home";
      }
      this.setLocalStorage("_treeid_", JSON.stringify(this.treeid));
      this.getTreeData();
    },

    closeAllBTabs() {
      this.BTabs = [];
      this.treeid = "home";
      this.setLocalStorage("_tabs_", JSON.stringify(this.BTabs));
      this.setLocalStorage("_treeid_", JSON.stringify(this.treeid));
      this.getTreeData();
    },

    getLocalStorage(key) {
      let result = "";
      if (window.localStorage) {
        result = JSON.parse(JSON.parse(localStorage.getItem(key)));
      }
      return result;
    },

    setLocalStorage(key, val) {
      let result = "";
      if (window.localStorage) {
        result = localStorage.setItem(key, JSON.stringify(val));
      }
      return result;
    },
  },
  created() {
    this.serverData = this.getServerData();
    this.isTrueTreeLevel();
  },
  mounted() {
    this.checkTreeid();
    this.checkBTabs();
    this.getTreeData();
    this.getPlugins();

    //begin 浏览器刷新后所有tab页回到服务管理( 解决当多个tab页都选择配置(或其他相同的页),
    // 点击浏览器刷新后其他tab页都与当前tab页的内容相同,不刷新 )
    let { BTabs } = this;
    BTabs.forEach((item) => {
      item.path = `/server/${item.id}/manage`;
    });
    //end

    //当没选择默认主页
    if (!this.treeid) {
      this.treeid = "home";
    }
  },
};
</script>

<style>
@import "../../assets/css/variable.css";

.el-icon-refresh-right {
  cursor: pointer;
}
.el-icon-refresh-right.active {
  animation: icon_loading 1s;
}

@-webkit-keyframes icon_loading {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.page_server {
  padding-bottom: var(--gap-small);
  padding-top: var(--gap-big);
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;

  .left-view {
    display: flex;
    flex: 1;
    flex-flow: column;
    max-width: 260px;
  }
  /*目录搜索框*/
  .tree_search {
    display: inline;
    margin-bottom: 20px;
    position: relative;
  }
  .tree_search_key {
    display: inline;
    border: 1px solid #c0c4cc;
    border-radius: 4px;
    color: #222329;
    font-size: 14px;
    padding: 6px 10px;
    margin-right: 20px;
    box-sizing: border-box;
    width: 80%;
  }
  /**/
  .tree_wrap {
    display: flex;
    flex: 1;
    overflow: auto;
    position: relative;
  }
  .tree_wrap::-webkit-scrollbar {
    border-radius: 10px;
  }
  .tree_icon {
    color: #565b66;
    position: absolute;
    right: 10px;
    top: 10px;
  }
  /*目录树*/
  .left-tree {
    flex: 0 0 auto;
    width: 250px;
    min-height: 380px;

    .loading {
      display: block;
      text-align: center;
      margin: 180px auto 0;
    }

    .let-icon-caret-right-small {
      margin-right: 2px;
      margin-left: 4px;
    }

    ul.let-tree__node {
      font-size: 14px;
      line-height: var(--gap-small);
      margin-left: 18px;

      li {
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        white-space: pre;
      }
    }

    & > ul.let-tree__node {
      font-size: 16px;
      margin-bottom: 10px;
      margin-left: 0;

      & > li > ul.let-tree__node {
        margin-left: 0;

        li .pointer:first-of-type {
          margin-left: 20px;
        }

        li .pointer:first-of-type:empty {
          margin-left: 20px;
        }
      }
    }
  }
  /*目录树 end*/

  /*右侧窗口*/
  .right-view {
    display: flex;
    flex: 1;
    flex-flow: column;
    margin-left: 40px;
    overflow: hidden;
    position: relative;

    .empty {
      margin: 88px 0 0 calc((100% - 240px) / 2 - 108px);
      width: 240px;
      text-align: center;
      .package {
        width: 180px;
        height: 114px;
        margin-bottom: var(--gap-small);
      }
      .title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
      }
      .notice {
        line-height: 22px;
        color: #a2a9b8;
      }
    }
  }

  .page_server_child {
    display: flex;
    flex: 1;
    flex-flow: column;
    overflow: auto;
    padding-right: 20px;
  }
  .page_server_child::-webkit-scrollbar {
    border-radius: 10px;
  }

  .loading-placeholder {
    min-height: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .let_modal .let-loading__parent-relative .let-align__inner {
    padding-top: 0;
  }
  .let-form.two-columns.let-form-cols-2 {
    margin-right: -30px;
    .let-form-item {
      padding-right: 30px;
    }
  }
  .let-table__operation {
    padding-left: 0;
    padding-right: 0px;
    margin-right: 10px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  /*服务状态*/
  .status-active,
  .status-off,
  .status-activating,
  .status-flowactive {
    display: flex;
    align-items: center;

    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: currentColor;
      margin-right: 4px;
    }
    &:after {
      display: inline-block;
    }
  }
  .status-active {
    color: var(--active-color);
    &:after {
      content: "Active";
    }
  }
  .status-off {
    color: var(--off-color);
    &:after {
      content: "Off";
    }
  }

  .status-activating {
    color: var(--off-color);
    &:after {
      content: "Activating";
    }
  }

  .status-flowactive {
    &:after {
      content: "Active";
    }
  }
  /*服务状态 end*/

  /*右侧窗口 end*/
  .btabs_wrap {
    display: block;
    height: 32px;
    margin-bottom: 10px;
    position: relative;
  }
  .btabs {
    display: block;
    margin-right: 32px;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    white-space: nowrap;
  }
  .btabs::-webkit-scrollbar {
    border-radius: 10px;
    height: 8px;
  }
  .btabs:before {
    border-bottom: 1px solid #d7dae0;
    bottom: 0;
    content: "";
    left: 0;
    position: absolute;
    right: 0;
  }
  .btabs_item {
    border: 1px solid #d7dae0;
    display: inline-block;
    position: relative;
    z-index: 10;
  }
  .btabs_item + .btabs_item {
    margin-left: -1px;
  }
  .btabs_item:first-child {
    border-top-left-radius: 5px;
  }
  .btabs_item:last-child {
    border-top-right-radius: 5px;
  }
  .btabs_item.active {
    background: #457ff5;
  }
  .btabs_item.active .btabs_link {
    color: #fff;
  }
  .btabs_item:hover .btabs_close,
  .btabs_item.active .btabs_close {
    -webkit-transform: translateY(-50%) scale(1);
  }
  .btabs_item.active .btabs_close:before,
  .btabs_item.active .btabs_close:after {
    border-color: #fff;
  }
  .btabs_link {
    color: #9096a3;
    display: block;
    font-weight: bold;
    height: 30px;
    line-height: 20px;
    padding: 5px 30px 5px 10px;
  }
  .btabs_link:hover {
    color: #222329;
  }
  .btabs_close {
    display: block;
    font-size: 0;
    height: 30px;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 50%;
    width: 30px;
    z-index: 20;
    -webkit-transform: translateY(-50%) scale(0.5) rotateZ(-180deg);
    -webkit-transition: all 0.5s ease-in-out;
  }
  .btabs_close:before,
  .btabs_close:after {
    border-top: 1px solid #9096a3;
    content: "";
    height: 0;
    left: 50%;
    position: absolute;
    top: 50%;
    width: 13px;
  }
  .btabs_close:before {
    -webkit-transform: translate3d(-50%, -50%, 0) rotateZ(-45deg);
  }
  .btabs_close:after {
    -webkit-transform: translate3d(-50%, -50%, 0) rotateZ(45deg);
  }
  .btabs_all {
    background: #e36654;
    bottom: 0;
    border-radius: 5px;
    display: block;
    font-size: 0;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    text-indent: -9999em;
    width: 32px;
    z-index: 30;
  }
  .btabs_all:before,
  .btabs_all:after {
    border-top: 1px solid #fff;
    content: "";
    height: 0;
    left: 50%;
    position: absolute;
    top: 50%;
    width: 16px;
  }
  .btabs_all:before {
    -webkit-transform: translate3d(-50%, -50%, 0) rotateZ(-45deg);
  }
  .btabs_all:after {
    -webkit-transform: translate3d(-50%, -50%, 0) rotateZ(45deg);
  }
  .btabs_all:hover {
    opacity: 0.7;
  }

  .btabs_close:hover:before,
  .btabs_close:hover:after {
    border-color: #222329;
  }
  .btabs_item.active .btabs_link:hover {
    color: #222329;
  }
  .btabs_item.active .btabs_close:hover:before,
  .btabs_item.active .btabs_close:hover:after {
    border-color: #222329;
  }
  .btabs_con {
    display: flex;
    flex: 1;
    flex-flow: column;
    overflow: hidden;
  }
  .btabs_con_item {
    display: flex;
    flex: 1;
    flex-flow: column;
    overflow: hidden;
  }
  .btabs_con_home {
    display: flex;
    overflow: hidden;
  }
}
</style>
