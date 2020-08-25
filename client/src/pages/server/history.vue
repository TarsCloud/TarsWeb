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
            <a href="javascript:;" @click="historyLink(scope.row.id)">{{ scope.row.server_name }}</a>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.configStatus')">
          <template slot-scope="scope">
            <span :class="scope.row.setting_state === 'active' ? 'status-active' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.currStatus')">
          <template slot-scope="scope">
            <span :class="scope.row.present_state === 'active' ? 'status-active' : scope.row.present_state === 'activating' ? 'status-activating' : 'status-off'"></span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.processID')" prop="process_id"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.version')" prop="patch_version"></let-table-column>
        <let-table-column :title="$t('serverList.table.th.time')">
          <template slot-scope="scope">
            <span style="word-break: break-word">{{handleNoPublishedTime(scope.row.patch_time)}}</span>
          </template>
        </let-table-column>
      </let-table>
      <let-pagination :page="pageNum" @change="gotoPage" :total="total"></let-pagination>
    </div>

    <div class="history_search" v-else>
      <label class="history_search_box">
        <input v-model="historySearchKey" class="history_search_key" type="text" @blur="historySearch" @keydown.enter="historySearch" placeholder="请输入 应用名/服务名/IP地址 搜索" />
      </label>

      <div class="history_list_wrap">
        <div class="history_list_title">最近访问：</div>
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
      if(!curr_page) {
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
        this.serverList = data.rows
        this.serverListShow = true
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`)
      })
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

    updateHistorySearchKey() {
      let { historySearchKey } = this
      let list = this.getLocalStorage('taf_history_key') || []

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
        this.setLocalStorage('taf_history_key', JSON.stringify(list))
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
}
</style>