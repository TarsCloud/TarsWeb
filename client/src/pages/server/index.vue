<template>
  <div class="page_server">
    <div class="left-view">
      <div class="tree_search">
        <input v-model="treeSearchKey" class="tree_search_key" type="text" @blur="treeSearch" @keydown.enter="treeSearch" placeholder="Please Input..." />
      </div>

      <div class="tree_wrap">
        <a href="javascript:;" class="tree_icon iconfont el-icon-third-shuaxin" @click="treeSearch(1)"></a>
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
      </div>
    </div>

    <div class="right-view" v-if="!this.$route.params.treeid">
      <div class="empty" style="width: 300px">

        <img class="package" src="@/assets/img/package.png">
        <p class="title">{{$t('index.rightView.title')}}</p>
        <p class="notice" v-html="$t('index.rightView.tips')"></p>
        <p class="notice">https://github.com/TarsCloud/Tars</p>
      </div>

    </div>

    <div class="right-view" v-else>
      <ul ref="btabs" class="btabs" v-vscroll>
        <li class="btabs_item" :class="{
          'active': item.id === $route.params.treeid
        }" v-for="item in BTabs" :key="item.id">
          <a class="btabs_link" href="javascript:;" @click="clickBTabs($event, item.id)">{{ item.id }}</a>
          <a class="btabs_close" href="javascript:;" @click="closeBTabs(item.id)">关闭</a>
        </li>
      </ul>

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
        <let-tab-pane :tabkey="base + '/user-manage'" :tab="$t('index.rightView.tab.privileage')" v-if="serverData.level === 5 && enableAuth"></let-tab-pane>
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
      treeErrMsg: 'load failed',
      treeData: null,
      treeSearchKey: '',
      enableAuth: false,
      // deployLog: false,

      // 当前页面信息
      serverData: {
        level: 5,
        application: '',
        server_name: '',
        set_name: '',
        set_area: '',
        set_group: '',
      },

      // BTabs
      BTabs: [],

      //
      keepAlive: [],

      // tabs: {
      //   currView: '',
      //   data: [
      //     { title: this.$t('header.tab.tab1'), url: `/server/${this.$route.params.treeid}/manage` },
      //     { title: this.$t('index.rightView.tab.patch'), url: `/server/${this.$route.params.treeid}/publish`, level: 5 },
      //     { title: this.$t('index.rightView.tab.serviceConfig'), url: `/server/${this.$route.params.treeid}/config`, level: 5 },
      //     { title: this.$t('index.rightView.tab.setConfig'), url: `/server/${this.$route.params.treeid}/config`, level: 4 },
      //     { title: this.$t('index.rightView.tab.appConfig'), url: `/server/${this.$route.params.treeid}/config`, level: 1 },
      //     { title: this.$t('index.rightView.tab.statMonitor'), url: `/server/${this.$route.params.treeid}/server-monitor`, level: 5 },
      //     { title: this.$t('index.rightView.tab.propertyMonitor'), url: `/server/${this.$route.params.treeid}/property-monitor`, level: 5 },
      //     { title: this.$t('index.rightView.tab.infDebuger'), url: `/server/${this.$route.params.treeid}/interface-debuger`, level: 5 },
      //     { title: this.$t('index.rightView.tab.privileage'), url: `/server/${this.$route.params.treeid}/user-manage'`, level: 5, auth: this.enableAuth },
      //   ]
      // }
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
  directives: {
    vscroll: {
      componentUpdated(el) {
        let boxEl = el || ''
        let itemEl = el.children || []
        let currEl = ''
        
        itemEl.forEach(item => {
          const iclass = item.getAttribute('class')
          if(iclass.indexOf('active') > -1) {
            currEl = item
          }
        })

        let left = currEl.offsetLeft || 0
        if(currEl.offsetLeft + currEl.offsetWidth > boxEl.scrollLeft) {
          left = currEl.offsetLeft + currEl.offsetWidth - boxEl.offsetWidth
        }
        boxEl.scrollTo(left, 0)
      }
    }
  },
  methods: {
    treeSearch(type) {
      this.getTreeData(this.treeSearchKey, type)
    },
    selectTree(nodeKey) {
      this.selectBTabs(nodeKey)
      
      if (this.$route.path === '/server') {
        this.$router.push(`/server/${nodeKey}/manage`);
      } else {
        if(this.$route.params.treeid !== nodeKey){
          this.$router.push({ params: { treeid: nodeKey } });
        }
      }

      this.checkCurrBTabs()
    },
    // 处理接口返回数据
    handleData(res, isFirstLayer) {
      if (!res || !res.length) return;
      res.forEach((node) => {
        node.label = node.name;  //eslint-disable-line
        node.nodeKey = node.id;  //eslint-disable-line

        // 第一层特殊图标、展开
        // if (isFirstLayer) {
          // node.iconClass = 'tree-icon';
          // node.expand = true;  //eslint-disable-line
        // }

        if(this.treeSearchKey) {
          node.expand = true
        }

        if (node.children && node.children.length) {
          this.handleData(node.children);
        }
      });
    },
    getTreeData(key, type) {
      this.treeData = null;

      this.$nextTick(() => {
        const loading = this.$loading.show({
          target: this.$refs.treeLoading,
        });

        this.$ajax.getJSON('/server/api/tree', {
          searchKey: key || '',
          type,
        }).then((res) => {
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
        (route === 'publish' || route === 'server-monitor' || route === 'property-monitor' || route === 'user-manage' || route === 'interface-debuger')) {
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

    checkBTabs() {
      let { BTabs } = this
      const tabs = this.getSetLocalStorage('tars_tabs')
      if(tabs && tabs.length > 0){
        tabs.forEach(item => {
          BTabs.push({ id: item.id })
        })
      }
    },

    checkCurrBTabs() {
      this.$nextTick(() => {
        let boxEl = this.$refs.btabs || ''
        let itemEl = boxEl.children || []
        let currEl = ''
        
        itemEl.forEach(item => {
          const iclass = item.getAttribute('class')
          if(iclass.indexOf('active') > -1) {
            currEl = item
          }
        })

        let left = currEl.offsetLeft || 0
        if(currEl.offsetLeft + currEl.offsetWidth > boxEl.scrollLeft) {
          left = currEl.offsetLeft + currEl.offsetWidth - boxEl.offsetWidth
        }
        boxEl.scrollTo(left, 0)
      })
    },

    selectBTabs(nodeKey) {
      let { BTabs } = this
      let isBTabTrue = false
      BTabs.forEach(item => {
        if(item.id === nodeKey){
          isBTabTrue = true
        }
      })
      if(!isBTabTrue){
        this.BTabs.push({
          id: nodeKey
        })
      }

      this.setSetLocalStorage('tars_tabs', JSON.stringify(BTabs))
    },

    clickBTabs(e, nodeKey) {
      const { treeid } = this.$route.params
      if(treeid !== nodeKey) {
        this.$router.push({ params: { treeid: nodeKey } })
      }
    },

    closeBTabs(nodeKey) {
      let { BTabs } = this
      let BIndex = 0

      BTabs.forEach((item, index) => {
        if(item.id === nodeKey){
          BIndex = index
        }
      })
      BTabs.splice(BIndex, 1)

      this.setSetLocalStorage('tars_tabs', JSON.stringify(BTabs))

      if(BTabs.length > 0){
        const { treeid } = this.$route.params
        const id = BTabs[BTabs.length - 1].id
        if(treeid !== id) {
          this.$router.push({ params: { treeid: id } })
        }
      }else{
        this.$router.push('/server')
      }
    },

    getSetLocalStorage(key) {
      let result = ''
      if(window.localStorage){
        result = JSON.parse(JSON.parse(localStorage.getItem(key)))
      }
      return result
    },

    setSetLocalStorage(key, val) {
      let result = ''
      if(window.localStorage){
        result = localStorage.setItem(key, JSON.stringify(val))
      }
      return result
    },

  },
  created() {
    this.serverData = this.getServerData();
    this.isTrueTreeLevel();
  },
  mounted() {
    this.checkBTabs();
    this.getTreeData();
    // this.checkDeployLog();
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
  padding-bottom: var(--gap-small);
  padding-top: var(--gap-big);
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;

  /*left-view*/
  .left-view{
    display:flex;
    flex: 1;
    flex-flow: column;
    max-width: 260px;
  }
  /*目录搜索框*/
  .tree_search{display:block;margin-bottom:20px;position:relative;}
  .tree_search_key{display:block;border:1px solid #c0c4cc;border-radius:4px;color:#222329;font-size:14px;padding:6px 10px;box-sizing: border-box;width: 100%;}
  /**/
  .tree_wrap{display:flex;flex:1;overflow:auto;position:relative;}
  .tree_wrap::-webkit-scrollbar{border-radius:10px;}
  .tree_icon{color:#565B66;position:absolute;right:10px;top:10px;}
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
    display: flex;
    flex: 1;
    flex-flow: column;
    margin-left: 40px;
    margin-top: -10px;
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
        color: #A2A9B8;
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
  .page_server_child::-webkit-scrollbar{border-radius:10px;}

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

  .btabs{display:block;overflow-x:auto;position:relative;;white-space:nowrap;}
  .btabs::-webkit-scrollbar{border-radius:10px;height:8px;}
  .btabs:before{border-bottom:1px solid #d7dae0;bottom:0;content:"";left:0;position:absolute;right:0;}
  .btabs_item{border:1px solid #d7dae0;display:inline-block;position:relative;z-index:10}
  .btabs_item + .btabs_item{margin-left:-1px;}
  .btabs_item:first-child{border-top-left-radius:5px;}
  .btabs_item:last-child{border-top-right-radius:5px;}
  .btabs_item.active{background:#3f5ae1;border-color:#3f5ae1}
  .btabs_item.active .btabs_link{color:#fff;}
  .btabs_item.active .btabs_close:before,
  .btabs_item.active .btabs_close:after{border-color:#fff;}
  .btabs_link{color:#9096a3;display:block;font-weight:bold;height:30px;line-height:20px;padding:5px 30px 5px 10px;}
  .btabs_link:hover{color:#222329;}
  .btabs_close{display:block;font-size:0;height:30px;position:absolute;right:0;top:50%;width:30px;z-index:20;-webkit-transform:translateY(-50%);}
  .btabs_close:before,
  .btabs_close:after{border-top:1px solid #9096a3;content:"";height:0;left:50%;position:absolute;top:50%;width:16px;}
  .btabs_close:before{-webkit-transform:translate3d(-50%,-50%,0) rotateZ(-45deg);}
  .btabs_close:after{-webkit-transform:translate3d(-50%,-50%,0) rotateZ(45deg);}

  .btabs_close:hover:before,
  .btabs_close:hover:after{border-color:#222329;}
  .btabs_item.active .btabs_link:hover{color:#d7dae0;}
  .btabs_item.active .btabs_close:hover:before,
  .btabs_item.active .btabs_close:hover:after{border-color:#d7dae0;}
}
</style>
