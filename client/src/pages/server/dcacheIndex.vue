<template>
  <div class="page_server">

    <let-tree class="left-tree"
              v-if="treeData && treeData.length"
              :data="treeData"
              :activeKey="$route.params.treeid"
              @on-select="selectTree"/>
    <div class="left-tree" v-if="treeData && !treeData.length">
      <p class="loading">{{$t('common.noService')}}</p>
    </div>
    <div class="left-tree" v-if="!treeData" ref="treeLoading">
      <div class="loading" v-if="treeData === false">
        <p>{{treeErrMsg}}</p>
        <a href="javascript:;" @click="getTreeData">{{$t('common.reTry')}}</a>
      </div>
    </div>

    <div class="right-view" v-if="!this.$route.params.treeid">
      <div class="empty" style="width: 300px;">
        <img class="package" src="@/assets/img/package.png">
        <p class="title">{{$t('index.rightView.title')}}</p>
        <p class="notice" v-html="$t('index.rightView.tips')"></p>
        <p class="notice">https://github.com/TarsCloud/DCache</p>
      </div>
    </div>

    <div class="right-view" v-else>
      <let-tabs @click="clickTab" :activekey="$route.path">

        <!--服务管理-->
        <let-tab-pane
          v-if="serverData.level !== 6"
          :tabkey="`${base}/manage/${serverType}`"
          :tab="$t('header.tab.tab1')"
        ></let-tab-pane>

        <!-- cache列表服务管理-->
        <let-tab-pane
          v-if="serverData.level === 6"
          :tabkey="`${base}/cache`"
          :tab="$t('header.tab.tab1')"
        ></let-tab-pane>

        <!--发布管理-->
        <let-tab-pane
          :tabkey="`${base}/publish/${serverType}`"
          :tab="$t('index.rightView.tab.patch')"
          v-if="(serverData.level === 5 && serverType !== 'dcache')"
        ></let-tab-pane>

        <!--服务配置-->
        <let-tab-pane
          :tabkey="`${base}/config/${serverType}`"
          :tab="serverData.level === 5 ? $t('index.rightView.tab.serviceConfig') :serverData.level === 4 ? $t('index.rightView.tab.setConfig') :serverData.level === 1 ? $t('index.rightView.tab.appConfig') : ''"
          v-if="(serverData.level === 5 || serverData.level === 4 || serverData.level === 1) && serverType !== 'dcache'"
        ></let-tab-pane>

        <!--服务监控-->
        <let-tab-pane
          :tabkey="`${base}/server-monitor/${serverType}`"
          :tab="$t('index.rightView.tab.statMonitor')"
          v-if="serverData.level === 5"
        ></let-tab-pane>

        <!--特性监控-->
        <let-tab-pane
          :tabkey="`${base}/property-monitor/${serverType}`"
          :tab="$t('index.rightView.tab.propertyMonitor')"
          v-if="serverData.level === 5 && this.$route.params.serverType !== 'dcache'"
        ></let-tab-pane>


        <!--用户管理-->
        <let-tab-pane
          :tabkey="`${base}/user-manage/${serverType}`"
          :tab="$t('index.rightView.tab.privileage')"
          v-if="serverData.level === 5 && enableAuth"></let-tab-pane>

        <!--模块才有的配置中心-->
        <let-tab-pane
          v-if="serverData.level === 6"
          :tabkey="base + '/moduleCache'"
          :tab="$t('cache.config.configuration')"
        ></let-tab-pane>
        <!--模块特有的特性监控-->
        <let-tab-pane
          v-if="serverData.level === 6"
          :tabkey="base + '/propertyMonitor'"
          :tab="$t('index.rightView.tab.propertyMonitor')"
        ></let-tab-pane>

      </let-tabs>

      <router-view ref="childView" class="page_server_child" :key="$route.params.treeid"></router-view>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'Server',
    data() {
      return {
        treeErrMsg: '加载失败',
        treeData: null,
        enableAuth: false,
        // 当前页面信息
        serverData: {
          level: 5,
          application: '',
          server_name: '',
          set_name: '',
          set_area: '',
          set_group: '',
          module_name: '',
        },
      };
    },
    computed: {
      base() {
        return `/server/${this.$route.params.treeid}`;
      },
      serverType() {
        return this.$route.params.serverType
      },

    },
    watch: {
      '$route.params.treeid': function (treeid) { // eslint-disable-line
        console.log('$route.params.treeid$route.params.treeid')
        this.serverData = this.getServerData();
        // this.isTrueTreeLevel();
      },
      '$route' (to, from) {
        if (to.path === '/server') {
          this.getTreeData();
        }
      },
    },
    methods: {
      selectTree(nodeKey, nodeInfo) {
        console.log(nodeInfo);
        if (nodeInfo.children && nodeInfo.children.length) {
          this.$set(nodeInfo, 'expand', !nodeInfo.expand);
          if (nodeInfo.moduleName) {
              // 展示 dcache 模块下的所有服务
            this.$router.push(`/server/1${nodeInfo.pid.substr(1)}.6${nodeInfo.moduleName}/cache`)
            // this.$router.push(`/server/6${nodeInfo.moduleName}/cache`)
          }
        } else {
          // 正常的服务展示, tars 的就是正常的，  只有dcache、router、proxy才有serverType
          let {serverType} = nodeInfo;
          !serverType? serverType='tars':'';
          this.$router.push(`/server/${nodeKey}/manage/${serverType}`);
        }

      },
      // 处理接口返回数据
      handleData(res, isFirstLayer) {
        if (!res || !res.length) return;
        res.forEach((node) => {
          node.label = node.name;  //eslint-disable-line
          node.nodeKey = node.id;  //eslint-disable-line

          // 第一层特殊图标、展开
          if (isFirstLayer) {
            node.iconClass = 'tree-icon';
            node.expand = true;  //eslint-disable-line
          }

          if (node.children && node.children.length) {
            this.handleData(node.children);
          }
        });
      },
      getTreeData() {
        this.treeData = null;

        this.$nextTick(() => {
          const loading = this.$loading.show({
            target: this.$refs.treeLoading,
          });

          this.$ajax.getJSON('/server/api/dtree').then((res) => {
            loading.hide();
            this.treeData = res;
            this.handleData(this.treeData, true);
          }).catch((err) => {
            loading.hide();
            console.error(err)
            this.treeErrMsg = err.err_msg || err.message || '加载失败';
            this.treeData = false;
          });
        });
      },
      getServerData() {
        if (!this.$route.params.treeid) {
          return {};
        }
        const treeArr = this.$route.params.treeid.split('.');
        const serverData = {
          level: 5,
          application: '',
          server_name: '',
          set_name: '',
          set_area: '',
          set_group: '',
        };

        treeArr.forEach((item) => {
          console.log('item', item);
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
            case 6:
              serverData.module_name = name;
              break;
            default:
              break;
          }
          serverData.level = level;
        });

        return serverData;
      },

      clickTab(tabkey) {
        const toPath = this.isServerManage(tabkey);
        const currentPath = this.isServerManage(this.$route.path)
        const path = (toPath && currentPath) ? { path: tabkey, query: { time: Date.now() } } : { path: tabkey, query: {} };
        this.$router.push(Object.assign({}, this.$route, path));
      },

      isServerManage(tabkey) {
        return tabkey.indexOf('/server') > -1 && ( tabkey.indexOf('/manage') > -1 || tabkey.indexOf('/cache') > -1);
      },

      // 有些目录层级不显示某些标签，处理之
      isTrueTreeLevel() {
        const routeArr = this.$route.path.split('/');
        const route = routeArr[routeArr.length - 1];

        // 默认不处理
        let shouldRedirect = false;
        // publish、server-monitor、property-monitor 只有 level 5 可访问
        if (this.serverData.level !== 5 &&
          (route === 'publish' || route === 'server-monitor' || route === 'property-monitor' || route === 'user-manage')) {
          shouldRedirect = true;
        }
        // config 有 level 5、4、1 可访问
        if (this.serverData.level !== 5 && this.serverData.level !== 4 && this.serverData.level !== 1 && route === 'config') {
          shouldRedirect = true;
        }
        // 命中不可访问进行跳转
        if (shouldRedirect) {
          this.$router.replace('manage');
        }
      },
    },
    created() {
      this.serverData = this.getServerData();
      this.isTrueTreeLevel();
    },
    mounted() {
      this.getTreeData();
      window.dcacheIndex = this;

    },
  };
</script>

<style lang="postcss">
  @import '../../assets/css/variable.css';

  .page_server {
    padding-bottom: var(--gap-big);
    padding-top: var(--gap-big);
    display: flex;
    /*目录树*/
    .left-tree {
      flex: 0 0 auto;
      width: 152px;
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
        margin-left: 10px;

        li {
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          white-space: pre;
        }
      }

      & > ul.let-tree__node {
        font-size: 16px;
        margin-bottom: var(--gap-small);
        margin-left: 0;

        & > li > ul.let-tree__node {
          margin-left: 0;

          li .pointer:first-of-type {
            margin-left: 3px;
          }

          li .pointer:first-of-type:empty {
            margin-left: 26px;
          }
        }
      }

      .tree-icon {
        width: 16px;
        height: 16px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%;
        background-image: url('../../assets/img/tree-icon-2.png');
        margin-right: 4px;
        margin-left: 0;
        vertical-align: middle;

        &.down {
          transform: rotate(0);
        }
        &:before {
          content: "";
        }
      }
    }
    /*目录树 end*/

    /*右侧窗口*/
    .right-view {
      flex: 1;
      margin-left: 40px;
      margin-top: -10px;

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
          color: #A2A9B8;
        }
      }
    }

    .page_server_child {
      margin-top: 20px;
      position: relative;
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
    .status-active, .status-off, .status-activating {
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
        width: 70px;
        content: "Activating";
      }
    }
    /*服务状态 end*/

    /*右侧窗口 end*/
  }
</style>
