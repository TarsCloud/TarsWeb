<template>
  <div>
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="480px"
      @submit.native.prevent="save"
    >
      <let-form-item :label="$t('deployService.form.app')" required>
        <let-select
          id="inputApplication"
          v-model="model.application"
          size="small"
          filterable
          :notFoundText="$t('deployService.form.appAdd')"
        >
          <let-option v-for="d in applicationList" :key="d" :value="d">
            {{ d }}
          </let-option>
        </let-select>
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
        <let-table-column title="OBJ">
          <template slot="head" slot-scope="props">
            <span class="required">{{ props.column.title }}</span>
          </template>
          <template slot-scope="props">
            <let-input
              size="small"
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
            </let-select>
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
            <let-radio v-model="props.row.port_type" label="tcp">TCP</let-radio>
            <let-radio v-model="props.row.port_type" label="udp">UDP</let-radio>
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
            <let-radio v-model="props.row.protocol" label="tars"
              >TARS</let-radio
            >
            <let-radio v-model="props.row.protocol" label="not_tars">{{
              $t("serverList.servant.notTARS")
            }}</let-radio>
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
          width="90px"
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
        <let-table-column :title="$t('operate.operates')" width="60px">
          <template slot-scope="props">
            <let-table-operation @click="addAdapter(props.row)">{{
              $t("operate.add")
            }}</let-table-operation>
            <let-table-operation
              v-if="props.$index"
              class="danger"
              @click="model.adapters.splice(props.$index, 1)"
              >{{ $t("operate.delete") }}
            </let-table-operation>
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
  </div>
</template>

<script>
import SetInputer from "@/components/set-inputer";

const types = [
  "tars_cpp",
  "tars_java",
  "tars_php",
  "tars_nodejs",
  "not_tars",
  "tars_go",
];

// const tars_templates = [
//   "tars.tarsregistry",
//   "tars.tarsAdminRegistry",
//   "tars.tarspatch",
//   "tars.tarsnode",
//   "tars.tarsconfig",
//   "tars.tarsnotify",
//   "tars.tarsstat",
//   "tars.tarsquerystat",
//   "tars.tarsproperty",
//   "tars.tarsqueryproperty",
//   "tars.framework-db",
//   "tars.tarslog",
// ];

const getInitialModel = () => ({
  application: "",
  server_name: "",
  server_type: types[0],
  template_name: "",
  node_name: "",
  enable_set: false,
  set_name: "",
  set_area: "",
  set_group: "",
  operator: "",
  developer: "",
  adapters: [
    {
      obj_name: "",
      bind_ip: "",
      port: "",
      port_type: "tcp",
      protocol: "tars",
      thread_num: 5,
      max_connections: 100000,
      queuecap: 50000,
      queuetimeout: 20000,
    },
  ],
});

export default {
  name: "OperationDeploy",
  components: {
    SetInputer,
  },

  data() {
    return {
      types,
      // tars_templates,
      applicationList: [],
      nodeList: [],
      all_templates: [],
      // notars_templates: [],
      templates: [],
      model: getInitialModel(),
      enableLogin: false,
      deployModal: {
        show: false,
        // close: true,
        node_name: "",
        model: {
          patch_id: "",
          patchList: [],
          serverList: [],
        },
      },
      resultModal: {
        show: false,
        resultList: [],
        rowClassName: (rowData) => {
          if (rowData && rowData.row && !rowData.row.rst) {
            return "err-row";
          }
          return "";
        },
      },
    };
  },
  mounted() {
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
        this.all_templates = data;

        this.model.template_name = data[0];
      })
      .catch((err) => {
        this.$tip.error(
          `${this.$t("common.error")}: ${err.message || err.err_msg}`
        );
      });

    this.$watch("props.row.node_name", (val, oldVal) => {
      if (val === oldVal) {
        return;
      }

      this.model.adapters.forEach((d) => {
        d.bind_ip = val; // eslint-disable-line no-param-reassign
      });
    });

    // this.checkDeployLog();
  },

  methods: {
    nodeNameChange(obj) {
      obj.bind_ip = obj.node_name;
    },
    addAdapter(template) {
      this.model.adapters.push(Object.assign({}, template));
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

      this.$confirm(
        this.$t("deployService.form.deployServiceTip"),
        this.$t("common.alert")
      ).then(() => {
        const loading = this.$Loading.show();

        this.$ajax
          .postJSON("/server/api/deploy_server", this.model)
          .then((data) => {
            loading.hide();
            if (data.tars_node_rst && data.tars_node_rst.length) {
              this.showResultModal(data.tars_node_rst);
            } else {
              this.$tip.success(this.$t("deployService.form.ret.success"));
            }
            this.model = getInitialModel();
            this.model.template_name = this.templates[0];
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
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
    save() {
      var application = document
        .querySelector("#inputApplication .let-select__filter__input")
        .value.trim();

      if (this.model.application == "") {
        this.model.application = application;
      }

      let appReg = new RegExp("^[a-zA-Z]([a-zA-Z0-9]+)?$");
      if (
        !this.applicationList.includes(this.model.application) ||
        !appReg.test(this.model.application)
      ) {
        this.$tip.error(`${this.$t("deployService.form.applicationTip")}`);
        return;
      }

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
              this.$tip.error(this.$t("deployService.form.nameTips"));
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
