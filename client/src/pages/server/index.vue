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
      <div class="empty">

        <img class="package" src="@/assets/img/package.png">
        <p class="title">{{$t('index.rightView.title')}}</p>
        <p class="notice" v-html="$t('index.rightView.tips')"></p>
        <p class="title" v-show="deployLog"><let-button @click="showDeployLog">{{$t('index.rightView.log')}}</let-button></p> 
      </div>

      <let-modal :title="$t('index.rightView.log')" v-model="deployModal.show" @on-confirm="doDeployLog" width="500px">
        <let-form ref="deployForm" itemWidth="400px">
            <let-form-item :label="$t('nodes.node_name')" required>
              <let-input
                v-model="deployModal.node_name"
                :placeholder="$t('nodes.nodeNameTips')"
                required
                :required-tip="$t('nodes.nodeNameTips')"
              ></let-input>
            </let-form-item>

        <let-form-item :label="$t('pub.dlg.releaseVersion')">
          <let-select
            v-model="deployModal.model.patch_id"
            required
            :required-tip="$t('pub.dlg.ab')"
          >
            <let-option v-for="d in deployModal.model.patchList" :key="d.id" :value="d.id">
              {{d.id}} | {{d.posttime}} | {{d.comment}}
            </let-option>
          </let-select>
        </let-form-item>
        <br>
        <let-tag>{{$t('deployLog.info')}}</let-tag>
        </let-form> 
      </let-modal>  

      <PublishStatus ref="publishStatus"></PublishStatus>
    </div>

    <div class="right-view" v-else>
      <let-tabs @click="clickTab" :activekey="$route.path">
        <let-tab-pane :tabkey="base + '/manage'" :tab="$t('header.tab.tab1')"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/publish'" :tab="$t('index.rightView.tab.patch')"
          v-if="serverData.level === 5"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/config'"
          :tab="serverData.level === 5 ? $t('index.rightView.tab.serviceConfig') :
                serverData.level === 4 ? $t('index.rightView.tab.setConfig') :
                serverData.level === 1 ? $t('index.rightView.tab.appConfig') : ''"
          v-if="serverData.level === 5 || serverData.level === 4 || serverData.level === 1"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/server-monitor'" :tab="$t('index.rightView.tab.statMonitor')"
          v-if="serverData.level === 5"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/property-monitor'" :tab="$t('index.rightView.tab.propertyMonitor')"
          v-if="serverData.level === 5"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/interface-debuger'" :tab="$t('index.rightView.tab.infDebuger')"
          v-if="serverData.level === 5"></let-tab-pane>
        <let-tab-pane :tabkey="base + '/user-manage'" :tab="$t('index.rightView.tab.privileage')"
                      v-if="serverData.level === 5 && enableAuth"></let-tab-pane>
      </let-tabs>

      <router-view ref="childView" class="page_server_child" :key="$route.params.treeid"></router-view>
    </div>
    
  </div>
</template>

<script>
  import PublishStatus from './publish/status';
export default {
  name: 'Server',
  components: {
      PublishStatus,
    },
  data() {
    return {
      treeErrMsg: '加载失败',
      treeData: null,
      enableAuth: false,
      deployLog: false,
      deployModal: {
        show: false,
        node_name: '',
        model: {
          patch_id: '',
          patchList: [],
          serverList: [], 
        }
      },
      // 当前页面信息
      serverData: {
        level: 5,
        application: '',
        server_name: '',
        set_name: '',
        set_area: '',
        set_group: '',
      },
    };
  },
  computed: {
    base() {
      return `/server/${this.$route.params.treeid}`;
    },
  },
  watch: {
    '$route.params.treeid': function (treeid) { // eslint-disable-line
      this.serverData = this.getServerData();
      this.isTrueTreeLevel();
    },
    '$route' (to, from) {
      if (to.path === '/server') {
        this.getTreeData();
      }
    },
  },
  methods: {
    selectTree(nodeKey) {
      if (this.$route.path === '/server') {
        this.$router.push(`/server/${nodeKey}/manage`);
      } else {
        this.$router.push({ params: { treeid: nodeKey } });
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

        this.$ajax.getJSON('/server/api/tree').then((res) => {
          loading.hide();
          this.treeData = res;
          this.handleData(this.treeData, true);
        }).catch((err) => {
          loading.hide();
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

    clickTab(tabkey) {
      this.$router.push(Object.assign({}, this.$route, {
        path: tabkey,
      }));
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
    checkDeployLog() {
      this.$ajax.getJSON('/server/api/need_deploy_log').then((data) => {
        // console.log(data);
        this.deployLog = data.need;
          }).catch((err) => {
          });
    },  
    getPatchList(application, serverName, currPage, pageSize) {
      return this.$ajax.getJSON('/server/api/server_patch_list', {
        application,
        module_name: serverName,
        curr_page : currPage,
        page_size : pageSize
      });
    },
    showDeployLog() {
      let application = 'tars';
      let server_name = 'tarslog';
      this.deployModal.model = {
        application: application,
        server_name: server_name,
        patch_id: '',
        patchList: [],
      };
      this.getPatchList(application, server_name, 1, 10).then((data) => {
        this.deployModal.model.patchList = data.rows;
        this.deployModal.show = true;
        // window.setTimeout(() => this.deployModal.show = true, 300)
      });      
    },
    doDeployLog() {
      if (this.$refs.deployForm.validate()) {
        this.$ajax.getJSON('/server/api/check_deploy_log', {node_name:this.deployModal.node_name}).then((data) => {
          // console.log(data);

          this.deployModal.model.serverList = data.server;

          this.$refs.publishStatus.savePublishServer(this.deployModal);

        }).catch((err) => {
          this.$tip.error(`${this.$t('deployLog.failed')}: ${err.err_msg || err.message}`);
        });
      }
    },
  },
  created() {
    this.serverData = this.getServerData();
    this.isTrueTreeLevel();
  },
  mounted() {
    this.getTreeData();
    this.checkDeployLog();
    this.$ajax.getJSON('/server/api/is_enable_auth').then((data) => {
      this.enableAuth = data.enableAuth || false;
     }).catch((err)=>{

      });
  },
};
</script>


<style>
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
      content: "Activating";
    }
  }
  /*服务状态 end*/

  /*右侧窗口 end*/
}
</style>
