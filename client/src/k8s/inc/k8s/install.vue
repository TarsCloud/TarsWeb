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
          ref="replicas"
          :install="true"
          :replicas="deployObj.replicas"
          @saveReplicas="saveReplicas"
        ></replicas>
      </el-collapse-item>

      <el-collapse-item name="pull">
        <template slot="title"
          ><b>{{ $t("operate.pull") }}</b></template
        >
        <pull
          ref="pull"
          :install="true"
          :pull="deployObj.imagePullPolicy"
          @savePull="savePull"
        ></pull>
      </el-collapse-item>

      <el-collapse-item name="stacked">
        <template slot="title"
          ><b>{{ $t("operate.stacked") }}</b></template
        >
        <stacked
          ref="stacked"
          :install="true"
          :notStacked="deployObj.notStacked"
          @saveStacked="saveStacked"
        ></stacked>
      </el-collapse-item>

      <el-collapse-item name="launcherType">
        <template slot="title"
          ><b>{{ $t("operate.launcherType") }}</b></template
        >
        <launcher-type
          ref="launcherType"
          :install="true"
          :launcherType="deployObj.launcherType"
          @saveLauncherType="saveLauncherType"
        ></launcher-type>
      </el-collapse-item>
      <el-collapse-item name="jobModel">
        <template slot="title"
          ><b>{{ $t("operate.jobModel") }}</b></template
        >
        <jobModel
          ref="jobModel"
          :install="true"
          v-if="k8sModel"
          :daemonSet="deployObj.daemonSet"
          @saveJobModel="saveJobModel"
        ></jobModel>
      </el-collapse-item>

      <el-collapse-item name="nodeSelect">
        <template slot="title"
          ><b>{{ $t("operate.nodeSelect") }}</b></template
        >
        <abilityAffinity
          ref="affinity"
          :install="true"
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
          ref="network"
          :install="true"
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
          ref="disk"
          :install="true"
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
          ref="resource"
          :install="true"
          :sourceModel="sourceModel"
          @saveResource="saveResource"
        ></resource-manger>
      </el-collapse-item>
      <!-- 
      <el-collapse-item name="6">
        <template slot="title"
          ><b>{{ $t("operate.hpa") }}</b></template
        >
        <div>
          <hpa-manger
            :hpaModel="hpaModel"
            :serverData="serverData"
            :sourceModel="sourceModel"
            :indicators="indicators"
            @saveHpa="saveHpa"
          ></hpa-manger>
        </div>
      </el-collapse-item> -->

      <el-collapse-item name="yaml">
        <template slot="title"
          ><b>{{ $t("operate.yaml") }}</b></template
        >
        <YamlEditor ref="yamlEdit" v-model="yamlContent"></YamlEditor>
      </el-collapse-item>
    </el-collapse>

    <br />
    <let-button type="submit" theme="primary" @click="submit">{{
      $t("common.submit")
    }}</let-button>
  </el-dialog>
</template>

<script>
import jsYaml from "js-yaml";
import pull from "./pull";
import launcherType from "./launcherType";
import stacked from "./stacked";
import jobModel from "./jobModel";
import replicas from "./replicas";
import abilityAffinity from "./abilityAffinity";
import networkMapping from "./networkMapping";
import diskManger from "./disk";
import resourceManger from "./resource";
import hpaManger from "./hpa";
import YamlEditor from "@/components/editor/yaml-editor";

export default {
  name: "install",
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
    YamlEditor,
    hpaManger,
  },
  props: ["deployObj"],
  data() {
    return {
      DetailModel: {
        show: false,
      },
      activeName: "copyNode",
      k8sModel: {},
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
      mounts: this.deployObj.mounts || [],
    };
  },
  methods: {
    HandleClick(activeName) {
      if (activeName == "yaml") {
        this.$nextTick(() => {
          let deployObj = JSON.parse(JSON.stringify(this.deployObj));

          delete deployObj.cloud;
          this.yamlContent = jsYaml.dump(deployObj);

          this.$refs.yamlEdit.refresh();
        });
      }
    },
    show() {
      this.getDefaultValue();

      this.deployObj.repo.id = "";
      this.deployObj.replicas = this.deployObj.replicas || 1;
      this.deployObj.daemonSet = this.deployObj.daemonSet || false;
      this.deployObj.launcherType = this.deployObj.launcherType || "background";
      this.deployObj.notStacked = this.deployObj.notStacked || true;
      this.deployObj.imagePullPolicy =
        this.deployObj.imagePullPolicy || "Always";

      this.k8sModel.abilityAffinity =
        this.deployObj.abilityAffinity || "AppOrServerPreferred";
      this.k8sModel.labelMatchArr = this.deployObj.nodeSelector || [];

      this.k8sModel.HostIpc = this.deployObj.hostIPC || false;
      this.k8sModel.HostNetwork = this.deployObj.hostNetwork || false;
      this.k8sModel.showHostPort = this.deployObj.hostPorts.length > 0;
      this.k8sModel.HostPortArr = [];
      (this.deployObj.servants || []).forEach((h) => {
        let index = this.deployObj.hostPorts.findIndex((value) => {
          return value.name == h.name;
        });

        this.k8sModel.HostPortArr.push({
          obj: h.name,
          HostPort: h.port,
          open: index != -1,
        });
      });

      this.DetailModel.show = true;
    },
    saveLauncherType(launcherType) {
      this.deployObj.launcherType = launcherType;
    },
    savePull(pull) {
      this.deployObj.imagePullPolicy = pull;
    },
    saveStacked(notStacked) {
      this.deployObj.notStacked = notStacked;
    },
    saveReplicas(replicas) {
      this.deployObj.replicas = parseInt(replicas);
    },
    saveJobModel(daemonSet) {
      this.deployObj.daemonSet = daemonSet;
    },
    saveAffinity(data) {
      this.deployObj.abilityAffinity = data.abilityAffinity;
      this.deployObj.nodeSelector = data.NodeSelector;
    },
    saveHpa(data) {},
    saveDisk(mounts) {
      this.deployObj.mounts = mounts;
    },
    saveResource(sourceModel) {
      this.deployObj.resources = sourceModel;
    },
    saveNetwork(data) {
      if (data.HostNetwork && data.showHostPort) {
        return this.$message.error(
          `${this.$t("deployService.form.portOrNetWork")}`
        );
      }
      if (data.showHostPort) {
        this.deployObj.hostPorts = [];
        if (data.HostPortArr) {
          data.HostPortArr.forEach((item) => {
            if (item.open) {
              this.deployObj.hostPorts.push({
                nameRef: item.obj,
                port: Math.floor(item.HostPort),
              });
            }
          });
        }
      }
      this.deployObj.hostIPC = data.HostIpc;
      this.deployObj.hostNetwork = data.HostNetwork;
    },
    submit() {
      // console.log(this.deployObj);
      // let page=["replicas", "pull", "stacked", "launcherType", ""];
      // console.log(this.$refs);
      for (let ref in this.$refs) {
        // console.log(ref);
        if (ref != "yamlEdit") {
          this.$refs[ref].save();
        }
      }

      let obj = jsYaml.load(this.yamlContent);

      this.deployObj = Object.assign(this.deployObj, obj);

      // console.log(this.deployObj);

      this.$emit("doInstall", this.deployObj);
    },
    closeDetailModel() {
      this.DetailModel.show = false;
      this.k8sModel = {};
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
    getDefaultValue() {
      this.$ajax.getJSON("/k8s/api/default", {}).then((data) => {
        this.defaultObj = data.ServerServantElem;
        this.LabelMatchOperator = data.LabelMatchOperator || [];
        this.indicators = data.indicators || [];
      });
    },
  },
};
</script>
