<template>
  <div class="page_server">
    <div class="left-view">
      <div class="tree_search">
        <input
          :placeholder="$t('home.placeholder')"
          class="tree_search_key"
          v-model="treeSearchKey"
          @keydown.enter="filterTextChange"
        />
        <i
          class="el-icon-refresh-right"
          style="z-index: 99"
          :class="{ active: isIconPlay }"
          @click="treeSearch(1)"
        ></i>
      </div>
      <div class="tree_wrap">
        <el-tree
          class="left-tree"
          :data="treeData"
          v-if="treeData && treeData.length"
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          highlight-current
          :empty-text="$t('common.noService')"
          node-key="id"
          ref="trees"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <el-tooltip
              :content="data.name + '(' + data.serverType + ')'"
              placement="bottom-start"
              effect="light"
              :open-delay="openDelay"
            >
              <span>
                <i
                  :class="data.serverType | serverTypeFilter"
                  v-if="data.type == 2"
                ></i>
                {{ data.name }}
              </span>
            </el-tooltip>
          </span>
        </el-tree>
        <div class="left-tree" v-if="!treeData" v-loading="loading">
          <div class="loading" v-if="treeData === false">
            <p>{{ treeErrMsg }}</p>
            <a href="javascript:;" @click="getTreeData">{{
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
              >{{ item.id }}</a
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
          v-if="item.id === treeid"
        >
          <let-tabs @click="clickTab" :activekey="item.path">
            <let-tab-pane
              :tabkey="base + '/manage'"
              :tab="$t('header.tab.tab1')"
            ></let-tab-pane>
            <let-tab-pane
              v-if="serverData.level === 5"
              :tabkey="base + '/history'"
              :tab="$t('header.tab.tab7')"
            ></let-tab-pane>
            <let-tab-pane
              :tabkey="base + '/publish'"
              :tab="$t('index.rightView.tab.patch')"
              v-if="serverData.level === 5"
            ></let-tab-pane>
            <let-tab-pane
              :tabkey="base + '/config'"
              :tab="
                serverData.level === 5
                  ? $t('index.rightView.tab.serviceConfig')
                  : serverData.level === 1
                  ? $t('index.rightView.tab.appConfig')
                  : ''
              "
              v-if="serverData.level === 5 || serverData.level === 1"
            ></let-tab-pane>
            <let-tab-pane
              :tabkey="base + '/server-monitor'"
              :tab="$t('index.rightView.tab.statMonitor')"
              v-if="serverData.level === 5"
            ></let-tab-pane>
            <let-tab-pane
              :tabkey="base + '/property-monitor'"
              :tab="$t('index.rightView.tab.propertyMonitor')"
              v-if="serverData.level === 5"
            ></let-tab-pane>
            <!-- <let-tab-pane
              :tabkey="base + '/interface-debuger'"
              :tab="$t('index.rightView.tab.infDebuger')"
              v-if="serverData.level === 5"
            ></let-tab-pane> -->
            <let-tab-pane
              :tabkey="base + '/user-manage'"
              :tab="$t('index.rightView.tab.privileage')"
              v-if="serverData.level === 5"
            ></let-tab-pane>
            <let-tab-pane
              :tabkey="base + '/callChain'"
              :tab="$t('index.rightView.tab.treeConfig')"
              v-if="serverData.level === 5"
            ></let-tab-pane>
          </let-tabs>

          <router-view
            :is="getName(item.path)"
            :treeid="item.id"
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
import serverMonitor from "@/common/monitor-server";
import propertyMonitor from "@/common/monitor-property";
import interfaceDebuger from "@/common/interface-debuger";
import userManage from "@/common/user-manage";
import history from "./history";
import serverHistory from "./serverHistory";

export default {
  name: "Server",
  components: {
    callChain,
    manage,
    publish,
    config,
    "server-monitor": serverMonitor,
    "property-monitor": propertyMonitor,
    "interface-debuger": interfaceDebuger,
    "user-manage": userManage,
    history,
    serverHistory,
  },
  data() {
    return {
      treeErrMsg: "load failed",
      treeData: null,
      treeSearchKey: "",
      treeid: "",
      isIconPlay: false,
      // 当前页面信息
      serverData: {
        level: 5,
        application: "",
        server_name: "",
        // set_name: '',
        // set_area: '',
        // set_group: '',
      },

      // BTabs
      BTabs: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      openDelay: 1000,
      loading: false,
      homeTab: "home",
    };
  },
  computed: {
    base() {
      return `/k8s/${this.treeid}`;
    },
  },
  filters: {
    serverTypeFilter(val) {
      return val == "tars" ? "el-icon-tickets" : "el-icon-document-copy";
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
      },
    },
  },
  methods: {
    getName(val) {
      let result = "";
      if (val.lastIndexOf("/") > -1) {
        result = val.substring(val.lastIndexOf("/") + 1, val.length);
      }
      return result;
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
    handleNodeClick(node) {
      if (node.id && node.type != 0) {
        this.selectBTabs(node.id);
        this.checkCurrBTabs();
      }
    },
    filterTextChange() {
      this.$refs.trees.filter(this.treeSearchKey);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    },
    treeSearch(type) {
      this.iconLoading();
      this.getTreeData(this.treeSearchKey, type, true);
    },
    // 处理接口返回数据
    handleData(res, isFirstLayer) {
      if (!res || !res.length) return;

      res.forEach((node) => {
        node.label = node.name; //eslint-disable-line
        node.nodeKey = node.type !== "0" ? node.id : ""; //eslint-disable-line

        // // 第一层特殊图标、展开
        // if (isFirstLayer) {
        //   // node.iconClass = 'tree-icon';
        //   node.expand = true;  //eslint-disable-line
        // }

        if (this.treeSearchKey) {
          node.expand = true;
        }

        if (node.children && node.children.length) {
          this.handleData(node.children);
        }
      });
    },
    getTreeData(key, type, force) {
      this.treeData = null;
      this.$nextTick(() => {
        this.loading = true;
        this.$ajax
          .getJSON("/k8s/api/tree", {
            searchKey: key || "",
            force: force,
            type,
          })
          .then((res) => {
            this.loading = false;
            this.treeData = res;
            this.handleData(this.treeData, true);
          })
          .catch((err) => {
            this.loading = false;
            this.treeErrMsg = err.err_msg || err.message || "load failed";
            this.treeData = false;
          });
      });
    },
    getServerData() {
      if (!this.treeid) {
        this.treeid = this.getLocalStorage("k8s_treeid");
      }
      let server_type = "";
      if (this.$refs.trees) {
        let selectNode = this.$refs.trees.getNode(this.treeid);
        selectNode && (server_type = selectNode.data.serverType || "");
      }

      const treeArr = this.treeid.split(".");
      const serverData = {
        level: treeArr.length == 1 ? 1 : 5,
        application: treeArr[0],
        server_name: treeArr[1] || "",
        server_type: server_type,
        // set_name: '',
        // set_area: '',
        // set_group: '',
      };
      if (!this.treeid) {
        return {};
      }
      if (this.treeid == "home") {
        return serverData;
      }

      return serverData;
    },

    checkTreeid() {
      this.treeid = this.getLocalStorage("k8s_treeid") || "";
    },

    clickTab(tabkey) {
      let { treeid, BTabs } = this;
      BTabs &&
        BTabs.forEach((item) => {
          if (item.id === treeid) {
            item.path = tabkey;
          }
        });

      this.setLocalStorage("k8s_tabs", JSON.stringify(BTabs));
    },

    // 有些目录层级不显示某些标签，处理之
    isTrueTreeLevel() {
      const routeArr = this.$route.path.split("/");
      const route = routeArr[routeArr.length - 1];

      // 默认不处理
      let shouldRedirect = false;
      // publish、server-monitor、property-monitor 只有 level 5 可访问
      // if (this.serverData.level !== 5 &&
      //   (route === 'publish' || route === 'server-monitor' || route === 'property-monitor' || route === 'user-manage')) {
      //   shouldRedirect = true;
      // }
      // // config 有 level 5、4、1 可访问
      // if (this.serverData.level !== 5 && this.serverData.level !== 4 && this.serverData.level !== 1 && route === 'config') {
      //   shouldRedirect = true;
      // }

      if (route === "server" && this.serverData.level !== 1) {
        shouldRedirect = true;
      }

      // manage、history、publish 只有 level 2 可访问
      if (
        this.serverData.level !== 2 &&
        (route === "manage" || route === "history" || route === "publish")
      ) {
        shouldRedirect = true;
      }

      // 命中不可访问进行跳转
      if (shouldRedirect) {
        // this.$router.replace('manage');
        if (this.serverData.level === 1) {
          this.$router.replace("server");
        } else if (this.serverData.level === 2) {
          this.$router.replace("manage");
        }
      }
    },

    checkBTabs() {
      let { BTabs } = this;
      const tabs = this.getLocalStorage("k8s_tabs");
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
      this.setLocalStorage("k8s_treeid", JSON.stringify(nodeKey));
      this.setLocalStorage("k8s_tabs", JSON.stringify(BTabs));
    },

    clickBTabs(e, nodeKey) {
      if (nodeKey == this.homeTab) {
        serverHistory.data.serverListShow = false;
      }

      this.treeid = nodeKey;
      this.setLocalStorage("k8s_treeid", JSON.stringify(nodeKey));
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

      this.setLocalStorage("k8s_tabs", JSON.stringify(BTabs));

      if (BTabs.length > 0) {
        this.treeid = BTabs[BTabs.length - 1].id;
      } else {
        this.treeid = "home";
      }
      this.setLocalStorage("k8s_treeid", JSON.stringify(this.treeid));
      // this.getTreeData()
    },

    closeAllBTabs() {
      this.BTabs = [];
      this.treeid = "home";
      this.setLocalStorage("k8s_tabs", JSON.stringify(this.BTabs));
      this.setLocalStorage("k8s_treeid", JSON.stringify(this.treeid));
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

    if (!this.treeid) {
      this.treeid = "home";
    }
  },
};
</script>

<style>
@import "../../assets/css/variable.css";

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

  /*left-view*/
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
    margin-right: 10px;
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

    .tree-icon {
      width: 16px;
      height: 16px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100%;
      background-image: url("../../assets/img/tree-icon-2.png");
      margin-right: 4px;
      margin-left: 0;
      vertical-align: middle;

      & .down {
        transform: rotate(0);
      }

      & :before {
        content: "";
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
    margin-top: 20px;
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

    & :last-of-type {
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

    & :before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: currentColor;
      margin-right: 4px;
    }

    & :after {
      display: inline-block;
    }
  }
  .status-active {
    color: var(--active-color);

    & :after {
      content: "Active";
    }
  }
  .status-off {
    color: var(--off-color);

    & :after {
      content: "Off";
    }
  }

  .status-activating {
    color: var(--off-color);

    & :after {
      content: "Activating";
    }
  }

  .status-flowactive {
    & :after {
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
