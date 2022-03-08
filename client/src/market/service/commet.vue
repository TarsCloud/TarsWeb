<template>
  <div class="post_commet">
    <div style="margin-bottom:10px">
      <span>
        <el-button size="mini" type="primary" @click="addCommet">{{
          $t("cloud.commet.add")
        }}</el-button>
      </span>
      &nbsp;&nbsp;
      <i
        class="icon iconfont el-icon-third-shuaxin"
        style="font-family: iconfont !important; cursor: pointer"
        @click="getPostListByServiceId()"
      ></i>
    </div>

    <el-table
      :data="data.postList"
      border
      stripe
      :empty-text="$t('common.nodata')"
    >
      <el-table-column
        :label="$t('cloud.commet.user')"
        width="200px"
        prop="posterId"
      >
        <template slot-scope="props">
          <span>
            <i
              v-if="props.row.owner"
              class="el-icon-delete"
              @click="deletePost(props.row.postId)"
            ></i>
            {{ props.row.posterId }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('cloud.commet.title')" show-overflow-tooltip>
        <template slot-scope="props">
          <i
            v-if="props.row.owner"
            class="el-icon-edit"
            @click="editPost(props.row)"
          ></i>
          <el-link @click="openPost(props.row)">
            {{ props.row.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('cloud.commet.createTime')"
        prop="createTime"
        width="200px"
      ></el-table-column>
      <el-table-column
        :label="$t('cloud.commet.replyTime')"
        prop="lastReplyTime"
        width="200px"
      ></el-table-column>
      <el-table-column
        :label="$t('cloud.commet.count')"
        prop="count"
        width="100px"
      ></el-table-column>
    </el-table>

    <br />
    <div style="width: 100%;text-align:center" v-if="data.more">
      <el-button
        icon="el-icon-more"
        @click="getMorePostListByServiceId"
      ></el-button>
    </div>

    <el-dialog
      :title="data.isNew ? 'Post Issue' : 'Edit Issue'"
      :visible.sync="data.dialogVisible"
      width="70%"
      :close="closeDialog"
    >
      <el-form ref="form" :rules="rules" :model="data" label-width="80px">
        <el-form-item
          :label="$t('cloud.commet.title')"
          prop="title"
          required
          v-if="data.mainPostId == ''"
        >
          <el-input placeholder="" v-model="data.title" clearable> </el-input>
        </el-form-item>
        <el-form-item
          :label="$t('cloud.commet.content')"
          prop="content"
          required
        >
          <mavon-editor
            :toolbars="markdownOption"
            v-model="data.content"
            ref="md"
            @change="change"
            style="min-height: 500px"
          />
        </el-form-item>
        <el-form-item>
          <span>
            <el-button @click="data.dialogVisible = false">{{
              $t("common.cancel")
            }}</el-button>
            <el-button type="primary" @click="doPost">{{
              $t("common.submit")
            }}</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      v-if="post.dialogVisible"
      :visible.sync="post.dialogVisible"
      width="70%"
      @close="closeDialog"
    >
      <div>
        <el-card shadow="always" :body-style="{ padding: '20px' }">
          <div slot="header">
            <span>{{ post.post.title }}</span>
            <span style="float:right">
              <span>{{ post.post.posterId }} </span>
              <span style="font-size:9px; color: grey"
                >({{ post.post.createTime }})
              </span>
            </span>
          </div>
          <div class="markdown-body hljs" v-html="post.post.html"></div>
        </el-card>
      </div>
      <el-divider></el-divider>
      <div>
        <el-timeline>
          <el-timeline-item
            placement="top"
            :hide-timestamp="true"
            v-for="p in post.pList"
            :timestamp="p.createTime"
            :key="p.postId"
          >
            <el-card :body-style="{ padding: '20px' }">
              <div slot="header">
                <span>
                  <span>{{ p.posterId }} </span>
                  <span style="font-size:9px; color: grey"
                    >({{ p.createTime }})
                  </span>

                  <span style="float:right" v-if="p.owner">
                    <i class="el-icon-edit" @click="editPost(p)"></i>
                    <i class="el-icon-delete" @click="deletePost(p.postId)"></i>
                  </span>
                </span>
              </div>
              <h4>{{ p.title }}</h4>
              <div class="markdown-body hljs" v-html="p.html"></div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div>
        <el-form ref="replyForm" :rules="rules" :model="replyPost">
          <el-form-item prop="content" required>
            <mavon-editor
              :toolbars="markdownOption"
              v-model="replyPost.content"
              ref="md"
              @change="change"
              style="min-height: 200px"
            />
          </el-form-item>
        </el-form>

        <span>
          <el-button size="mini" @click="post.dialogVisible = false">{{
            $t("common.cancel")
          }}</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="doReplyPost(post.post)"
            >{{ $t("cloud.commet.reply") }}</el-button
          >
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mavonEditor } from "mavon-editor";
import "mavon-editor/dist/css/index.css";
import moment from "moment";

import { marked } from "marked";
import hljs from "highlight.js";
import "@/assets/css/github-markdown-light.css";

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

export default {
  name: "Commet",
  props: ["serviceVersion"],
  components: {
    mavonEditor,
  },
  data() {
    return {
      markdownOption: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: false, // 上角标
        subscript: false, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: false, // 上一步
        redo: false, // 下一步
        trash: false, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: false, // 单双栏模式
        preview: true, // 预览
      },
      limit: 20,
      data: {
        postList: [],
        more: true,
        isNew: true,
        dialogVisible: false,
        postId: "",
        mainPostId: "",
        title: "",
        content: "",
        lastPostId: "",
        k8s: true,
      },
      post: {
        post: null,
        dialogVisible: false,
        lastPostId: "",
        pList: [],
      },
      replyPost: {
        content: "",
      },
      rules: {
        title: [
          {
            required: true,
            message: this.$t("cloud.commet.inputTitle"),
            trigger: "blur",
          },
        ],
        content: [
          {
            required: true,
            message: this.$t("cloud.commet.inputContent"),
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    getServiceId() {
      return this.serviceVersion.group + "." + this.serviceVersion.name;
    },
    closeDialog() {
      console.log("closeDialog");
      this.getPostListByServiceId(false);
      this.post.dialogVisible = false;
      this.post.post = null;
    },
    getMorePostListByServiceId() {
      this.getPostListByServiceId(false, this.data.lastPostId);
    },
    getPostListByServiceId(leader, curLastPostId) {
      let lastPostId = curLastPostId || "";
      let limit =
        this.data.postList.length > 0 ? this.data.postList.length : this.limit;

      this.$cloud
        .call("cloud-commet", "getPostListByServiceId", {
          req: {
            serviceId: this.getServiceId(),
            lastPostId: lastPostId || "",
            limit: limit,
            leader: leader || false,
          },
        })
        .then((data) => {
          if (data.pList.pList.length > 0) {
            this.data.lastPostId =
              data.pList.pList[data.pList.pList.length - 1].postId;
          }

          if (data.pList.pList.length < this.limit) {
            this.data.more = false;
            if (curLastPostId) {
              this.$common.showSucc("No more data~~~");
            }
          }

          data.pList.pList.forEach((e) => {
            e.createTime = moment(e.createTime).format("YYYY-MM-DD HH:mm:ss");
            if (e.lastReplyTime > 0) {
              e.lastReplyTime = moment(e.lastReplyTime).format(
                "YYYY-MM-DD HH:mm:ss"
              );
            } else {
              e.lastReplyTime = "";
            }

            e.owner = e.posterId == window.localStorage.uid;
          });

          if (lastPostId == "") {
            this.data.postList = data.pList.pList;
          } else {
            this.data.postList = this.data.postList.concat(data.pList.pList);
          }
        })
        .catch((err) => {
          this.$common.showCloudError("commetRet", err);
        });
    },
    // 所有操作都会被解析重新渲染
    change(value, render) {
      this.html = render;
    },
    getPostIdListByMainPostId(leader) {
      this.post.lastPostId = "";
      this.$cloud
        .call("cloud-commet", "getPostIdListByMainPostId", {
          req: {
            mainPostId: this.post.post.postId,
            lastPostId: this.post.lastPostId,
            limit: -1,
            leader: leader || false,
          },
        })
        .then((data) => {
          // console.log(data);
          this.post.pList = data.pList.pList;

          this.post.pList.forEach((e) => {
            e.createTime = moment(e.createTime).format("YYYY-MM-DD HH:mm:ss");
            if (e.lastReplyTime > 0) {
              e.lastReplyTime = moment(e.lastReplyTime).format(
                "YYYY-MM-DD HH:mm:ss"
              );
            } else {
              e.lastReplyTime = "";
            }

            e.owner = e.posterId == window.localStorage.uid;
            e.html = marked.parse(e.content);
          });
        })
        .catch((err) => {
          this.$common.showCloudError("commetRet", err);
        });
    },
    editPost(post) {
      this.data.isNew = false;
      this.data.title = post.title;
      this.data.postId = post.postId;
      this.data.mainPostId = post.mainPostId;
      this.data.dialogVisible = true;
      this.$cloud
        .call("cloud-commet", "getPostById", {
          req: {
            id: post.postId,
          },
        })
        .then((data) => {
          this.data.content = data.info.content;
        })
        .catch((err) => {
          this.$common.showCloudError("commetRet", err);
        });
    },
    openPost(post) {
      this.post.post = post;

      this.post.dialogVisible = true;

      this.getPostIdListByMainPostId(false);
    },
    deletePost(postId) {
      this.$confirm(
        this.$t("cloud.commet.deletePost"),
        this.$t("common.alert"),
        {
          confirmButtonText: this.$t("common.submit"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning",
        }
      )
        .then(() => {
          this.$cloud
            .call("cloud-commet", "deletePost", {
              id: {
                id: postId,
              },
            })
            .then((data) => {
              this.$common.showSucc();

              if (this.post.post) {
                this.getPostIdListByMainPostId(true);
              } else {
                this.getPostListByServiceId(true);
              }
            })
            .catch((err) => {
              this.$common.showCloudError("commetRet", err);
            });
        })
        .catch(() => {});
    },
    doPost() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.data.isNew) {
            this.$cloud
              .call("cloud-commet", "doPost", {
                post: {
                  serviceId: this.getServiceId(),
                  title: this.data.title,
                  content: this.data.content,
                },
              })
              .then((data) => {
                this.getPostListByServiceId(true);

                this.data.dialogVisible = false;

                this.$common.showSucc();
              })
              .catch((err) => {
                this.$common.showCloudError("commetRet", err);

                this.data.dialogVisible = false;
              });
          } else {
            this.$cloud
              .call("cloud-commet", "doEditPost", {
                post: {
                  serviceId: this.getServiceId(),
                  postId: this.data.postId,
                  title: this.data.title,
                  content: this.data.content,
                },
              })
              .then((data) => {
                if (this.data.mainPostId == "") {
                  this.getPostListByServiceId(true);
                } else {
                  this.getPostIdListByMainPostId(true);
                }

                this.data.dialogVisible = false;

                this.$common.showSucc();
              })
              .catch((err) => {
                console.log(err);
                this.$common.showCloudError("commetRet", err);

                this.data.dialogVisible = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    addCommet() {
      this.data.dialogVisible = true;
      this.data.title = "";
      this.data.content = "";
      this.data.postId = "";
      this.data.mainPostId = "";
    },
    doReplyPost() {
      this.$refs["replyForm"].validate((valid) => {
        if (valid) {
          this.$cloud
            .call("cloud-commet", "doReplyPost", {
              post: {
                serviceId: this.getServiceId(),
                mainPostId: this.post.post.postId,
                content: this.replyPost.content,
              },
            })
            .then((data) => {
              this.getPostIdListByMainPostId(true);
              this.replyPost.content = "";
              this.$common.showSucc();
            })
            .catch((err) => {
              this.$common.showCloudError("commetRet", err);
            });
        } else {
          return false;
        }
      });
    },
  },
  created() {},
  mounted() {
    this.k8s = location.pathname == "/k8s.html";

    this.getPostListByServiceId(false);
  },
};
</script>

<style type="postcss">
.post_commet {
  .el-timeline-item {
    list-style: none;
  }

  i {
    cursor: pointer;
    margin-right: 5px;
    font-size: 9px;
  }
}
</style>
