<template>
  <div id="svgs">
    <div v-for="(item, index) in nodeinfos" :key="index">
      <div
        :style="
          index % 2 == 1
            ? 'margin-top: 20px; padding: 10px; background-color: #EBF2FF;'
            : 'margin-top: 20px; padding: 10px;'
        "
      >
        <div :class="'svg' + index" style="float: left; width: 100%">
          <let-form
            :inline="true"
            ref="form"
            label-width="auto"
            style="font-size: 16px"
          >
            <let-form-item :label="$t('callChain.allTrackingNumbers')">
              <let-select
                size="small"
                v-model="value2[index]"
                :placeholder="$t('callChain.pleaseSelectTrackingNumber')"
                @change="change2($event, index)"
                clearable
              >
                <let-option
                  v-for="item in traceIds[index]"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </let-option>
              </let-select>
            </let-form-item>

            <let-form-item :label="$t('callChain.method')">
              <let-select
                size="small"
                v-model="value[index]"
                :placeholder="$t('callChain.selectMethod')"
                @change="change1($event, index)"
                clearable
              >
                <let-option
                  v-for="(item, indexss) in funcIdss[index]"
                  :key="indexss"
                  :label="item.label"
                  :value="item.value"
                >
                </let-option>
              </let-select>
            </let-form-item>

            <let-form-item :label="$t('callChain.methodTrackingNumbers')">
              <let-select
                size="small"
                v-model="value1[index]"
                :placeholder="$t('callChain.selectMethodTrackingNumbers')"
                @change="change0($event, index)"
                :disabled="flags[index]"
                clearable
              >
                <let-option
                  v-for="item in traceIdss[index]"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </let-option>
              </let-select>
            </let-form-item>
          </let-form>
          <div style="height: 600px">
            <!-- <vue-scroll :ops="ops" style="width: 100%; height: 100%"> -->
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
            <div :id="'exportModal' + index"
              class="exportModal">
              <let-modal
              title="甘特图"
              v-model="exportModal"   
              width="80%"
              @close="closeModel"
              :footShow="false"
              :closeOnClickBackdrop="true"
            >
              <div
                :id="'container' + index"
                class="container"
                style="width: 1400%; height: 500px"
              ></div>
            </let-modal>
            </div>
            <!-- </vue-scroll> -->
          </div>
        </div>
      </div>
    </div>

    <opendiv
      v-bind:flag="flag"
      v-bind:res="res"
      v-bind:rest="rest"
      v-bind:title="title"
    >
    </opendiv>
  </div>
</template>

<script>
import dagreD3 from "dagre-d3";
import * as d3 from "d3";
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
    "today",
    "surenum",
    "changenum",
  ],
  data() {
    return {
      exportModal: false,
      obj: [],
      objs: [],
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
          background: "#F5F5F5", //滚动条颜色
          opacity: 0.5, //滚动条透明度
          "overflow-x": "hidden",
        },
      },
    };
  },

  created() {},
  mounted() {
    var myDate = new Date();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
      day = "0" + day;
    }
  },
  watch: {
    changenum(val) {
      
        this.exportModal = true;
        console.log("val", val);
        console.log("this.exportModal", this.exportModal);
        console.log("surenum", this.surenum);
        var exportModals = document.getElementsByClassName("exportModal");
        for (let i = 0; i < exportModals.length; i++) {
          console.log("exportModals[i]",exportModals[i]);
          if (exportModals[i].style) {
            exportModals[i].style.display = "none";
            if (exportModals[i].id == `exportModal${this.surenum}`) {
              var exportModal = document.getElementById(`exportModal${i}`);
              exportModal.style.display = "block";
              console.log("exportModal", exportModal)
              console.log("exportModal", exportModal.style);
              console.log("exportModal", exportModal.style.display);
            }
          }
        }
        console.log("exportModals", exportModals);

    },
    funcIds(val) {
      this.value = [];
      this.flags = [];
      val.forEach((item) => {
        this.flags.push(true);
        this.value.push("");
      });

      this.funcIds.forEach((val, index) => {
        this.focus1(index);
      });
    },
    nodeinfos(val) {
      // console.log("val",val);
      // val.forEach((item)=> {
      //   this.exportModal.push(true)
      // })
      this.value = [];
      this.value1 = [];
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

  methods: {
    closeModel() {},
    async change2(val, index) {
      if (!val) {
        return;
      }
      for (var k in this.value2) {
        this.value2[k] = "";
        if (k == index) {
          this.value2[k] = val;
        }
      }
      for (var k in this.value) {
        this.value[k] = "";
      }
      for (var k in this.value1) {
        this.value1[k] = "";
        this.flags[k] = true;
      }
      let res = await this.$ajax.getJSON("/server/api/detail", {
        id: val,
        nowDate: this.today,
      });

      this.title = "TraceIds：" + val;
      this.res = res;
      this.flag = true;
    },
    async change0(val, index) {
      if (!val) {
        return;
      }
      if (Array.isArray(val)) {
        return;
      }
      let name = "";
      for (var k in this.value1) {
        this.value1[k] = "";
        if (k == index) {
          this.value1[k] = val;
        }
      }
      for (var k in this.value2) {
        this.value2[k] = "";
      }
      let res = await this.$ajax.getJSON("/server/api/detail", {
        id: val,
        nowDate: this.today,
      });

      this.title = this.$t("callChain.trackingNumbers") + val;
      this.res = res;
      this.flag = true;
    },
    async change1(val, index) {
      
      if (!val) {
        return;
      }

      let name = "";
      this.funcIdss[index].forEach((v) => {
        if (val == v.value) {
          name = v.label;
        }
      });

      // let objs = {};
      // objs = this.funcIds[index].find((item) => {
      //   return item.value == val;
      // });
      for (var k in this.value2) {
        this.value2[k] = "";
      }

      for (var k in this.value1) {
        this.value1[k] = "";
      }
      for (var k in this.value) {
        this.value[k] = "";
        this.flags[k] = true;
        if (k == index) {
          this.value[k] = val;
          this.flags[index] = false;
        }
      }
      let vals = val.split("-");
      // this.traceIdss[index] = vals

      let res = await this.$ajax.getJSON("/server/api/func", {
        id: vals[0],
        nowDate: this.today,
      });

      this.funcIdss[index].forEach((item) => {
        if (name == item.label) {
          this.traceIdss[index] = item.val;
        }
      });

      this.title = this.$t("callChain.method") + name;
      this.rest = res;
      this.res = res;
      this.flag = true;
    },

    focus1(index) {
      this.funcIdss = [];
      this.funcIds.forEach((item) => {
        this.funcIdss.push([]);
      });
      let val = [];
      this.funcIds[index].forEach(async (item) => {
        let res = await this.$ajax.getJSON("/server/api/func", {
          id: item,
          nowDate: this.today,
        });
        // let res = await func({ id: item, nowDate: this.today });
        let arr = [];

        res.rows.forEach((item) => {
          let obj = {};
          item.forEach((items, i) => {
            obj[res.columns[i].name] = items;
          });
          arr.push(obj);
        });

        arr.forEach((item) => {
          item.vertexes = JSON.parse(item.vertexes);
          item.edges = JSON.parse(item.edges);
          item.funcNames = JSON.parse(item.funcNames);
          // item.traceIds = JSON.parse(item.traceIds);
          item.traceIds = item.traceIds
            .replace("[", "")
            .replace("]", "")
            .replace(/\s/g, "")
            .split(",");
        });

        let tit = "";

        arr[0].funcNames.forEach((item) => {
          if (item.funcName.indexOf(this.values) > -1) {
            tit = item.funcName;
          }
        });

        this.funcIdss[index].push({
          value: item,
          val: arr[0].traceIds,
          label: tit,
        });
        this.obj = {};
        this.objs = {};

        this.funcIdss[index].forEach((item) => {});
        this.funcIdss[index].forEach((item) => {
          if (this.obj[item.label]) {
            this.obj[item.label] += `-${item.value}`;
          } else {
            this.obj[item.label] = item.value;
          }
          if (this.objs[item.label]) {
            this.objs[item.label] = this.objs[item.label].concat(item.val);
          } else {
            this.objs[item.label] = item.val;
          }
          this.arr1 = [];
          this.traceIdss = [];
          for (var k in this.obj) {
            this.arr1.push({ label: k, value: this.obj[k], val: this.objs[k] });
          }

          this.funcIdss[index] = this.arr1;
          this.funcIdss[index].sort((a, b) => {
            return a.label - b.label;
          });
        });
      });
    },
  },
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

.__bar-is-vertical {
  right: -1px !important;
}

.__bar-is-horizontal {
  display: none !important;
}
</style>

