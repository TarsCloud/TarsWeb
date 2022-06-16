<template>
  <div class="page_server_history">
    <div class="table_wrap" v-if="serverListShow">
      <div class="table_head">
        <h4>{{ this.$t("serverList.title.serverList") }}</h4>
      </div>
      <let-table :data="serverList" :empty-msg="$t('common.nodata')">
        <let-table-column
          :title="$t('deployService.form.app')"
          prop="ServerApp"
        ></let-table-column>
        <let-table-column
          :title="$t('deployService.form.serviceName')"
          prop="ServerName"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.podName')"
          prop="PodName"
        >
          <template slot-scope="scope">
            <let-table-operation @click="gotoLog(scope.row)">{{
              scope.row.PodName
            }}</let-table-operation>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.podIP')"
          prop="PodIp"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.ip')"
          prop="NodeIp"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.version')"
          prop="ServiceVersion"
        ></let-table-column>
        <let-table-column :title="$t('serverList.table.th.configStatus')">
          <template slot-scope="scope">
            <span :style="getState(scope.row.SettingState)">{{
              scope.row.SettingState
            }}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.currStatus')">
          <template slot-scope="scope">
            <span :style="getState(scope.row.PresentState)">{{
              scope.row.PresentState
            }}</span>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.currMessage')"
          width="80px"
        >
          <template slot-scope="scope">
            <let-tooltip
              class="tooltip"
              placement="top"
              :content="scope.row.PresentMessage || ''"
            >
              <let-table-operation>{{
                scope.row.PresentMessage
              }}</let-table-operation>
            </let-tooltip>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('serverList.table.th.createTime')"
          prop="CreateTime"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="100px">
          <template slot-scope="scope">
            <let-table-operation @click="historyLink(scope.row.id)">{{
              $t("operate.goto")
            }}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>

      <let-button theme="danger" @click="getMore()">{{
        $t("operate.more")
      }}</let-button>
    </div>

    <div class="history_search" v-else>
      <label class="history_search_box">
        <input
          v-model="historySearchKey"
          class="history_search_key"
          type="text"
          @blur="historySearch"
          @keydown.enter="historySearch"
          placeholder="请输入 应用名/服务名/IP地址 搜索"
        />
      </label>

      <div class="history_list_wrap">
        <div class="history_list_title">Last Access：</div>
        <ul class="history_list">
          <li
            class="history_item"
            v-for="item in historySearchList"
            :key="item"
          >
            <a
              class="history_link"
              href="javascript:;"
              @click="historySearchLink(item)"
              >{{ item }}</a
            >
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
      historySearchKey: "",
      historySearchList: [],
      // 服务列表
      serverList: [],
      serverListShow: false,
      continue: null,
    };
  },
  mounted() {
    this.updateHistorySearchKey();
  },
  methods: {
    gotoLog(data) {
      let url = `/logview.html?History=true&NodeIP=${data.NodeIp}&ServerApp=${data.ServerApp}&ServerName=${data.ServerName}&PodName=${data.PodName}`;
      window.open(url);
    },
    // 状态对应class
    getState(state) {
      let result = state;
      switch (`${state}`) {
        case "Active":
          result = "color: green";
          break;
        case "Inactive":
        case "Activating":
        case "Deactivating":
        case "Unknown":
          result = "color: red";
          break;
      }

      return result;
    },
    getMore() {
      this.historySearch(this.continue);
    },
    historySearch(c) {
      // if(!curr_page) {
      //   curr_page = this.pageNum || 1
      // }
      let { historySearchKey } = this;

      if (!historySearchKey) {
        return;
      }

      this.updateHistorySearchKey();

      this.$ajax
        .getJSON("/k8s/api/server_search", {
          searchkey: historySearchKey,
          continue: c,
        })
        .then((data) => {
          this.continue = data.continue;
          this.serverList = data.rows;
          this.serverListShow = true;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    historySearchLink(key) {
      this.historySearchKey = key;
      this.historySearch();
    },

    historyLink(key) {
      this.$nextTick(() => {
        this.$parent.selectTree(key);
        this.$parent.getTreeData();
      });
    },

    updateHistorySearchKey() {
      let { historySearchKey } = this;
      let list = this.getLocalStorage("taf_history_key") || [];

      if (historySearchKey) {
        if (list && list.length > 0) {
          let arrIndex = -1;
          list.forEach((item, index) => {
            if (item === historySearchKey) {
              arrIndex = index;
            }
          });
          if (arrIndex !== -1) {
            list.splice(arrIndex, 1);
          }
          list.unshift(historySearchKey);
        } else {
          list = [historySearchKey];
        }
        this.historySearchList = list.slice(0, 20);
        this.setLocalStorage("taf_history_key", JSON.stringify(list));
      } else {
        this.historySearchList = list;
      }
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
};
</script>
<style lang="postcss">
.page_server_history {
  display: flex;
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    border-radius: 10px;
  }

  .table_wrap {
    display: block;
    padding-right: 20px;
    width: 100%;
  }
  .table_head {
    margin-bottom: 10px;
  }

  .history_search {
    display: table;
    margin: 40px auto;
    max-width: 800px;
    width: 100%;
  }
  .history_search_box {
    border: 1px solid #c0c4cc;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 10px 15px;
    display: block;
  }
  .history_search_key {
    color: #000;
    display: block;
    font-size: 16px;
    width: 100%;
  }

  .history_list_wrap {
    display: block;
    padding: 0 15px;
  }
  .history_list_title {
    color: #000;
    font-size: 16px;
  }
  .history_list {
  }
  .history_item {
    display: block;
    margin: 5px 0;
  }
  .history_link {
    color: #3f5ae0;
  }

  a:link {
    color: #0000ef;
  }
  a:visited {
    color: #0000ef;
  }
  a:hover {
    color: #ff0000;
  }
}
</style>
