<template>
  <el-dialog :title="$t('operate.k8s')" :visible.sync="DetailModel.show" width="1060px"
             :before-close="closeDetailModel" v-if="DetailModel.show" top="10px"
             :close-on-click-modal='false'>

    <el-collapse v-model="activeName" accordion @change="HandleClick">
      <el-collapse-item name="0">
        <template slot="title"><b>{{ $t('operate.copyNode') }}</b></template>
        <k8s-manger :k8sModel="k8sModel" :labelMatchArr="labelMatchArr"
                    :LabelMatchOperator="LabelMatchOperator" :mode="'copyNode'"></k8s-manger>
      </el-collapse-item>

      <el-collapse-item name="1">
        <template slot="title"><b>{{ $t('operate.nodeSelect') }}</b></template>
        <k8s-manger :k8sModel="k8sModel" :labelMatchArr="labelMatchArr"
                    :LabelMatchOperator="LabelMatchOperator" :mode="'nodeSelect'"></k8s-manger>
      </el-collapse-item>

      <el-collapse-item name="2">
        <template slot="title"><b>{{ $t('operate.network') }}</b></template>
        <network-mapping :k8sModel="k8sModel">
        </network-mapping>
      </el-collapse-item>

      <el-collapse-item name="3">
        <template slot="title"><b>{{ $t('operate.disk') }}</b></template>
        <disk-manger :k8sModel="k8sModel" :mounts="mounts"></disk-manger>
      </el-collapse-item>

      <el-collapse-item name="4">
        <template slot="title"><b>{{ $t('operate.resource') }}</b></template>
        <resource-manger :sourceModel="sourceModel"></resource-manger>
      </el-collapse-item>

      <el-collapse-item name="6">
        <template slot="title"><b>{{ $t('operate.hpa') }}</b></template>
        <div>
          <hpa-manger :hpaModel="hpaModel" :serverData="serverData" :sourceModel="sourceModel"
                      :indicators="indicators"></hpa-manger>
        </div>
      </el-collapse-item>

      <el-collapse-item name="5">
        <template slot="title"><b>{{ $t('operate.yaml') }}</b></template>
        <k8s-yaml-edit ref="yamlEdit" @flushOthers="show"></k8s-yaml-edit>
      </el-collapse-item>


    </el-collapse>
  </el-dialog>
</template>

<script>
import k8sManger from "./k8s"
import networkMapping from "./networkMapping"
import diskManger from "./disk"
import resourceManger from "./resource"
import hpaManger from "./hpa"
import K8sYamlEdit from "./k8sYamlEdit";

export default {
  name: 'index',
  components: {k8sManger, diskManger, networkMapping, resourceManger, K8sYamlEdit, hpaManger},
  data() {
    return {
      DetailModel: {
        show: false,
      },
      activeName: "0",

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
      mounts: [],
      serverId: ""
    }
  },
  methods: {
    HandleClick(activeName) {
      if (activeName == "5") {
        this.$nextTick(() => {
          this.$refs.yamlEdit.show(this.serverId, "tservers")// 点击yaml编辑自动刷新结构
          this.$refs.yamlEdit.refresh();
        })
      }
    },
    closeDetailModel() {
      this.DetailModel.show = false;
      this.k8sModel = {};
      this.mounts = []
      this.labelMatchArr = [];
      this.sourceModel = {};
      this.serverData = {};
      this.hpaModel = {
        minReplicas: "",
        maxReplicas: "",
        indicatorData: [],
      }
    },
    show(serverId) {
      this.serverId = serverId
      this.DetailModel.show = true;
      this.getDefaultValue();
      this.getServerInfo(serverId);
      this.getHpaInfo(serverId);
      this.$nextTick(() => {
        this.$refs.yamlEdit.show(serverId, "tservers")
      })
    },
    getDefaultValue() {
      let {LabelMatchOperator, indicators} = this
      this.$ajax.getJSON('/k8s/api/default', {}).then((data) => {
        this.defaultObj = data.ServerServantElem
        if (data.LabelMatchOperator) {
          LabelMatchOperator = data.LabelMatchOperator
        }
        if (data.indicators) {
          indicators = data.indicators
        }
        this.LabelMatchOperator = LabelMatchOperator
        this.indicators = indicators
      })
    },
    getServerInfo(serverId) {
      this.$ajax.getJSON('/k8s/api/server_k8s_select', {
        ServerId: serverId,
      }).then((data) => {
        data = data.Data[0];
        this.serverData = data;
        //1.服务信息
        this.sourceModel.ServerId = serverId
        //2.资源信息
        if (data.resources && Object.keys(data.resources).length > 0) {
          if (data.resources.limits) {
            if (data.resources.limits.cpu)
              this.$set(this.sourceModel, "limitCpu", data.resources.limits.cpu.replace(/m/g, ""))
            if (data.resources.limits.memory)
              this.$set(this.sourceModel, "limitMem", data.resources.limits.memory.replace(/m/g, ""))
          }
          if (data.resources.requests) {
            if (data.resources.requests.cpu)
              this.$set(this.sourceModel, "requestCpu", data.resources.requests.cpu.replace(/m/g, ""))
            if (data.resources.requests.memory)
              this.$set(this.sourceModel, "requestMem", data.resources.requests.memory.replace(/m/g, ""))
          }
        }
        //3.k8s信息
        data.showHostPort = false
        if (data && data) {
          let arr = []
          if (data.HostPort && Object.keys(data.HostPort).length > 0) {
            data.showHostPort = true
            // Object -> Array
            data.HostPort.forEach(item => {
              arr.push({
                obj: item.nameRef,
                HostPort: Math.floor(item.port),
              })
            })
            data.HostPortArr = arr
          }
          if (arr.length === 0) {
            this.$ajax.getJSON('/k8s/api/server_adapter_select', {
              ServerId: serverId,
            }).then((retdata) => {
              if (retdata && retdata.Data) {
                retdata.Data.forEach(item => {
                  arr.push({
                    obj: item.Name,
                    HostPort: 0,
                  })
                })
                data.HostPortArr = arr
              }
            })
          }
        }
        data.NodeSelector = data.NodeSelector
        this.labelMatchArr = data.NodeSelector
        this.labelMatchArr.forEach(item => {
          if ("Exists,DoesNotExist".indexOf(item.operator) != -1) {
            item.disableValue = true
          }
        });
        this.k8sModel = data;
        this.mounts = data.mounts.filter(item => item.source.hasOwnProperty("tLocalVolume"))
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },

    getHpaInfo(serverId) {
      //查询hpa
      this.$ajax.getJSON('/k8s/api/get_hpa', {serverId: serverId.toLowerCase().replace(".", "-")}).then((res) => {
        console.log("res:" + JSON.stringify(res, null, 4));
        if (res && Object.keys(res).length > 1) {
          let spec = res.body.spec
          this.$set(this.hpaModel, "minReplicas", spec.minReplicas);
          this.$set(this.hpaModel, "maxReplicas", spec.maxReplicas);
          spec.metrics.forEach((item, index) => {
            let metric = {}
            if (item.type == "Resource") {
              metric.name = item.resource.name;
              if (item.resource.target.type.toLowerCase() == "averagevalue") {
                metric.targetType = "AverageValue"
                metric.value = item.resource.target.averageValue.replace(/m/g, "")
              } else {//平均利用率
                metric.targetType = "AverageUtilization";
                metric.value = item.resource.target.averageUtilization
              }
            }
            if (item.type == "Pods") {
              metric.name = item.pods.metric.name;
              metric.targetType = item.pods.target.type;
              metric.value = item.pods.target.averageValue.replace(/m/g, "")
            }
            if (item.type.toLowerCase() == "object") {
              metric.name = item.object.metric.name;
              if (item.object.target.type.toLowerCase() == "averagevalue") {
                metric.targetType = "AverageValue"
                metric.value = item.object.target.averageValue.replace(/m/g, "")
              }
            }
            this.$set(this.hpaModel.indicatorData, index, metric)
          });

          if (spec.metrics && spec.metrics.length == 0) {
            this.hpaModel.indicatorData.push({
              name: "cpu",
              targetType: "AverageValue",
              value: ""
            })
          }
        } else {
          this.hpaModel.indicatorData.push({
            name: "cpu",
            targetType: "AverageUtilization",
            value: ""
          })
        }
      }).catch((err) => {
        this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
  }
}


</script>
