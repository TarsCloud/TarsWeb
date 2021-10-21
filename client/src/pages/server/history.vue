<template>
  <div class="page_server_history">
    <div class="table_wrap" v-if="serverListShow">
      <div class="table_head">
        <h4>{{this.$t('serverList.title.serverList')}}</h4>
      </div>
      <let-table class="dcache" :data="serverList" :empty-msg="$t('common.nodata')" stripe ref="serverListLoading">
        <let-table-column :title="$t('deployService.form.app')" prop="application"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.service')" prop="server_name">
          <template slot-scope="scope">
            <a :href="'/static/logview/logview.html?app=' + [scope.row.application] + '&server_name=' + [scope.row.server_name] + '&node_name='+ [scope.row.node_name]"
               :title="$t('serverList.link.remoteLog')" target="_blank" class="buttonText"> {{scope.row.server_name}} </a>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name" width="200px">
          <template slot-scope="scope">
          <span v-if="scope.row.is_node_ok">
            <a :href="'/static/logview/logview.html?app=' + [scope.row.application] + '&server_name=' + [scope.row.server_name] + '&node_name='+ [scope.row.node_name]"
               :title="$t('serverList.link.nodeLog')" target="_blank" class="buttonText"> {{scope.row.node_name}} </a>
          </span>
            <span v-else style="color: #FF0000">
            {{scope.row.node_name}}{{$t('serverList.link.invalidNode')}}
          </span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.configStatus')">
          <template slot-scope="scope">
            <span v-if="scope.row.setting_state ==='Inactive'" style="color: #FF0000">{{scope.row.setting_state}}</span>
            <span v-else style="color: #49CC8F">{{scope.row.setting_state}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.currStatus')">
          <template slot-scope="scope">
            <span v-if="scope.row.query_ret_code !='0'" style="color: #FF0000">Inactive</span>
            <span v-else-if="scope.row.present_state_in_node==='Active'"
                  style="color: #49CC8F">{{ scope.row.present_state_in_node }}</span>
            <span v-else style="color: #FF0000">{{ scope.row.present_state_in_node }}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.processID')" prop="process_id"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.version')" prop="patch_version"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.time')">
          <template slot-scope="scope">
            <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('operate.operates')" width="300px">
          <template slot-scope="scope">
            <let-table-operation @click="historyLink(scope.row.id)">{{ $t('operate.goto') }}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <let-button theme="primary" size="small" @click="goback" >{{ $t('operate.goback') }}</let-button>
      <let-pagination :page="pageNum" @change="gotoPage" :total="total"></let-pagination>
    </div>

    <div class="history_search" v-else>
      <label class="history_search_box">
        <input v-model="historySearchKey" class="history_search_key" type="text" @blur="historySearch" @keydown.enter="historySearch" :placeholder="$t('home.searchKey')" />
      </label>

      <div class="history_list_wrap">
        <div class="history_list_title">{{$t('home.visited')}}：</div>
        <ul class="history_list">
          <li class="history_item" v-for="item in historySearchList" :key="item">
            <a class="history_link" href="javascript:;" @click="historySearchLink(item)">{{ item }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ServerHistory",
  data() {
    return {
      historySearchKey: '',
      historySearchList: [],
      // 服务列表
      serverList: [],
      serverListShow: false,
      pageNum: 1,
      pageSize: 16,
      total:1,
    };
  },
  mounted() {
    this.updateHistorySearchKey()
  },
  methods: {
    // 切换服务实时状态页码
    gotoPage(num) {
      this.historySearch(num);
    },
    historySearch(curr_page) {
      if(!curr_page || typeof curr_page!="number") {
        curr_page = this.pageNum || 1
      }
      let { historySearchKey } = this

      if(!historySearchKey){
        return
      }

      this.updateHistorySearchKey()

      this.$ajax.getJSON('/server/api/server_search', {
        searchkey: historySearchKey,
        page_size: this.pageSize,
        curr_page,
      }).then((data) => {
        this.pageNum = curr_page
        this.total = Math.ceil(data.count/this.pageSize)
        data.rows.forEach(item => {
          item.present_state_in_node = ""
          item.is_node_ok = true;
          item.query_ret_code = 0;
          item.setting_state = item.setting_state.charAt(0).toUpperCase()+item.setting_state.slice(1);
        })
        this.serverList = data.rows
        this.updateServerState();
        this.serverListShow = true
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`)
      })
    },
    //tarsadmin修改服务实时状态
    updateServerState() {
      if (this.serverList.length != 0) {
        let queryState = this.serverList.map((item) => {
          return {
            application: item.application,
            server_name: item.server_name,
            node_name: item.node_name
          }
        })
        this.$ajax.postJSON('/server/api/server_state', {
          queryState
        }).then((data) => {
          this.serverList.forEach((item) => {
            let serverState = data.filter(app => app.application == item.application && app.server_name == item.server_name & app.node_name == item.node_name);
            item.present_state_in_node = serverState[0].present_state_in_node;
            item.is_node_ok = serverState[0].is_node_ok;
            item.query_ret_code = serverState[0].query_ret_code;
          })
        })
      }
    },

    historySearchLink(key) {
      this.historySearchKey = key
      this.historySearch()
    },

    historyLink(key) {
      this.$nextTick(() => {
        this.$parent.selectTree(key)
        this.$parent.getTreeData()
      })
    },
    goback(){
      this.serverListShow = false;
      this.historySearchKey = "";
    },


    updateHistorySearchKey() {
      let { historySearchKey } = this
      let list = this.getLocalStorage('tars_history_key') || []

      if(historySearchKey){
        if(list && list.length > 0) {
          let arrIndex = -1
          list.forEach((item, index) => {
            if(item === historySearchKey) {
              arrIndex = index
            }
          })
          if(arrIndex !== -1){
            list.splice(arrIndex, 1)
          }
          list.unshift(historySearchKey)
        }else{
          list = [historySearchKey]
        }
        this.historySearchList = list.slice(0, 20)
        this.setLocalStorage('tars_history_key', JSON.stringify(list))
      }else{
        this.historySearchList = list
      }
    },

    // 处理未发布时间显示
    handleNoPublishedTime(timeStr, noPubTip = this.$t('pub.dlg.unpublished')) {
      if (timeStr === '0000:00:00 00:00:00') {
        return noPubTip;
      }
      return timeStr;
    },

    getLocalStorage(key) {
      let result = ''
      if(window.localStorage){
        result = JSON.parse(JSON.parse(localStorage.getItem(key)))
      }
      return result
    },

    setLocalStorage(key, val) {
      let result = ''
      if(window.localStorage){
        result = localStorage.setItem(key, JSON.stringify(val))
      }
      return result
    },
  },
};
</script>
<style lang="postcss">
.page_server_history{
  display:flex;
  flex:1;
  overflow:auto;

  &::-webkit-scrollbar{border-radius:10px;}

  .table_wrap{display:block;padding-right:20px;width:100%;}
  .table_head{margin-bottom:10px;}

  .history_search{display:table;margin:40px auto;max-width:800px;width:100%;}
  .history_search_box{border:1px solid #c0c4cc;border-radius:10px;margin-bottom:20px;padding:10px 15px;display:block;}
  .history_search_key{color:#000;display:block;font-size:16px;width:100%;}

  .history_list_wrap{display:block;padding:0 15px;}
  .history_list_title{color:#000;font-size:16px;}
  .history_list{}
  .history_item{display:block;margin:5px 0;}
  .history_link{color:#3f5ae0;}

  a:link {color: #0000EF}
  a:visited {color: #0000EF}
  a:hover {color: #FF0000}
}
</style>