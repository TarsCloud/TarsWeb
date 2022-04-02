<template>
  <div class="page_operation_approval">
    <el-card style="margin-top: 10px;padding:15px">
      <div>
        <span>{{ $t("deployService.title.baseImage") }}</span>
        <el-button
          style="float: right; margin-bottom: 10px"
          type="primary"
          size="small"
          @click="addItem"
          >{{ $t("imageService.btn.add") }}
        </el-button>
      </div>
      <let-table ref="table" :data="baseLists" :empty-msg="$t('common.nodata')">
        <let-table-column
          :title="$t('imageService.form.SupportedType')"
          prop="SupportedTypeShow"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.Count')"
          prop="Count"
          width="25%"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.Mark')"
          prop="Mark"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.CreateTime')"
          prop="CreateTime"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="180px">
          <template slot-scope="scope">
            <let-table-operation @click="editItem(scope.row)"
              >{{ $t("operate.update") }}
            </let-table-operation>
            <let-table-operation @click="viewItem(scope.row)">{{
              $t("operate.view")
            }}</let-table-operation>
            <let-table-operation @click="removeItem(scope.row)"
              >{{ $t("operate.delete") }}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </el-card>
    <!--taf node 镜像管理-->
    <el-card style="margin-top: 10px;padding:15px">
      <div>
        <span>{{ $t("deployService.title.nodeImage") }}</span>
        <el-button
          style="float: right; margin-bottom: 10px"
          type="primary"
          size="small"
          @click="addNodeImage"
          >{{ $t("imageService.btn.add") }}
        </el-button>
      </div>
      <let-table
        ref="table"
        :data="tafNodeImages"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column title="ID">
          <template slot-scope="scope">
            <span
              :title="$t('releasePackage.default')"
              style="color: green; display: inline-block"
            >
              <i v-if="scope.row.isDefault" class="el-icon-refresh-right"></i>
            </span>
            {{ scope.row.Id }}
          </template>
        </let-table-column>
        <let-table-column
          :title="$t('pub.dlg.imageAddress')"
          prop="Image"
        ></let-table-column>
        <let-table-column
          :title="$t('pub.dlg.mark')"
          prop="Mark"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="180px">
          <template slot-scope="scope">
            <let-table-operation @click="editNodeImage(scope.row)"
              >{{ $t("operate.update") }}
            </let-table-operation>
            <let-table-operation @click="setDefault(scope.row)"
              >{{ $t("operate.default") }}
            </let-table-operation>
            <let-table-operation @click="deleteNodeImage(scope.row)"
              >{{ $t("operate.delete") }}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </el-card>

    <!--基础镜像-->
    <let-modal
      v-model="baseModal.show"
      :title="
        baseModal.isNew
          ? this.$t('dialog.title.add')
          : this.$t('dialog.title.edit')
      "
      width="600px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" inline v-if="baseModal.model">
        <let-form-item
          :label="$t('imageService.form.SupportedType')"
          itemWidth="600px"
          required
        >
          <let-checkbox
            v-for="d in SupportedType"
            :key="d"
            :value="baseModal.model.SupportedType.indexOf(d) > -1"
            @change="SupportedTypeChange(d)"
            >&nbsp;{{ d }}
          </let-checkbox>
        </let-form-item>
        <let-form-item :label="$t('imageService.form.Mark')" required>
          <let-input
            size="small"
            v-model="baseModal.model.Mark"
            :placeholder="$t('imageService.form.Mark')"
          >
          </let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 查看基础进行 -->
    <let-modal
      v-model="releaseListsModal.show"
      :footShow="false"
      :title="this.$t('imageService.title.view')"
      width="80%"
    >
      <br />

      <let-table
        ref="table"
        :data="releaseListsModal.model"
        v-if="releaseListsModal.model"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column
          :title="$t('imageService.form.Image')"
          prop="Image"
          width="40%"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.CreatePerson')"
          prop="CreatePerson"
          width="10%"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.CreateTime')"
          prop="CreateTime"
          width="15%"
        ></let-table-column>
        <let-table-column
          :title="$t('imageService.form.Mark')"
          prop="Mark"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="15%">
          <template slot-scope="scope">
            <let-table-operation @click="editReleaseItem(scope.row)"
              >{{ $t("operate.view") }}
            </let-table-operation>
            <let-table-operation @click="removeReleaseItem(scope.row)"
              >{{ $t("operate.delete") }}
            </let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </let-modal>
    <!-- 添加镜像版本 -->
    <let-modal
      v-model="releaseModal.show"
      :title="
        releaseModal.isNew
          ? this.$t('dialog.title.add')
          : this.$t('dialog.title.edit')
      "
      width="600px"
      @on-confirm="saveReleaseItem"
      @on-cancel="closeReleaseModal"
    >
      <let-form ref="releaseForm" v-if="releaseModal.model">
        <let-form-item :label="$t('imageService.form.Image')" required>
          <let-input
            size="small"
            v-model="releaseModal.model.Image"
            :placeholder="$t('imageService.form.ImageHolder')"
            required
            :required-tip="$t('imageService.form.ImageTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('imageService.form.Secret')">
          <let-input
            size="small"
            v-model="releaseModal.model.Secret"
            :placeholder="$t('imageService.form.SecretTips')"
            required
            :required-tip="$t('imageService.form.SecretTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('imageService.form.Mark')" required>
          <let-input
            size="small"
            v-model="releaseModal.model.Mark"
            :placeholder="$t('imageService.form.Mark')"
          >
          </let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 添加taf node 镜像 -->
    <el-dialog
      :title="
        nodeImageModal.isNew
          ? this.$t('dialog.title.add')
          : this.$t('dialog.title.edit')
      "
      :visible.sync="nodeImageModal.show"
      width="600px"
      :before-close="closeNodeModal"
      :close-on-click-modal="false"
    >
      <el-form
        :model="nodeImageModal.model"
        ref="nodeForm"
        size="small"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="Id" prop="Id">
          <el-input
            v-model="nodeImageModal.model.Id"
            style="width: 80%"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('pub.dlg.imageAddress')" prop="Image">
          <el-input
            v-model="nodeImageModal.model.Image"
            style="width: 80%"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('pub.dlg.mark')" prop="Mark">
          <el-input
            v-model="nodeImageModal.model.Mark"
            style="width: 80%"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeNodeModal">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" @click="saveNodeModal">{{
          $t("common.submit")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "OperationImage",
  data() {
    return {
      //base镜像信息list
      baseLists: [],
      tafNodeImages: [],
      SupportedType: ["cpp", "nodejs", "java-war", "java-jar", "go"],
      //base详细信息(add/update)
      baseModal: {
        show: false,
        model: null,
        isNew: false,
      },
      //base下每个image的release信息
      releaseListsModal: {
        Name: "",
        show: false,
        model: null,
        isNew: false,
      },
      //每个release的修改信息
      releaseModal: {
        Name: "",
        show: false,
        model: null,
        isNew: false,
      },
      //taf node镜像
      nodeImageModal: {
        show: false,
        model: {},
        isNew: false,
      },
      rules: {
        Id: [
          {
            required: true,
            message: `${this.$t("imageService.node.idTip")}`,
            trigger: "blur",
          },
        ],
        Image: [
          {
            required: true,
            message: `${this.$t("imageService.node.imageAddressTip")}`,
            trigger: "blur",
          },
        ],
        Mark: [
          {
            required: true,
            message: `${this.$t("imageService.node.markTip")}`,
            trigger: "blur",
          },
        ],
      },
    };
  },

  mounted() {
    this.fetchData();
    this.getTafNodeList();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();

      return this.$ajax
        .getJSON("/k8s/api/image_select", {})
        .then((data) => {
          loading.hide();
          this.baseLists = data.Data;

          this.baseLists.forEach((image) => {
            image.SupportedTypeShow = image.SupportedType.join(", ");
            image.CreateTime = moment(image.CreateTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          });
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    SupportedTypeChange(val) {
      if (this.baseModal.model.SupportedType.indexOf(val) > -1) {
        this.baseModal.model.SupportedType.splice(
          this.baseModal.model.SupportedType.indexOf(val),
          1
        );
      } else {
        this.baseModal.model.SupportedType.push(val);
      }
    },
    addItem() {
      this.baseModal.model = {
        SupportedType: [],
      };
      this.baseModal.show = true;
      this.baseModal.isNew = true;
    },
    fetchReleaseData(Name) {
      const loading = this.$refs.table.$loading.show();

      return this.$ajax
        .getJSON("/k8s/api/image_release_select", { Name: Name })
        .then((data) => {
          loading.hide();
          this.releaseListsModal.Name = Name;
          this.releaseListsModal.model = data.Data;

          this.releaseListsModal.model.forEach((release) => {
            release.CreateTime = moment(release.CreateTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            release.Name = Name;
          });
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    viewItem(d) {
      this.fetchReleaseData(d.Name).then(() => {
        this.releaseListsModal.show = true;
      });
    },

    editItem(d) {
      this.baseModal.model = d;
      this.baseModal.show = true;
      this.baseModal.isNew = false;
    },
    removeItem(d) {
      const loading = this.$refs.table.$loading.show();
      this.$confirm(
        this.$t("imageService.delete.confirmTips"),
        this.$t("common.alert")
      )
        .then(() => {
          return this.$ajax
            .postJSON("/k8s/api/image_delete", {
              Name: d.Name,
            })
            .then((data) => {
              loading.hide();
              this.fetchData().then(() => {
                this.$tip.success(this.$t("common.success"));
              });
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
    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.baseModal.show = false;
      this.baseModal.model = null;
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.baseModal.model;

        const loading = this.$Loading.show();

        const url = model.Name
          ? "/k8s/api/image_update"
          : "/k8s/api/image_create";

        this.$ajax
          .postJSON(url, model)
          .then(() => {
            loading.hide();
            this.fetchData().then(() => {
              this.baseModal.show = false;
              this.$tip.success(this.$t("common.success"));
            });
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },

    addReleaseItem(Name) {
      this.releaseModal.model = { Name: Name };
      this.releaseModal.show = true;
      this.releaseModal.isNew = true;
    },

    closeReleaseModal() {
      this.$refs.releaseForm.resetValid();
      this.releaseModal.show = false;
      this.releaseModal.model = null;
    },

    editReleaseItem(d) {
      this.releaseModal.model = d;
      this.releaseModal.show = true;
      this.releaseModal.isNew = false;
    },

    removeReleaseItem(d) {
      this.$confirm(
        this.$t("imageService.delete.confirmTips"),
        this.$t("common.alert")
      )
        .then(() => {
          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/k8s/api/image_release_delete", {
              Name: d.Name,
              Id: d.Id,
            })
            .then(() => {
              loading.hide();
              this.fetchReleaseData(d.Name).then(() => {
                this.$tip.success(this.$t("common.success"));
              });
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

    saveReleaseItem() {
      if (this.$refs.releaseForm.validate()) {
        const model = this.releaseModal.model;

        const loading = this.$Loading.show();
        this.$ajax
          .postJSON("/k8s/api/image_release_create", model)
          .then(() => {
            loading.hide();

            this.$tip.success(this.$t("common.success"));

            this.fetchReleaseData(model.Name);

            this.releaseModal.show = false;
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },

    //taf node 镜像操作
    async getTafNodeList() {
      let defaultNodeImage = await this.getDefaultNodeImage();
      this.$ajax
        .getJSON("/k8s/api/image_node_select")
        .then((data) => {
          data.Data.forEach((item) => {
            if (item.Image == defaultNodeImage) {
              item.isDefault = true;
            }
          });
          this.tafNodeImages = data.Data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    async getDefaultNodeImage() {
      let tfc = await this.$ajax.getJSON("/k8s/api/get_tfc");
      let res = tfc.filter((item) => item.column === "nodeImage.image");
      return res.length == 1 ? res[0].value : "";
    },
    setDefault(row) {
      this.$ajax
        .postJSON("/k8s/api/save_tfc_item", {
          column: "nodeImage.image",
          value: row.Image,
        })
        .then((data) => {
          this.getTafNodeList();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    addNodeImage() {
      this.nodeImageModal.show = true;
      this.nodeImageModal.isNew = true;
    },
    editNodeImage(row) {
      this.nodeImageModal.model = Object.assign({}, row);
      this.nodeImageModal.show = true;
      this.nodeImageModal.isNew = false;
    },
    saveNodeModal() {
      this.$refs.nodeForm.validate((valid) => {
        if (valid) {
          this.$ajax
            .postJSON("/k8s/api/image_node_update", this.nodeImageModal.model)
            .then((data) => {
              this.closeNodeModal();
              this.getTafNodeList();
              this.$message.success(`${this.$t("common.success")}`);
            })
            .catch((err) => {
              this.$message.error(
                `${this.$t("common.error")}: ${err.message || err.err_msg}`
              );
            });
        } else {
          return false;
        }
      });
    },
    deleteNodeImage(row) {
      if (row.isDefault) {
        this.$message.warning(`${this.$t("imageService.node.deleteTip")}`);
        return;
      }
      let param = Object.assign({}, row);
      this.$ajax
        .postJSON("/k8s/api/image_node_delete", param)
        .then((data) => {
          this.getTafNodeList();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    closeNodeModal() {
      this.nodeImageModal.show = false;
      this.nodeImageModal.model = {};
      this.$refs.nodeForm.resetFields();
    },
  },
};
</script>

<style scoped>
/deep/ .el-card__header {
  padding: 10px 20px;
}
</style>

<style>
.page_operation_approval {
  pre {
    color: #909fa3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom: 20px;
  }
}
</style>
