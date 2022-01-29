<template>
  <div>
    <el-dialog title="安装" :visible.sync="dialogVisible" width="80%">
      <let-form
        ref="form"
        inline
        label-position="top"
        itemWidth="480px"
        v-if="model"
        @submit.native.prevent="next"
      >
        <let-form-item :label="$t('deployService.form.node_name')" required>
          <let-select
            v-model="selectNodeList"
            size="small"
            multiple
            placeholder="请选择"
            @change="nodeChange"
          >
            <let-option
              v-for="item in nodeList"
              :key="item"
              :label="item"
              :value="item"
            >
            </let-option>
          </let-select>
        </let-form-item>
        <br />

        <let-form-item :label="$t('deployService.form.app')" required>
          <let-input
            size="small"
            v-model="model.application"
            :placeholder="$t('deployService.form.appAdd')"
            required
            :required-tip="$t('deployService.form.appTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.applicationTip')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceName')" required>
          <let-input
            size="small"
            v-model="model.server_name"
            :placeholder="$t('deployService.form.serviceFormatTips')"
            required
            :required-tip="$t('deployService.form.serviceTips')"
            pattern="^[a-zA-Z]([a-zA-Z0-9]+)?$"
            :pattern-tip="$t('deployService.form.serviceFormatTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.serviceType')" required>
          <let-select
            size="small"
            v-model="model.server_type"
            required
            :required-tip="$t('deployService.form.serviceTypeTips')"
          >
            <let-option v-for="d in types" :key="d" :value="d">{{
              d
            }}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.template')" required>
          <let-select
            size="small"
            v-model="model.template_name"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in templates" :key="d" :value="d">{{
              d
            }}</let-option>
          </let-select>
        </let-form-item>

        <let-form-item label="SET">
          <SetInputer
            :enabled.sync="model.enable_set"
            :name.sync="model.set_name"
            :area.sync="model.set_area"
            :group.sync="model.set_group"
          ></SetInputer>
        </let-form-item>

        <let-form-item :label="$t('user.op')" v-show="enableLogin">
          <let-input
            size="small"
            v-model="model.operator"
            :placeholder="$t('user.tips.sep')"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('user.dev')" v-show="enableLogin">
          <let-input
            size="small"
            v-model="model.developer"
            :placeholder="$t('user.tips.sep')"
          ></let-input>
        </let-form-item>

        <let-table :data="model.adapters">
          <let-table-column title="OBJ" width="150px">
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                disabled
                v-model="props.row.obj_name"
                :placeholder="$t('deployService.form.placeholder')"
                required
                :required-tip="$t('deployService.form.objTips')"
                pattern="^[a-zA-Z0-9]+$"
                :pattern-tip="$t('deployService.form.placeholder')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.form.node_name')"
            width="180px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                disabled
                v-model="props.row.node_name"
                required
              ></let-input>
              <!--               
              <let-select
                @change="nodeNameChange(props.row)"
                v-model="props.row.node_name"
                size="small"
                required
                filterable
              >
                <let-option v-for="d in nodeList" :key="d" :value="d">
                  {{ d }}
                </let-option>
              </let-select> -->
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.endpoint')"
            width="140px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                v-model="props.row.bind_ip"
                placeholder="IP"
                required
                :required-tip="$t('deployService.table.tips.ip')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.port')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                :max="65535"
                v-model="props.row.port"
                placeholder="0-65535"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.form.portType')"
            width="150px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.port_type" label="tcp"
                >TCP</let-radio
              >
              <let-radio disabled v-model="props.row.port_type" label="udp"
                >UDP</let-radio
              >
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.protocol')"
            width="180px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-radio disabled v-model="props.row.protocol" label="tars"
                >TARS</let-radio
              >
              <let-radio
                disabled
                v-model="props.row.protocol"
                label="not_tars"
                >{{ $t("serverList.servant.notTARS") }}</let-radio
              >
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('deployService.table.th.threads')"
            width="60px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.thread_num"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.servant.connections')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.max_connections"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.capacity')"
            width="90px"
          >
            <template slot="head" slot-scope="props">
              <span class="required">{{ props.column.title }}</span>
            </template>
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.queuecap"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              ></let-input>
            </template>
          </let-table-column>
          <let-table-column
            :title="$t('serverList.table.servant.timeout')"
            width="120px"
          >
            <template slot-scope="props">
              <let-input
                size="small"
                type="number"
                :min="0"
                v-model="props.row.queuetimeout"
              ></let-input>
            </template>
          </let-table-column>
        </let-table>

        <let-button type="button" theme="sub-primary" @click="getAutoPort()"
          >{{ $t("deployService.form.getPort") }}
        </let-button>
        &nbsp;&nbsp; &nbsp;&nbsp;
        <let-button type="submit" theme="primary">{{
          $t("common.submit")
        }}</let-button>
      </let-form>
    </el-dialog>

    <el-dialog
      :title="$t('common.config')"
      :visible.sync="dialogConfigVisible"
      v-if="model"
      width="80%"
      @submit.native.prevent="save"
    >
      <let-form ref="configForm" itemWidth="100%">
        <el-tabs v-model="activeName" type="border-card">
          <el-tab-pane
            v-for="config in model.config"
            :key="config.name"
            :label="config.name"
            :name="config.name"
          >
            <let-form-item :label="$t('cfg.btn.fileName')" required>
              <let-input
                size="small"
                disabled
                v-model="config.name"
                required
              ></let-input>
            </let-form-item>
            <let-form-item :label="$t('cfg.btn.content')" required>
              <let-input
                size="large"
                type="textarea"
                :rows="16"
                v-model="config.content"
                required
              ></let-input>
            </let-form-item>
          </el-tab-pane>
        </el-tabs>
        <br />
        <let-button type="submit" theme="primary">{{
          $t("common.submit")
        }}</let-button>
      </let-form>
    </el-dialog>

    <PublishStatus ref="publishStatus"></PublishStatus>
  </div>
</template>

<script>
import PublishStatus from "@/pages/publish/status";
import SetInputer from "@/components/set-inputer";
import AjaxUtil from "@/lib/ajax";
import jsYaml from "js-yaml";

const types = [
  "tars_cpp",
  "tars_java",
  "tars_php",
  "tars_nodejs",
  "not_tars",
  "tars_go",
];

const getServerType = (lang) => {
  switch (lang) {
    case "cpp":
      return types[0];
    case "java":
      return types[1];
    case "php":
      return types[2];
    case "nodejs":
      return types[3];
    case "go":
      return types[5];
  }
  return types[4];
};

export default {
  name: "Install",
  components: {
    SetInputer,
    PublishStatus,
  },

  data() {
    return {
      dialogVisible: false,
      dialogConfigVisible: false,
      types,
      applicationList: [],
      selectNodeList: [],
      nodeList: [],
      templates: [],
      deployObj: {},
      model: null,
      activeName: null,
      enableLogin: false,
      socket: null,
      k8s: true,
      publishModal: {
        show: false,
        model: null,
        elegant: false,
        eachnum: 1,
      },
    };
  },
  props: ["serviceVersion"],
  mounted() {
    this.k8s = location.pathname == "/k8s.html";
  },
  methods: {
    showInstall() {
      this.dialogVisible = true;
      this.dialogConfigVisible = false;
      this.fetchServiceVersion();
      this.fetchBaseInfo();
    },
    initialModel() {
      if (this.deployObj.config && this.deployObj.config.length > 0) {
        this.activeName = this.deployObj.config[0].name;
      }

      this.model = {
        application: this.deployObj.app,
        server_name: this.deployObj.server,
        server_type: getServerType(this.deployObj.cloud.lang),
        template_name: this.deployObj.template_name || "tars.default",
        enable_set: false,
        profile:'<tars>\n<application>\n<server>\npackageFormat=image\n</server>\n</application>\n</tars>\n',
        set_name: "",
        set_area: "",
        set_group: "",
        operator: "",
        developer: "",
        adapters: [],
        config: this.deployObj.config || [],
      };

      this.nodeChange(this.selectNodeList);
    },
    nodeChange(nodes) {
      this.model.adapters = [];

      nodes.forEach((ip) => {
        this.deployObj.servants.forEach((servant) => {
          this.model.adapters.push({
            obj_name: servant.name,
            bind_ip: ip,
            port: servant.port,
            node_name: ip,
            port_type: servant.isTcp ? "tcp" : "udp",
            protocol: servant.isTars ? "tars" : "not_tars",
            thread_num: servant.thread,
            max_connections: servant.connection,
            queuecap: servant.capacity,
            queuetimeout: 20000,
          });
        });
      });
    },
    fetchBaseInfo() {
      this.$ajax
        .getJSON("/server/api/isEnableLogin")
        .then((data) => {
          this.enableLogin = data.enableLogin || false;
        })
        .catch((err) => {});

      this.$ajax
        .getJSON("/server/api/application_list")
        .then((data) => {
          this.applicationList = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });

      this.$ajax
        .getJSON("/server/api/node_list")
        .then((data) => {
          this.nodeList = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });

      this.$ajax
        .getJSON("/server/api/template_name_list")
        .then((data) => {
          this.templates = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    fetchServiceVersion() {
      const loading = this.$Loading.show();
      new AjaxUtil()
        .getPlain(this.serviceVersion.deploy)
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              this.deployObj = jsYaml.load(content);

              this.initialModel();
              loading.hide();
            });
          }
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },

    deploy() {
      let objNode = [];
      for (var i = 0; i < this.model.adapters.length; i++) {
        var oo =
          this.model.adapters[i].obj_name +
          "-" +
          this.model.adapters[i].node_name;
        if (objNode.indexOf(oo) != -1) {
          this.$tip.error(`${this.$t("deployService.infos.objNodedupErr")}`);
          return;
        } else {
          objNode.push(oo);
        }
      }

      const loading = this.$Loading.show();

      this.$ajax
        .postJSON("/server/api/deploy_server_from_cloud", this.model)
        .then((data) => {
          loading.hide();
          this.transFile(data);
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    getAutoPort() {
      const loading = this.$Loading.show();
      var adapters = this.model.adapters;
      var bindIps = [];
      adapters.forEach((adapter) => {
        bindIps.push(adapter.bind_ip);
      });
      this.$ajax
        .getJSON("/server/api/auto_port", { node_name: bindIps.join(";") })
        .then((data) => {
          loading.hide();
          data.forEach((node, index) => {
            this.$set(adapters[index], "port", String(node.port || ""));
          });
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    next() {
      if (this.selectNodeList.length == 0) {
        this.$tip.error(`${this.$t("deployService.form.nodeListTip")}`);
        return;
      }
      this.dialogVisible = false;

      if (this.activeName) {
        this.dialogConfigVisible = true;
      } else {
        this.save();
      }
    },
    closePublishModal() {
      // // 关闭发布弹出框
      // this.publishModal.show = false;
      // // this.nowVersion = [];
      // this.publishModal.modal = null;
      // this.patchType = "patch";
      // this.$refs.publishForm.resetValid();
    },
    savePublishServer(patchId, serverId) {
      // 发布
      this.publishModal.elegant = this.elegantChecked || false;
      this.publishModal.eachnum = this.eachNum || 1;
      this.publishModal.command = "patch_tars";
      this.publishModal.model = {
        application: this.model.application,
        server_name: this.model.server_name,
        serverList: [],
        patch_id: patchId,
        update_text: "install from cloud",
      };

      serverId.forEach((id) => {
        this.publishModal.model.serverList.push({
          id,
        });
      });

      // console.log(this.publishModal);
      this.$refs.publishStatus.savePublishServer(
        this.publishModal,
        this.closePublishModal
      );
    },
    transFile(data) {
      // console.log(this.deployObj);

      const loading = this.$Loading.show("正在安装中, 请耐心等候...");

      console.log("start", this.deployObj);
      let url = "";
      if (window.location.protocol == "http:") {
        url = `ws://${window.location.host}/upload?app=${this.model.application}&server=${this.model.server_name}&uid=${window.localStorage.localUid}`;
      } else if (window.location.protocol == "https:") {
        url = `wss://${window.location.host}/upload?app=${this.model.application}&server=${this.model.server_name}&uid=${window.localStorage.localUid}`;
      } else {
        console.log("unknown protocol", window.location);
        return;
      }

      // console.log(url);

      let that = this;

      // 实例化socket
      let socket = new WebSocket(url, "upload-protocol");
      // 监听socket连接
      socket.onopen = () => {
        let image = this.serviceVersion.prefix + this.serviceVersion.image;
        // let image = "/static/image.tgz";

        console.log("open websocket, image:", image);

        let Ajax = new AjaxUtil();
        Ajax.getPlain(image)
          .then((response) => {
            const reader = response.body.getReader();

            const stream = new ReadableStream({
              start(controller) {
                socket.send("start");

                function push() {
                  // “done” 是布尔值，value 是 “Uint8Array”
                  reader.read().then(({ done, value }) => {
                    if (done) {
                      socket.send("end");
                      controller.close();
                      return;
                    }

                    // controller.enqueue(value);
                    console.log(socket);

                    if (socket && socket.readyState == 1) {
                      while (true) {
                        if (value.length > 65535) {
                          socket.send(value.subarray(0, 65535));
                          value = value.subarray(65535);
                        } else {
                          socket.send(value);
                          break;
                        }
                      }
                      // socket.send(value);
                    } else {
                      that.$message({
                        message: that.$t("common.error"),
                        type: "error",
                      });
                      controller.close();
                      return;
                    }

                    push();
                  });
                }

                push();
              },
            });
          })
          .catch((err) => {
            that.$message({
              message: `${that.$t("common.error")}: ${err.message ||
                err.err_msg}`,
              type: "error",
            });
          });
      };

      socket.onerror = () => {
        loading.hide();

        console.log("[error] Connection error");
        socket = null;
      };

      socket.close = () => {
        loading.hide();

        console.log("[close] Connection closed cleanly");
      };

      // 监听socket消息
      socket.onmessage = (msg) => {
        loading.hide();

        // console.log("[onmessage] Connection message: ", msg);

        that.dialogConfigVisible = false;

        let rst = JSON.parse(msg.data);

        if (rst.code != 200) {
          that.$message({
            message: `${that.$t("common.error")}`,
            type: "error",
          });
        } else {
          let patchId = rst.data.id;
          let serverId = rst.data.serverIds;
          that.savePublishServer(patchId, serverId);
        }
      };

      // 发送socket消息
      socket.onsend = (data) => {
        socket.send(data);
      };
    },
    save() {
      if (this.$refs.form.validate()) {
        const model = this.model;

        const loading = this.$Loading.show();

        let node_names = [];
        model.adapters.forEach((a) => {
          node_names.push(a.node_name);
        });

        this.$ajax
          .postJSON("/server/api/server_exist", {
            application: model.application,
            server_name: model.server_name,
            node_names: node_names,
          })
          .then((data) => {
            loading.hide();

            if (data) {
              this.$confirm(
                this.$t("deployService.form.overwriteDeployServiceTip"),
                this.$t("common.alert")
              )
                .then(() => {
                  this.deploy();
                })
                .catch(() => {});
            } else {
              this.deploy();
            }
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },
  },
};
</script>

<style>
.set_inputer_item {
  float: left;
  margin-right: 8px;
  width: 126px;
}
</style>
