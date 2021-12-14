<template>
  <div class="page_server">
    <div class="left-view">
      <div class="tree_search">
        <el-input
          size="small"
          :placeholder="$t('home.placeholder')"
          v-model="treeSearchKey"
          @keydown.enter.native="filterTextChange"
        >
        </el-input>

        <el-table :data="serviceList" stripe style="width: 100%">
          <el-table-column :label="$t('market.tableNowVersion')" >
            <template slot-scope="props">
              <el-row :gutter="24">
                <el-col :span="4">
                  <el-avatar :size="45" :src="props.row.logo">
                  </el-avatar>
                </el-col>
                <el-col :span="12">
                  <span>
                    <span>{{ props.row.name }}</span>
                    <span style="font-size: 9px">
                      {{
                        "(v" + props.row.defaultVersion + ")"
                      }}</span
                    ><br />
                    <span style="font-size: 9px">{{
                      props.row.create_time
                    }}</span>
                  </span>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="right-view">
          <router-view
            :serviceId="serviceId"
            ref="childView"
          ></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "Market",
  components: {
    
  },
  data() {
    return {
      treeErrMsg: "load failed",
      treeData: null,
      treeSearchKey: "",
      serviceId: "",
      isIconPlay: false,
      serviceList: [],
      total: 0,
      offset: 0,
      limit: 20
    };
  },
  methods: {
    fetchServiceData() {
      let loading = this.$loading({ text: "正在加载数据..." });

      this.$market
        .call("cloud-market", "getServiceInfoList", {
          req: {
            offset: this.offset,
            limit: this.limit,
          },
        })
        .then((data) => {
          loading.close();
          this.serviceList = data.rsp.info;
          this.serviceList.forEach((e) => {
            if (e.valid == 1) {
              e.valid = true;
            }

            e.create_time = moment(e.create_time).format("YYYY-MM-DD HH:mm:ss"); //new Date(e.create_time);
          });
          this.total = data.rsp.total;
        })
        .catch((err) => {
          loading.close();
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },
  created() {
  },
  mounted() {
    this.fetchServiceData();
  },
};
</script>

<style>
@import "../assets/css/variable.css";

.el-icon-third-shuaxin.active {
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
    display: block;
    margin-bottom: 20px;
    position: relative;
  }

  .tree_search_key {
    display: block;
    border: 1px solid #c0c4cc;
    border-radius: 4px;
    color: #222329;
    font-size: 14px;
    padding: 6px 10px;
    box-sizing: border-box;
    width: 100%;
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

}
</style>
