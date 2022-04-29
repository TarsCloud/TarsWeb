<template>
  <div id="svgs">
    <div v-for="(item, index) in nodeinfos" :key="index">
      <div
        :style="
          index % 2 == 1
            ? 'margin-top: 20px; padding: 10px;  background-color: #EBF2FF'
            : 'margin-top: 20px; padding: 10px;'
        "
      >
        <div :class="'svgs' + index" style="float: left; width: 100%">
          <svg
            width="100%"
            height="600"
            :style="
              index % 2 == 1
                ? 'background-color: #EBF2FF;'
                : 'background-color: #ffffff;'
            "
          >
            <g />
            <rect />
          </svg>
          <div
            :id="'containers' + index"
            class="containers"
            style="width: 85%; height: 500px; display: none"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import dagreD3 from "dagre-d3";
// import * as d3 from "d3";
import opendiv from "./opendiv";
import { detail, func } from "../../api/ajax";

export default {
  name: "svgs",
  components: {
    opendiv: opendiv,
  },
  props: [
    "nodeinfos",
    "serverArrs",
    "funcIds",
    "traceIds",
    "values",
    "dialogVisible1s",
  ],
  data() {
    return {
      obj: [],
      value: [],
      value1: [],
      value2: [],
      res: "",
      rest: "",
      flag: false,
      title: "",
      funcIdss: [],
      traceIdss: [],
      arr1: [],
      flags: [],
      ops: {
        vuescroll: {},
        scrollPanel: {},
        rail: {
          keepShow: true,
        },
        bar: {
          hoverStyle: true,
          onlyShowBarOnScroll: false, //是否只有滚动的时候才显示滚动条
          background: "#9096A3", //滚动条颜色
          "overflow-x": "hidden",
        },
      },
    };
  },

  created() {},
  mounted() {},
  watch: {
    funcIds(val) {
      this.value = [];
      this.flags = [];
      val.forEach((item) => {
        this.flags.push(true);
        this.value.push("");
      });
    },
    nodeinfos(val) {
      //console.log("this.value", this.value);
      this.value = [];
      this.value1 = [];
      //console.log("this.value1", this.value1);
    },
    traceIds(val) {
      this.value = [];
      this.flags = [];
      val.forEach((item) => {
        this.flags.push(true);
        this.value1.push("");
      });
    },
  },

  computed: {},

  methods: {},
};
</script>

<style scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.style1 {
  float: left;
  width: 100%;
}

.style2 {
  float: left;
  width: 100%;
}
</style>
