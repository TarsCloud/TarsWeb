<template>
  <el-dialog
    :title="$t('operate.k8s')"
    :visible.sync="DetailModel.show"
    width="1060px"
    :before-close="closeDetailModel"
    v-if="DetailModel.show"
    top="10px"
    :close-on-click-modal="false"
  >
    <el-collapse v-model="activeName" accordion @change="HandleClick">
      <el-collapse-item name="copyNode">
        <template slot="title"
          ><b>{{ $t("operate.copyNode") }}</b></template
        >
        <replicas
          v-if="k8sModel"
          :replicas="k8sModel.Replicas"
          @saveReplicas="saveReplicas"
        ></replicas>
      </el-collapse-item>

      <el-collapse-item name="pull">
        <template slot="title"
          ><b>{{ $t("operate.pull") }}</b></template
        >
        <pull
          v-if="k8sModel"
          :pull="k8sModel.imagePullPolicy"
          @savePull="savePull"
        ></pull>
      </el-collapse-item>

      <el-collapse-item name="stacked">
        <template slot="title"
          ><b>{{ $t("operate.stacked") }}</b></template
        >
        <stacked
          v-if="k8sModel"
          :notStacked="k8sModel.notStacked"
          @saveStacked="saveStacked"
        ></stacked>
      </el-collapse-item>

      <el-collapse-item name="jobModel">
        <template slot="title"
          ><b>{{ $t("operate.jobModel") }}</b></template
        >
        <jobModel
          v-if="k8sModel"
          :daemonSet="k8sModel.daemonSet"
          @saveJobModel="saveJobModel"
        ></jobModel>
      </el-collapse-item>

      <el-collapse-item name="launcherType">
        <template slot="title"
          ><b>{{ $t("operate.launcherType") }}</b></template
        >
        <launcher-type
          v-if="k8sModel"
          :launcherType="k8sModel.launcherType"
          @saveLauncherType="saveLauncherType"
        ></launcher-type>
      </el-collapse-item>

      <el-collapse-item name="nodeSelect">
        <template slot="title"
          ><b>{{ $t("operate.nodeSelect") }}</b></template
        >
        <abilityAffinity
          v-if="k8sModel"
          :k8sModel="k8sModel"
          :labelMatchArr="labelMatchArr"
          :LabelMatchOperator="LabelMatchOperator"
          @saveAffinity="saveAffinity"
        ></abilityAffinity>
      </el-collapse-item>

      <el-collapse-item name="network">
        <template slot="title"
          ><b>{{ $t("operate.network") }}</b></template
        >
        <network-mapping
          v-if="k8sModel"
          :k8sModel="k8sModel"
          @saveNetwork="saveNetwork"
        >
        </network-mapping>
      </el-collapse-item>

      <el-collapse-item name="disk">
        <template slot="title"
          ><b>{{ $t("operate.disk") }}</b></template
        >
        <disk-manger
          v-if="k8sModel"
          :k8sModel="k8sModel"
          :mounts="mounts"
          @saveDisk="saveDisk"
        ></disk-manger>
      </el-collapse-item>

      <el-collapse-item name="resource">
        <template slot="title"
          ><b>{{ $t("operate.resource") }}</b></template
        >
        <resource-manger
          v-if="k8sModel"
          :sourceModel="sourceModel"
          @saveResource="saveResource"
        ></resource-manger>
      </el-collapse-item>

      <el-collapse-item name="hpa">
        <template slot="title"
          ><b>{{ $t("operate.hpa") }}</b></template
        >
        <div>
          <hpa-manger
            v-if="k8sModel"
            :hpaModel="hpaModel"
            :serverData="serverData"
            :sourceModel="sourceModel"
            :indicators="indicators"
            @saveHpa="saveHpa"
          ></hpa-manger>
        </div>
      </el-collapse-item>

      <el-collapse-item name="yaml">
        <template slot="title"
          ><b>{{ $t("operate.yaml") }}</b></template
        >
        <k8s-yaml-edit ref="yamlEdit" @flushOthers="show"></k8s-yaml-edit>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>

<script>
import replicas from "./replicas";
import pull from "./pull";
import launcherType from "./launcherType";
import stacked from "./stacked";
import jobModel from "./jobModel";

import abilityAffinity from "./abilityAffinity";
import networkMapping from "./networkMapping";
import diskManger from "./disk";
import resourceManger from "./resource";
import hpaManger from "./hpa";
import K8sYamlEdit from "@/components/k8s-yaml-edit";

export default {
  name: "index",
  components: {
    pull,
    launcherType,
    stacked,
    jobModel,
    replicas,
    abilityAffinity,
    diskManger,
    networkMapping,
    resourceManger,
    K8sYamlEdit,
    hpaManger,
  },
  data() {
    return {
      DetailModel: {
        show: false,
      },
      activeName: "copyNode",

      k8sModel: null,
      labelMatchArr: [],
      LabelMatchOperator: [],

      sourceModel: {},
      serverData: {},

      hpaModel: {
        minReplicas: "",
        maxReplicas: "",
        indicatorData: [],
      },
      indicators: [],

      yamlContent: "",
      mounts: [],
      serverId: "",
    };
  },
  methods: {
    HandleClick(activeName) {
      if (activeName == "yaml") {
        this.$nextTick(() => {
          this.$refs.yamlEdit.show(this.serverId, "tservers"); // 点击yaml编辑自动刷新结构
          this.$refs.yamlEdit.refresh();
        });
      }
    },
    saveLauncherType(launcherType) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          launcherType: launcherType,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    savePull(pull) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          pull: pull,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveStacked(notStacked) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          notStacked: notStacked,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveJobModel(daemonSet) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          daemonSet: daemonSet,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveReplicas(Replicas) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          Replicas: Replicas,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveAffinity(data) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update", {
          ServerId: this.serverId,
          abilityAffinity: data.abilityAffinity,
          NodeSelector: data.NodeSelector,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveHpa(data) {
      data = Object.assign(data, { ServerId: this.ServerId });

      this.$ajax
        .postJSON("/k8s/api/create_hpa", data)
        .then((res) => {
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveDisk(mounts) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update_disk", {
          ServerId: this.serverId,
          mounts: mounts,
        })
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    saveResource(sourceModel) {
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update_resource", sourceModel)
        .then((res) => {
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    adapterServerK8S(model) {
      let data = Object.assign({}, model);
      if (data.HostNetwork && data.showHostPort) {
        return this.$message.error(
          `${this.$t("deployService.form.portOrNetWork")}`
        );
      }
      if (data.showHostPort) {
        data.HostPort = [];
        if (data.HostPortArr) {
          data.HostPortArr.forEach((item) => {
            if (item.open) {
              data.HostPort.push({
                NameRef: item.obj,
                Port: Math.floor(item.HostPort),
              });
            }
          });
        }
      }
      return data;
    },
    saveNetwork(k8sModel) {
      const loading = this.$Loading.show();
      let data = this.adapterServerK8S(k8sModel);
      this.$ajax
        .postJSON("/k8s/api/server_k8s_update_network", data)
        .then((res) => {
          loading.hide();
          this.$message.success(`${this.$t("common.success")}`);
        })
        .catch((err) => {
          loading.hide();
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    closeDetailModel() {
      this.DetailModel.show = false;
      this.k8sModel = null;
      this.mounts = [];
      this.labelMatchArr = [];
      this.sourceModel = {};
      this.serverData = {};
      this.hpaModel = {
        minReplicas: "",
        maxReplicas: "",
        indicatorData: [],
      };
    },
    show(serverId) {
      this.serverId = serverId;
      this.DetailModel.show = true;
      this.getDefaultValue();

      this.$nextTick(() => {
        this.getServerInfo(serverId);
        this.getHpaInfo(serverId);
        this.$refs.yamlEdit.show(serverId, "tservers");
      });
    },
    getDefaultValue() {
      let { LabelMatchOperator, indicators } = this;
      this.$ajax.getJSON("/k8s/api/default", {}).then((data) => {
        this.defaultObj = data.ServerServantElem;
        if (data.LabelMatchOperator) {
          LabelMatchOperator = data.LabelMatchOperator;
        }
        if (data.indicators) {
          indicators = data.indicators;
        }
        this.LabelMatchOperator = LabelMatchOperator;
        this.indicators = indicators;
      });
    },
    getServerInfo(serverId) {
      this.$ajax
        .getJSON("/k8s/api/server_k8s_select", {
          ServerId: serverId,
        })
        .then((data) => {
          data = data.Data[0];
          // console.log(data);

          this.serverData = data;
          //1.服务信息
          this.sourceModel.ServerId = serverId;
          //2.资源信息
          if (data.resources && Object.keys(data.resources).length > 0) {
            if (data.resources.limits) {
              if (data.resources.limits.cpu)
                this.$set(
                  this.sourceModel,
                  "limitCpu",
                  data.resources.limits.cpu.replace(/m/g, "")
                );
              if (data.resources.limits.memory)
                this.$set(
                  this.sourceModel,
                  "limitMem",
                  data.resources.limits.memory.replace(/m/g, "")
                );
            }
            if (data.resources.requests) {
              if (data.resources.requests.cpu)
                this.$set(
                  this.sourceModel,
                  "requestCpu",
                  data.resources.requests.cpu.replace(/m/g, "")
                );
              if (data.resources.requests.memory)
                this.$set(
                  this.sourceModel,
                  "requestMem",
                  data.resources.requests.memory.replace(/m/g, "")
                );
            }
          }
          //3.k8s信息
          data.showHostPort = false;
          if (data) {
            data.HostPortArr = [];

            if (data.subType == "tars") {
              data.servants.forEach((item) => {
                let index = data.HostPort.findIndex((value) => {
                  return value.nameRef == item.name;
                });

                data.HostPortArr.push({
                  obj: item.name,
                  HostPort: index != -1 ? data.HostPort[index].port : item.port,
                  open: index != -1,
                });
              });
            } else {
              data.normal.ports.forEach((port) => {
                let index = data.HostPort.findIndex((value) => {
                  return value.port == port.port;
                });

                data.HostPortArr.push({
                  obj: port.name,
                  HostPort: index != -1 ? data.HostPort[index].port : port.port,
                  open: index != -1,
                });
              });
            }

            data.showHostPort =
              data.HostPortArr.findIndex((value) => {
                return value.open;
              }) != -1;
          }

          data.NodeSelector = data.NodeSelector;
          this.labelMatchArr = data.NodeSelector;
          this.labelMatchArr.forEach((item) => {
            if ("Exists,DoesNotExist".indexOf(item.operator) != -1) {
              item.disableValue = true;
            }
          });
          this.k8sModel = data;
          this.mounts = data.mounts.filter((item) =>
            item.source.hasOwnProperty("tLocalVolume")
          );
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    getHpaInfo(serverId) {
      //查询hpa
      this.$ajax
        .getJSON("/k8s/api/get_hpa", {
          serverId: serverId.toLowerCase().replace(".", "-"),
        })
        .then((res) => {
          // console.log("res:" + JSON.stringify(res, null, 4));
          if (res && Object.keys(res).length > 1) {
            let spec = res.body.spec;
            this.$set(this.hpaModel, "minReplicas", spec.minReplicas);
            this.$set(this.hpaModel, "maxReplicas", spec.maxReplicas);
            spec.metrics.forEach((item, index) => {
              let metric = {};
              if (item.type == "Resource") {
                metric.name = item.resource.name;
                if (item.resource.target.type.toLowerCase() == "averagevalue") {
                  metric.targetType = "AverageValue";
                  metric.value = item.resource.target.averageValue.replace(
                    /m/g,
                    ""
                  );
                } else {
                  //平均利用率
                  metric.targetType = "AverageUtilization";
                  metric.value = item.resource.target.averageUtilization;
                }
              }
              if (item.type == "Pods") {
                metric.name = item.pods.metric.name;
                metric.targetType = item.pods.target.type;
                metric.value = item.pods.target.averageValue.replace(/m/g, "");
              }
              if (item.type.toLowerCase() == "object") {
                metric.name = item.object.metric.name;
                if (item.object.target.type.toLowerCase() == "averagevalue") {
                  metric.targetType = "AverageValue";
                  metric.value = item.object.target.averageValue.replace(
                    /m/g,
                    ""
                  );
                }
              }
              this.$set(this.hpaModel.indicatorData, index, metric);
            });

            if (spec.metrics && spec.metrics.length == 0) {
              this.hpaModel.indicatorData.push({
                name: "cpu",
                targetType: "AverageValue",
                value: "",
              });
            }
          } else {
            this.hpaModel.indicatorData.push({
              name: "cpu",
              targetType: "AverageUtilization",
              value: "",
            });
          }
        })
        .catch((err) => {
          this.$message.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
  },
};
</script>
