<template>
  <div class="page_server_publish">
    <!-- 服务列表 -->
    <div v-if="buildList.length > 0">
      <div class="table_head" style="height:50px">
        <h4>
          {{ this.$t("serverList.title.buildList") }}
          <i
            class="icon iconfont el-icon-third-shuaxin"
            style="font-family: iconfont  !important; cursor: pointer"
            @click="getBuildList()"
          ></i>
        </h4>
      </div>
      <div>
        <let-table
          ref="table"
          :data="buildList"
          :empty-msg="$t('common.nodata')"
        >
          <let-table-column
            :title="$t('deployService.form.buildId')"
            prop="Id"
          ></let-table-column>
          <let-table-column
            :title="$t('deployService.form.image')"
            prop="Image"
          ></let-table-column>
          <let-table-column
            :title="$t('deployService.form.phase')"
            prop="Phase"
          ></let-table-column>
          <let-table-column
            :title="$t('deployService.form.message')"
            prop="Message"
          ></let-table-column>
          <let-table-column
            :title="$t('deployService.form.createTime')"
            prop="CreateTime"
          ></let-table-column>
          <let-table-column :title="$t('operate.operates')" width="60px">
            <template slot-scope="scope">
              <let-table-operation
                class="danger"
                @click="deleteBuild(scope.row)"
                >{{ $t("operate.delete") }}</let-table-operation
              >
            </template>
          </let-table-column>
        </let-table>
      </div>
    </div>

    <!-- 服务列表 -->
    <div class="table_head" style="height:50px">
      <h4>
        {{ this.$t("serverList.title.patchList") }}
        <i
          class="icon iconfont el-icon-third-shuaxin"
          style="font-family: iconfont  !important; cursor: pointer"
          @click="getImageList()"
        ></i>
      </h4>
    </div>
    <div>
      <let-button
        style="float:left;margin-right:20px"
        theme="primary"
        size="small"
        @click="showUploadModal"
        >{{ $t("pub.dlg.upload") }}</let-button
      >
      <let-button
        style="float:left;"
        theme="primary"
        size="small"
        @click="showAddImageModal"
        >{{ $t("pub.dlg.image") }}</let-button
      >
      <let-button
        style="float:right;"
        theme="primary"
        size="small"
        @click="openPublishVersionModal"
        >{{ $t("pub.btn.pubk8s") }}</let-button
      >
    </div>
    <br />
    <div>
      <let-table
        ref="table"
        :data="serverList"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column
          :title="$t('deployService.form.id')"
          prop="Id"
        ></let-table-column>
        <let-table-column
          :title="$t('deployService.form.image')"
          prop="Image"
        ></let-table-column>
        <let-table-column
          :title="$t('deployService.form.secret')"
          prop="Secret"
        ></let-table-column>
        <let-table-column :title="$t('deployService.form.currStatus')">
          <template slot-scope="scope">
            <span :class="getState(scope.row.Enabled)"></span>
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('deployService.form.mark')"
          prop="Mark"
        ></let-table-column>
        <let-table-column
          :title="$t('deployService.form.createPerson')"
          prop="CreatePerson"
        ></let-table-column>
        <let-table-column
          :title="$t('deployService.form.createTime')"
          prop="CreateTime"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="60">
          <template slot-scope="scope">
            <let-table-operation @click="removeReleaseItem(scope.row)">{{
              $t("operate.delete")
            }}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
      <div slot="operations" style="overflow:hidden;"></div>
      <!-- 发布服务弹出框 -->
      <let-modal
        v-model="publishModal.show"
        :title="$t('index.rightView.tab.patch')"
        width="880px"
        :footShow="false"
        @close="closePublishModal"
        @on-confirm="savePublishServer"
      >
        <let-form v-if="publishModal.model" ref="publishForm" itemWidth="100%">
          <template>
            <let-form-item :label="$t('pub.dlg.releaseVersion')" required>
              <let-select
                size="small"
                v-model="publishModal.model.Id"
                required
                :required-tip="$t('pub.dlg.ab')"
              >
                <let-option
                  v-for="d in publishModal.model.patchList"
                  :key="d.Id"
                  :value="d.Id"
                >
                  <span v-html="imgCur" v-if="`${d.Enabled}` == 'true'"></span
                  ><span v-else v-html="imgSpace"></span>
                  <span>{{ d.Id }} | {{ d.CreateTime }} | {{ d.Image }}</span>
                </let-option>
              </let-select>
            </let-form-item>
            <let-form-item :label="$t('pub.dlg.nodeImage')" required>
              <let-select
                size="small"
                v-model="publishModal.model.NodeImage"
                required
                :required-tip="$t('pub.dlg.nodeImageTip')"
              >
                <let-option
                  v-for="d in publishModal.model.nodeList"
                  :key="d.Image"
                  :value="d.Image"
                >
                  <span v-html="imgNew" v-if="d.isDefaultTafNode"></span
                  ><span v-else v-html="imgSpace"></span>
                  <span v-html="imgCur" v-if="d.isCurrTafNode"></span
                  ><span v-else v-html="imgSpace"></span>
                  <span>{{ d.Id }} | {{ d.CreateTime }} | {{ d.Image }}</span>
                </let-option>
              </let-select>
            </let-form-item>
            <let-form-item :label="$t('deployService.table.th.replicas')">
              <let-input
                size="small"
                type="number"
                :min="1"
                v-model="publishModal.model.Replicas"
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.table.tips.empty')"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></let-input>
            </let-form-item>
            <let-form-item :label="$t('serverList.servant.comment')">
              <let-input v-model="publishModal.model.EnableMark"></let-input>
              <let-button
                theme="primary"
                size="small"
                class="mt20"
                @click="savePublishServer"
                >{{ $t("common.patch") }}</let-button
              >
            </let-form-item>
          </template>
        </let-form>
      </let-modal>

      <!-- 上传发布包弹出框 -->
      <let-modal
        v-model="uploadModal.show"
        :title="$t('pub.dlg.upload')"
        width="880px"
        :footShow="false"
        @on-cancel="closeUploadModal"
      >
        <let-form
          v-if="uploadModal.model"
          ref="uploadForm"
          itemWidth="100%"
          @submit.native.prevent="uploadPatchPackage"
        >
          <let-form-item :label="$t('pub.dlg.releasePkg')" itemWidth="400px">
            <let-uploader
              :placeholder="$t('pub.dlg.defaultValue')"
              @upload="uploadFile"
              >{{ $t("common.submit") }}
            </let-uploader>
            <span v-if="uploadModal.model.file">{{
              uploadModal.model.file.name
            }}</span>
          </let-form-item>
          <let-form-item :label="$t('deployService.form.serviceType')" required>
            <let-select
              size="small"
              v-model="uploadModal.model.ServerType"
              @change="changeServerType"
              required
              :required-tip="$t('deployService.form.serviceTypeTips')"
            >
              <let-option v-for="d in serverType" :key="d" :value="d">{{
                d
              }}</let-option>
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('deployService.form.baseImage')" required>
            <let-select
              size="small"
              v-model="uploadModal.model.BaseImage"
              @change="changeBaseImage"
              required
              :required-tip="$t('deployService.form.baseImageTips')"
            >
              <let-option
                v-for="d in baseImage"
                :key="d.Name"
                :value="d.Name"
                >{{ d.Name + "(" + d.Mark + ")" }}</let-option
              >
            </let-select>
          </let-form-item>
          <let-form-item
            :label="$t('deployService.form.baseImageRelease')"
            required
          >
            <let-select
              size="small"
              v-model="uploadModal.model.BaseImageRelease"
              required
              :required-tip="$t('deployService.form.baseImageReleaseTips')"
            >
              <let-option
                v-for="d in baseImageRelease"
                :key="d.Image"
                :value="d.Image"
                >{{ d.Image + "(" + (d.Mark || d.Id) + ")" }}</let-option
              >
            </let-select>
          </let-form-item>
          <let-form-item :label="$t('deployService.form.serverTag')">
            <let-input
              type="text"
              size="small"
              v-model.trim="uploadModal.model.ServerTag"
              :placeholder="$t('deployService.form.serverTagTip')"
            >
            </let-input>
          </let-form-item>
          <let-form-item :label="$t('serverList.servant.comment')">
            <let-input
              type="textarea"
              :rows="3"
              v-model="uploadModal.model.comment"
            >
            </let-input>
          </let-form-item>
          <let-button type="submit" theme="primary">{{
            $t("serverList.servant.upload")
          }}</let-button>
        </let-form>
      </let-modal>

      <!-- 增加镜像弹出框 -->
      <let-modal
        v-model="addImageModal.show"
        :title="$t('pub.dlg.image')"
        width="600px"
        :footShow="false"
        @on-cancel="closeAddImageModal"
      >
        <let-form
          v-if="addImageModal.model"
          ref="addImageForm"
          itemWidth="100%"
          @submit.native.prevent="addImage"
        >
          <let-form-item :label="$t('pub.dlg.imageAddress')" required>
            <let-input
              type="text"
              size="small"
              required
              v-model="addImageModal.model.Image"
            >
            </let-input>
          </let-form-item>
          <let-form-item :label="$t('pub.dlg.secret')" required>
            <let-input
              type="text"
              size="small"
              v-model="addImageModal.model.Secret"
            >
            </let-input>
          </let-form-item>
          <let-form-item :label="$t('pub.dlg.mark')">
            <let-input
              type="text"
              size="small"
              v-model="addImageModal.model.Mark"
            >
            </let-input>
          </let-form-item>
          <let-button type="submit" theme="primary">{{
            $t("pub.dlg.add")
          }}</let-button>
        </let-form>
      </let-modal>
    </div>
  </div>
</template>

<script>
import { formatDate } from "@/lib/date";

export default {
  name: "ServerPublish",
  data() {
    return {
      imgNew: '<img class="logo" src="/static/img/new.gif">',
      imgCur: '<img class="logo" src="/static/img/current.gif">',
      imgSpace: '<img class="logo" src="/static/img/space.png">',

      buildList: [], //docker build list
      serverList: [],
      publishModal: {
        show: false,
        model: {
          patchList: [],
          nodeList: [],
        },
      },
      reloadTask: null,
      serverK8S: {},
      serverType: [],
      baseImage: [],
      baseImageRelease: [],
      uploadModal: {
        show: false,
        model: null,
      },
      addImageModal: {
        show: false,
        model: null,
      },
    };
  },
  props: ["treeid"],
  methods: {
    getServerId() {
      return this.treeid;
    },
    getServerType() {
      return this.$ajax.getJSON("/k8s/api/server_list", {
        ServerId: this.getServerId(),
      });
    },
    getDefault() {
      this.$ajax.getJSON("/k8s/api/default").then((data) => {
        this.serverK8S = data.ServerK8S || {};
        this.serverType = data.ServerTypeOptional || [];
      });
    },
    changeServerType() {
      this.$ajax
        .getJSON("/k8s/api/base_image_list", {
          ServerType: this.uploadModal.model.ServerType,
        })
        .then((data) => {
          this.baseImage = data.Data || [];

          this.uploadModal.model.BaseImage = this.baseImage[0].Name;
        });
    },
    changeBaseImage() {
      this.baseImageRelease = this.baseImage.filter((i) => {
        return i.Name == this.uploadModal.model.BaseImage;
      })[0].Release;

      // console.log(this.baseImageRelease[0]);

      this.$set(
        this.uploadModal.model,
        "BaseImageRelease",
        this.baseImageRelease[this.baseImageRelease.length - 1].Image
      );
    },
    // 状态对应class
    getState(state) {
      let result = "";
      switch (`${state}`) {
        case "true":
          result = "status-active";
          break;
      }
      return result;
    },
    formatDate(date, formatter) {
      return formatDate(date, "YYYY-MM-DD HH:mm:ss");
    },
    reloadBuildList() {
      let that = this;

      let allPath = this.$parent.BTabs[0].path;
      let path = allPath.substring(allPath.lastIndexOf("/") + 1);

      if (path === "publish" || !that.reloadTask) {
        that.reloadTask = setTimeout(() => {
          if (that.$parent.treeid == that.getServerId()) {
            that.getBuildList();
          }
          that.reloadBuildList();
        }, 3000);
      }
    },
    getBuildList() {
      // 获取服务列表
      this.$ajax
        .getJSON("/k8s/api/build_list", {
          ServerId: this.getServerId(),
        })
        .then((data) => {
          data.Data.forEach((item) => {
            item.CreateTime = this.formatDate(item.CreateTime);
          });

          this.buildList = data.Data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    deleteBuild(build) {
      this.$confirm(
        this.$t("deployService.form.delete"),
        this.$t("common.alert")
      ).then(() => {
        this.$ajax
          .getJSON("/k8s/api/delete_build", {
            ImageName: build.ImageName,
          })
          .then(() => {
            this.getBuildList();
            this.getImageList();
          })
          .catch((err) => {
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      });
    },
    getImageList() {
      // 获取服务列表
      this.$ajax
        .getJSON("/k8s/api/patch_list", {
          ServerId: this.getServerId(),
        })
        .then((data) => {
          this.getNowImages()
            .then((dataEnabled) => {
              const items = data.Data || [];
              items.forEach((item) => {
                if (item.Id == dataEnabled.Id) {
                  item.Enabled = true;
                }

                item.CreateTime = this.formatDate(item.CreateTime);
              });

              this.serverList = items;
            })
            .catch((err) => {
              this.$confirm(
                err.err_msg ||
                  err.message ||
                  this.$t("serverList.table.msg.fail")
              ).then(() => {
                this.getImageList();
              });
            });
        })
        .catch((err) => {
          this.$confirm(
            err.err_msg || err.message || this.$t("serverList.table.msg.fail")
          ).then(() => {
            this.getImageList();
          });
        });
    },
    async openPublishVersionModal() {
      let ServerId = this.getServerId();
      this.publishModal.model = {
        ServerId,
        Replicas: this.serverK8S.Replicas || 1,
        show: true,
      };
      let patchList = await this.getPatchList(ServerId);
      let k8sData = await this.getK8SData();
      let nowImage = await this.getNowImages();

      let nodeList = await this.getTafNodes(); //获取tafNode所有镜像
      let defaultImage = await this.getNodeImage();
      this.publishModal.model.Replicas =
        k8sData.Data[0].Replicas || this.serverK8S.Replicas || 1;

      patchList.Data.forEach((item) => {
        item.CreateTime = this.formatDate(item.CreateTime);
        if (item.Image == nowImage.Image) {
          item.Enabled = true;
        }
      });
      nodeList.Data.forEach((item) => {
        if (item.Image == nowImage.NodeImage) {
          item.isCurrTafNode = true;
        }
        if (item.Image == defaultImage) {
          item.isDefaultTafNode = true;
        }
      });
      this.publishModal.model.patchList = patchList.Data;
      this.publishModal.model.nodeList = nodeList.Data;
      this.publishModal.show = true;
    },
    async getPatchList(ServerId) {
      return await this.$ajax.getJSON("/k8s/api/patch_list", {
        ServerId,
      });
    },
    async getNowImages() {
      return await this.$ajax.getJSON("/k8s/api/get_now_image", {
        ServerId: this.getServerId(),
      });
    },
    async getK8SData() {
      return await this.$ajax.getJSON("/k8s/api/server_k8s_select", {
        ServerId: this.getServerId(),
      });
    },
    async getTafNodes() {
      return await this.$ajax.getJSON("/k8s/api/image_node_select");
    },
    async getNodeImage() {
      let tfc = await this.$ajax.getJSON("/k8s/api/get_tfc");
      let res = tfc.filter((item) => item.column === "nodeImage.image");
      return res.length == 1 ? res[0].value : "";
    },
    closePublishModal() {
      // 关闭发布弹出框
      this.publishModal.show = false;
      this.publishModal.modal = null;
      this.$refs.publishForm.resetValid();
    },
    savePublishServer() {
      // 发布
      const loading = this.$Loading.show();
      if (this.$refs.publishForm.validate()) {
        loading.hide();
        this.$ajax
          .postJSON("/k8s/api/patch_publish", {
            ServerId: this.publishModal.model.ServerId,
            Id: this.publishModal.model.Id,
            Replicas: this.publishModal.model.Replicas,
            EnableMark: this.publishModal.model.EnableMark,
            NodeImage: this.publishModal.model.NodeImage,
          })
          .then((data) => {
            loading.hide();
            this.getImageList();
            this.closePublishModal();

            this.$tip.success(this.$t("common.success"));
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },
    updateServerInfo(data) {
      this.$ajax.postJSON("/k8s/api/server_update", {
        ServerId: data.ServerId,
        ServerType: data.ServerType,
        ServerMark: data.ServerMark,
      });
    },
    showUploadModal() {
      this.getServerType().then((data) => {
        let ServerId = this.getServerId();
        this.uploadModal.model = {
          ServerId,
          file: null,
          ServerMark: "",
          ServerType: data.Data[0].ServerType,
        };

        this.uploadModal.show = true;
      });
    },
    showAddImageModal() {
      let ServerId = this.getServerId();
      this.addImageModal.model = {
        ServerId,
        Id: "",
        Image: "",
        Secret: "tars-image-secret",
        Mark: "",
      };

      this.addImageModal.show = true;
    },
    closeAddImageModal() {
      // 关闭上传文件弹出框
      this.addImageModal.show = false;
      this.addImageModal.model = null;
      this.$refs.addImageForm.resetValid();
    },
    closeUploadModal() {
      // 关闭上传文件弹出框
      this.uploadModal.show = false;
      this.uploadModal.model = null;
      this.$refs.uploadForm.resetValid();
    },
    removeReleaseItem(d) {
      this.$confirm(
        this.$t("imageService.delete.confirmTips"),
        this.$t("common.alert")
      )
        .then(() => {
          let ServerId = this.getServerId();

          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/k8s/api/image_release_delete", {
              Name: d.Name,
              Id: d.Id,
            })
            .then(() => {
              loading.hide();

              this.getImageList();
            })
            .catch((err) => {
              loading.hide();
              this.$tip.error(
                `${this.$t("common.error")}: ${err.message || err.err_msg}`
              );
            });
        })
        .catch(() => {});
    },
    uploadFile(file) {
      this.uploadModal.model.file = file;
    },
    uploadPatchPackage() {
      let ServerId = this.getServerId();
      // 上传发布包
      if (this.$refs.uploadForm.validate()) {
        const loading = this.$Loading.show();
        const formdata = new FormData();
        let Secret = "";
        let image = this.baseImageRelease.filter(
          (item) => item.Image == this.uploadModal.model.BaseImageRelease
        );
        if (image.length == 1) {
          Secret = image[0].Secret || "";
        }
        formdata.append("ServerId", ServerId);
        formdata.append("ServerType", this.uploadModal.model.ServerType);
        formdata.append("ServerTag", this.uploadModal.model.ServerTag);
        formdata.append("BaseImage", this.uploadModal.model.BaseImageRelease);
        formdata.append("Secret", Secret);
        formdata.append("suse", this.uploadModal.model.file);
        formdata.append("CreateMark", this.uploadModal.model.comment || "");

        this.$ajax
          .postForm("/k8s/api/patch_upload", formdata)
          .then((data) => {
            this.closeUploadModal();

            loading.hide();

            setTimeout(this.getImageList, 1000);
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },
    addImage() {
      let ServerId = this.getServerId();

      // 上传发布包
      if (this.$refs.addImageForm.validate()) {
        const loading = this.$Loading.show();
        const formdata = new FormData();
        formdata.append("Name", ServerId);
        // formdata.append('Id', this.addImageModal.model.Id);
        formdata.append("Image", this.addImageModal.model.Image);
        formdata.append("Secret", this.addImageModal.model.Secret || "");
        formdata.append("Mark", this.addImageModal.model.Mark || "");

        this.$ajax
          .postForm("/k8s/api/image_release_create", formdata)
          .then((data) => {
            this.closeAddImageModal();

            loading.hide();

            setTimeout(this.getImageList, 1000);
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },
    // 处理未发布时间显示
    handleNoPublishedTime(timeStr, noPubTip = this.$t("pub.dlg.unpublished")) {
      if (timeStr === "0000:00:00 00:00:00") {
        return noPubTip;
      }
      return timeStr;
    },
  },
  mounted() {
    this.getImageList();
    this.getDefault();
    this.reloadBuildList();
  },
};
</script>

<style>
@import "../../assets/css/variable.css";

.page_server_publish {
  padding-bottom: 32px;
  .mt20 {
    margin-top: 20px;
  }
  .running {
    color: #3f5ae0;
  }
  .success {
    color: #6accab;
  }
  .stop {
    color: #f56c77;
  }

  .btn_group .let-button + .let-button {
    margin-left: 10px;
  }
  /*服务状态*/
  .status-active,
  .status-off,
  .status-activating {
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
}
</style>
