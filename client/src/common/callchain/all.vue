<!-- 调用链明细 -->
<template>
  <div class="all">
    <div>
      <let-form size="small" inline>
        <let-form-item :label="$t('callChain.date')">
          <let-date-picker
            v-model="today"
            style="width: 200px"
          ></let-date-picker>
        </let-form-item>
        <let-form-item :label="$t('callChain.btime')">
          <let-time-picker
            v-model="dateTime[0]"
            style="width: 200px"
          ></let-time-picker>
        </let-form-item>
        <let-form-item :label="$t('callChain.etime')">
          <let-time-picker
            v-model="dateTime[1]"
            style="width: 200px"
          ></let-time-picker>
        </let-form-item>
        <let-form-item>
          <let-button
            theme="primary"
            style="margin-left: 10px; margin-bottom: 2px"
            @click="sub"
          >
            {{ $t("callChain.sub") }}
          </let-button>
        </let-form-item>
      </let-form>
    </div>
    <div style="height: 500px;">
      <div class="block">
        <let-pagination
          :total="total % fsize ? parseInt(total / fsize) + 1 : total / fsize"
          :page="currentPage"
          size="small"
          no-border
          show-sums
          :sum="total"
          jump
          @change="handleCurrentChange"
        >
        </let-pagination>
      </div>
      <vue-scroll :ops="ops" style="width: 100%; height: 100%;margin-top: 5px">
        <let-table
          :data="dataarrs"
          :stripe="true"
          :empty-msg="$t('callChain.noResult')"
          border="true"
          style="width: 100%; height: 580px"
          :sortable="true"
          ref="detailsTable"
        >
          <let-table-column prop="name" title="ID"></let-table-column>
          <let-table-column
            prop="timeStamp"
            :title="$t('callChain.btime')"
            width="15%"
          >
            <template slot-scope="scope">{{ scope.row.startTime }}</template>
          </let-table-column>
          <let-table-column
            prop="timeFrame"
            :title="$t('callChain.etime')"
            width="15%"
          >
            <template slot-scope="scope">{{ scope.row.endTime }}</template>
          </let-table-column>
          <let-table-column
            prop="timeFrame"
            :title="$t('callChain.allTime')"
            width="10%"
          >
            <template slot-scope="scope"> {{ scope.row.callTime }}ms</template>
          </let-table-column>
          <let-table-column
            align="center"
            :title="$t('callChain.operation')"
            width="10%"
          >
            <template slot-scope="scope">
              <let-table-operation @click="handleEdit(scope.row)">{{
                $t("callChain.detail")
              }}</let-table-operation>
            </template>
          </let-table-column>
        </let-table>
      </vue-scroll>
      <let-modal
        v-model="dialogVisible1s"
        width="90%"
        style="height: 1200px;top:-120px"
        :footShow="false"
      >
        <div style="height: 800px">
          <vue-scroll :ops="ops" style="width: 100%; height: 100%">
            <gantt-chart
              v-bind:nodeinfos="nodeinfos"
              v-bind:serverArrs="serverArrs"
              v-bind:edges="edges"
              v-bind:traceIds="traceIds"
              v-bind:funcIds="funcIds"
              v-bind:values="value"
              v-bind:dialogVisible1s="dialogVisible1s"
            >
            </gantt-chart>
          </vue-scroll>
        </div>
      </let-modal>
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
import ganttChart from "./gantt-chart";
import opendiv from "./opendiv";
import moment from "moment";
import { getAll, unique, transTree, transTree1 } from "../../api/util";

export default {
  components: { ganttChart, opendiv: opendiv },
  data() {
    let k8s = location.pathname == "/k8s.html";

    return {
      dialogVisible1s: false,
      form: {},
      flag: false,
      k8s,
      res: "",
      rest: "",
      title: "",
      flags: false,
      vname: "",
      options: [],
      resdata: [],
      restdata: [],
      value: "",
      serverArrs: [],
      datalist: [],
      dataLists: [],
      dataarr: [],
      traceIds: [],
      nodeinfos: [],
      edges: [],
      funcIds: [],
      begin: "",
      value1: "",
      today: "",
      dateTime: ["", ""],
      fsize: 10,
      currentPage: 1,
      total: 0,
      dataarrs: [],
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
  mounted() {
    let startTime = new Date().setHours(0, 0, 0, 0);
    let endTime = new Date().setHours(23, 59, 59, 999);
    this.value1 = [startTime, endTime];
    var myDate = new Date();
    let month = myDate.getMonth() + 1;
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    let day = myDate.getDate();
    if (day >= 1 && day <= 9) {
      day = "0" + day;
    }
    this.today = myDate.getFullYear() + "-" + month + "-" + day;
    this.dateTime = ["00:00", "23:59"];
    this.vname =
      this.$store.state.name.name.application +
      "." +
      this.$store.state.name.name.server_name;
    this.sub();
  },
  methods: {
    handleCurrentChange(val) {
      this.currentPage = val;
      let beg = (this.currentPage - 1) * this.fsize;
      let end = beg + this.fsize;
      this.dataarrs = this.dataarr.slice(beg, end);
    },
    fortime(value) {
      let date = new Date(value);
      value = value + "";
      let str = value.substring(value.length - 3);
      return `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${str}`;
    },
    async sub() {
      this.form.label = this.vname;
      if (!this.dateTime[0]) {
        this.$Notice({
          message: this.$t("callChain.sbtime"),
          type: "warning",
        });

        return;
      }
      if (!this.dateTime[1]) {
        this.$Notice({
          message: this.$t("callChain.setime"),
          type: "warning",
        });

        return;
      }
      this.form.stime = `${this.today} ${this.dateTime[0]}`;
      this.form.etime = `${this.today} ${this.dateTime[1]}`;
      this.form.stime = new Date(this.form.stime).getTime();
      this.form.etime = new Date(this.form.etime).getTime();
      this.form.nowDate = this.today;
      this.form.k8s = this.k8s;

      if (this.form.nowDate == "") {
        this.$Notice({
          message: this.$t("callChain.sdata"),
          type: "error",
        });

        return;
      }
      let rest = [];
      try {
        // this.$refs.detailsTable.$loading.show();
        rest = await this.$ajax.getJSON(
          "/server/api/detailByStartEndTime",
          this.form
        );
        // this.$refs.detailsTable.$loading.hide();
      } catch (e) {
        // this.$refs.detailsTable.$loading.hide();
      }
      this.options = [];
      this.flags = true;
      this.dataarr = [];
      for (const tmp of rest) {
        if (tmp.endTime == 0 || tmp.startTime == 0) {
          continue;
        }
        let newValue = {};
        newValue.name = tmp.name;
        newValue.callTime = tmp.endTime - tmp.startTime;
        newValue.startTime = moment(tmp.startTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        newValue.endTime = moment(tmp.endTime).format("YYYY-MM-DD HH:mm:ss");
        this.dataarr.push(newValue);
      }
      this.total = this.dataarr.length;
      this.handleCurrentChange(1);
    },
    async handleEdit(row) {
      let reg = new RegExp("-", "g");
      let date = this.form.nowDate.replace(reg, "");
      let res = await this.$ajax.getJSON("/server/api/detailByTraceId", {
        id: row.name,
        nowDate: this.form.nowDate.replace(reg, ""),
        k8s: this.k8s,
      });

      this.title = "TraceId：" + row.name;
      this.res = res;
      this.flag = true;
      return;
    },
    becomeD3(edges, nodeinfos) {
      this.$nextTick(() => {
        for (let k in edges) {
          let g = new dagreD3.graphlib.Graph().setGraph({});
          g.setGraph({
            rankdir: "LR",
            marginy: 60,
          });
          nodeinfos[k].forEach((item, index) => {
            item.rx = item.ry = 5; //圆角
            g.setNode(item.id, {
              labelType: "html",
              label: item.time
                ? `<div class="wrap"> <span class="span1">${item.id}</span><p class="p1" style="height:20px" >( ${item.time} ms )</p></div>`
                : `<div class="wrap"><span class="span1">${item.id}</span ></div>`,
              style: "fill:#457ff5",
            });
          });
          // 链接关系
          edges[k].forEach((item) => {
            if (k % 2 == 0) {
              g.setEdge(item.source, item.target, {
                label: item.label + "ms",
                //边样式
                style: "fill:#fff;stroke:#333;stroke-width:1.5px;",
              });
            } else {
              g.setEdge(item.source, item.target, {
                label: item.label + "ms",
                //边样式
                style: "fill:#EBF2FF;stroke:#333;stroke-width:1.5px;",
              });
            }
          });

          //绘制图形
          let svg = d3.select(`.svgs${k} svg`);
          let inner = svg.select("g");
          let render = new dagreD3.render();
          render(inner, g);

          var classSvg = document.getElementsByClassName(`svg${k}`);

          inner.selectAll(".edgeLabel tspan").attr("dy", "-1.2em");
          let spans = document.querySelectorAll(`.svgs${k} svg .span1`);
          for (var j in spans) {
            if (j == spans.length) {
              break;
            }
            // spans[j].style.fontSize = "12px";
          }
          inner.selectAll("g.node").on("click", (e, d, c) => {
            let arr = [];
            let svgs = d3.select(`#svgs`);
            svgs.selectAll(".all rect").style("fill", "white");
            edges[k].forEach((items, j) => {
              if (e == items.source && this.begin != items.target) {
                arr.push(items);
              }
            });

            inner.selectAll("rect").style("fill", (val, cd) => {
              if (val == e && arr.length > 0) {
                return "#3F5AE0";
              } else {
                return "#457FF5";
              }
            });

            if (arr.length > 0) {
              getAll(arr, edges[k], 0, arr.length, e);
            } else {
              return;
            }

            let arrs = [];
            let length = -1;
            for (let k in arr) {
              if (arr[k - 1] && arr[k].source == arr[k - 1].source) {
                arrs[length].push(arr[k]);
              } else {
                length += 1;
                arrs[length] = [];
                arrs[length].push(arr[k]);
              }
            }
            arrs.forEach((item) => {
              item.sort((a, b) => {
                return a.startTimeStamp - b.startTimeStamp;
              });
            });
            let array = [];
            arrs.forEach((item) => {
              item.forEach((items) => {
                array.push(items);
              });
            });
            this.ganTe(array, e, k);
          });
        }
      });
    },

    async ganTe(a, d, index) {
      var containers = document.getElementsByClassName("containers");

      for (var k in containers) {
        if (containers[k].style) {
          containers[k].style.display = "none";
        }
      }
      var container = document.getElementById(`containers${index}`);
      container.style.display = "block";
      let obj = a;

      let beginArr = [];
      obj.forEach((item) => {
        beginArr.push(item.startTimeStamp);
        this.resdata[index].forEach((items) => {
          if (item.target == items.vertex) {
            item.server_time = items.callTime / items.callCount;
          }
        });
        this.restdata[index].forEach((items) => {
          if (
            item.source == items.fromVertex &&
            item.target == items.toVertex
          ) {
            item.client_time = items.callTime / items.callCount;
          }
        });
      });
      let sourceArr = [];
      let targetArr = [];
      let servers = [];
      let clientTime = [];
      let serverTime = [];
      let btimeArr = [];
      transTree1(
        obj,
        sourceArr,
        targetArr,
        servers,
        clientTime,
        serverTime,
        btimeArr
      );
      var nowDate = new Date(); //今日日期为2020年2月14日
      var nowDateStr = formatDate(nowDate);

      function formatDate(date) {
        var arr = date.toLocaleDateString().split("/");
        if (arr[1].length < 2) {
          arr.splice(1, 1, "0" + arr[1]);
        }
        if (arr[2].length < 2) {
          arr.splice(2, 1, "0" + arr[2]);
        }
        return arr.join("-");
      }

      let title = d;
      var echarts = require("echarts");
      var myChart1 = echarts.init(container);
      let data = [];
      let length = servers.length - 1;
      for (let k in servers) {
        data.push({
          name: servers[k],
          value: [
            length - parseInt(k),
            btimeArr[k],
            btimeArr[k] + clientTime[k],
            (clientTime[k] - serverTime[k]) / 2 + btimeArr[k],
            serverTime[k],
          ],
        });
      }

      let numArr = [];
      let numArr1 = [];
      data.forEach((item) => {
        numArr.push(item.value[2]);
        numArr1.push(item.value[1]);
      });
      numArr.sort((a, b) => {
        return b - a;
      });
      numArr1.sort((a, b) => {
        return a - b;
      });
      servers = servers.reverse();
      var categories = servers;

      function renderItem(params, api) {
        var categoryIndex = api.value(0); //取出data中数据项的第一个维度的值
        //===============计划工期进度条
        //计划开始日期(在屏幕上的像素值)
        var planStartDate = api.coord([api.value(1), categoryIndex]); //将数据项中的数值对应的坐标系上的点，转换为屏幕上的像素值
        //坐标系上的点：是数据项映射到坐标系的x轴和y轴后，对应的位置
        //屏幕上的像素值：是坐标系上的点，在屏幕上的位置
        //计划结束日期(在屏幕上的像素值)
        var planEndDate = api.coord([api.value(2), categoryIndex]);
        //由于data.value中维度1和维度2的数据会被映射到x轴，而x轴的type为time，即时间轴，
        //所以api.value(1)和api.value(2)获取到的值是将日期转换后的毫秒值
        //设置图形的高度
        var height =
          api.size([0, 1])[1] * 0.35 > 30 ? 30 : api.size([0, 1])[1] * 0.35; //获得Y轴上数值范围为1的一段所对应的像素长度；这是官方文档的注释，对于api.size()方法，目前我还不是很理解；先做个标记??? 以后再说
        //console.log("height", height);
        //使用graphic图形元素组件，绘制矩形
        //clipRectByRect方法，在绘制矩形时，如果矩形大小超出了当前坐标系的包围盒，则裁剪这个矩形
        var rectShape1 = echarts.graphic.clipRectByRect(
          {
            //矩形的位置
            x: planStartDate[0],
            y: planStartDate[1],
            //矩形的宽高
            width: planEndDate[0] - planStartDate[0],
            height: height,
          },
          {
            //当前坐标系的包围盒
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height,
          }
        );
        //===============实际工期进度条
        var rectShape2 = null;
        //判断实际开始日期是否为空，如果为空，说明项目还没开始
        if (api.value(3) !== "") {
          //如果实际开始日期不为空
          //实际开始日期(在屏幕上的像素值)
          var practiceStartDate = api.coord([api.value(3), categoryIndex]);
          //当前日期或实际结束日期
          var nowDate_or_practiceEndDate;
          //项目周期(毫秒值)：计划结束日期(毫秒值) - 计划开始日期(毫秒值)
          var projectCycle_millisecond = api.value(4);
          //实际开始日期(毫秒值)
          var practiceStartDate_millisecond = api.value(3);

          //当前日期(毫秒值)
          var nowDate_millisecond = +echarts.number.parseDate(nowDateStr);

          var practiceEndDate_millisecond =
            practiceStartDate_millisecond + projectCycle_millisecond;
          //取实际结束日期(在屏幕上的像素值)
          nowDate_or_practiceEndDate = api.coord([
            practiceEndDate_millisecond,
            categoryIndex,
          ]);

          //使用graphic图形元素组件，绘制矩形
          //clipRectByRect方法，在绘制矩形时，如果矩形大小超出了当前坐标系的包围盒，则裁剪这个矩形
          rectShape2 = echarts.graphic.clipRectByRect(
            {
              //矩形的位置
              x: practiceStartDate[0],
              y: practiceStartDate[1],
              //矩形的宽高
              width: nowDate_or_practiceEndDate[0] - practiceStartDate[0],
              height: height,
            },
            {
              //当前坐标系的包围盒
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height,
            }
          );
        }

        if (rectShape2 == null) {
          //设置绘制的矩形的元素定义
          return (
            rectShape1 && {
              type: "group",
              children: [
                {
                  //类型为矩形
                  type: "rect",
                  //具体形状
                  shape: rectShape1,
                  //样式
                  style: api.style({
                    fill: "#AACCF9",
                  }),
                },
              ],
            }
          );
        } else {
          //渲染计划工期和实际工期
          //设置绘制的矩形的元素定义
          return (
            rectShape1 &&
            rectShape2 && {
              type: "group",
              children: [
                {
                  //类型为矩形
                  type: "rect",
                  //具体形状
                  shape: rectShape1,
                  //样式
                  style: api.style({
                    fill: "#a1a8f5",
                  }),
                },
                {
                  //类型为矩形
                  type: "rect",
                  //具体形状
                  shape: rectShape2,
                  //样式
                  style: api.style({
                    fill: "#9c9c9c",
                  }),
                },
              ],
            }
          );
        }
      }

      var that = this;
      myChart1.setOption({
        tooltip: {
          formatter: function(params) {
            //params为当前点击图形元素的数据信息的对象
            //计划开始时间

            return (
              params.name +
              "<br/>" +
              that.$t("callChain.stringBtime") +
              that.fortime(params.value[1]) +
              "ms" +
              "<br/>" +
              that.$t("callChain.stringEtime") +
              that.fortime(params.value[2]) +
              "ms" +
              "<br/>" +
              that.$t("callChain.clientTime") +
              (params.value[2].toFixed(2) - params.value[1].toFixed(2)) +
              "ms" +
              "<br/>" +
              that.$t("callChain.serverTime") +
              params.value[4].toFixed(2) +
              "ms"
            );
          },
        },
        title: {
          text: this.serverArrs[index] + "：" + title,
          left: "center",
        },
        xAxis: {
          type: "value", //x轴类型为时间轴
          min: numArr1[0], //最小值为2020-01-01
          max: numArr[0], //最大值为2020-12-31
          axisLabel: {
            interval: 0,
            formatter: function(value) {
              return that.fortime(value);
            },
          },
          splitLine: {
            show: true, //  false没有网格线,true,有网格线
          },
        },
        yAxis: {
          data: categories,
          axisTick: {
            alignWithLabel: true, //保证刻度线和标签对齐，当boundaryGap为true的时候有效，不过boundaryGap默认就是true
          },
          splitLine: {
            show: true, //  false没有网格线,true,有网格线
          },
        },
        legend: {
          left: "70%",
          top: 20,
          data: ["client", "server"],
        },
        grid: {
          left: 260, // 调整这个属性
        },
        series: [
          {
            type: "custom",
            //使用自定义的图形元素
            renderItem: renderItem,
            name: "client",
            itemStyle: {
              color: "#a1a8f5",
            },
            encode: {
              //将维度1和维度2的数据映射到x轴
              x: [1, 2],
              //将维度0的数据映射到y轴
              y: 0,
            },
            data: data,
          },
          //这个系列并没有太大作用，也没有给它设置data，只是为了通过这个系列，显示图例(legend)而已
          {
            type: "custom",
            name: "server",
            itemStyle: {
              color: "#9c9c9c",
            },
          },
        ],
      });
    },
    async getdatas() {},
  },
};
</script>

<style>
.all svg {
  font-size: 12px;
}

.all .edgePath path {
  stroke: #606266;
  fill: #333;
  stroke-width: 1.5px;
}

.all #containers {
  width: 2000px;
  height: 500px;
  margin: 0 auto;
}

.all .el-button--primary {
  background-color: #3f5ae0;
  border-color: #3f5ae0;
  color: #fff;
}

.all .edgePath path {
  stroke: #999 !important;
}

.__bar-is-vertical {
  right: -1px !important;
}

.__bar-is-horizontal {
  display: none !important;
}

.node {
  background-color: #3f5ae0;
}
</style>
