<!-- 调用链  -->
<template>
  <div class="home">
    <let-form :inline="true" ref="form" style="font-size: 16px">
      <let-form-item :label="$t('callChain.date')">
        <let-date-picker
          style="width: 200px"
          v-model="date1"
          theme="primary"
          size="small"
        ></let-date-picker>
      </let-form-item>
      <let-form-item :label="$t('callChain.method')">
        <let-select
          size="small"
          v-model="funcName"
          :placeholder="$t('callChain.selectMethod')"
          clearable
        >
          <let-option
            v-for="(item, index) in funcNames"
            :key="index"
            :label="item"
            :value="item"
          >
          </let-option>
        </let-select>
      </let-form-item>
      <let-form-item>
        <let-button
          ref="myButton"
          theme="primary"
          size="mini"
          style="margin-left: 10px"
          @click="sub"
        >
          {{ $t("callChain.sub") }}
        </let-button>
      </let-form-item>
    </let-form>

    <div style="height: 600px" v-loading="svgLoading">
      <vue-scroll :ops="ops" style="width: 100%; height: 100%">
        <div v-for="(item, index) in nodeinfos" :key="index">
          <div :class="'svg' + index" style="float: left; width: 100% ;">
            <svg :id="svgId + '-' + index" width="100%" height="100%">
              <g />
              <rect />
            </svg>
            <hr />
          </div>
          <div :id="'exportModal-' + svgId + '-' + index" class="exportModal">
            <let-modal
              title="甘特图"
              v-model="exportModal"
              width="80%"
              @close="closeModel"
              :footShow="false"
              :closeOnClickBackdrop="true"
            >
              <div
                :id="'container-' + svgId + '-' + index"
                class="container"
                style="width: 1400%; height: 500px"
              ></div>
            </let-modal>
          </div>
        </div>
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import dagreD3 from "dagre-d3";
import * as d3 from "d3";
import { getAll, unique, transTree } from "../../api/util";
import stringRandom from "string-random";

export default {
  components: {},
  data() {
    let k8s = location.pathname == "/k8s.html";

    return {
      svgLoading: false,
      k8s,
      exportModal: false,
      changenum: 0,
      surenum: "",
      svgId: "svg-" + stringRandom(10),
      funcName: "",
      funcNames: [],
      date1: "",
      today: "",
      dateTime: "",
      flags: false,
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
      loading: false,
      flag2: false,
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
    this.date1 = myDate.getFullYear() + "-" + month + "-" + day;
    this.dateTime = ["00:00:00", "23:59:59"];
    this.value =
      this.$store.state.name.name.application +
      "." +
      this.$store.state.name.name.server_name;
    this.sub();
  },
  created() {},
  watch: {
    changenum(val) {
      this.exportModal = true;
      // console.log("val", val);
      // console.log("this.exportModal", this.exportModal);
      // console.log("surenum", this.surenum);

      let exportModals = document.getElementsByClassName("exportModal");
      for (const exportMoal of exportModals) {
        if (exportMoal.style) exportMoal.style.display = "none";
      }
      let selector = `exportModal-${this.svgId}-${this.surenum}`;
      let exportModal = document.getElementById(selector);
      exportModal.style.display = "block";
    },
  },
  methods: {
    async sub() {
      try {
        this.svgLoading = true;
        let regs = new RegExp("-", "g");
        this.today = this.date1.replace(regs, "");
        this.flags = true;
        this.flag2 = true;
        if (!this.funcName) {
          let res = await this.$ajax.getJSON("/server/api/funcList", {
            id: this.value,
            nowDate: this.today,
            k8s: this.k8s,
          });
          this.funcNames = res.funcList;
        }
        let rest = {};
        if (!this.funcName) {
          rest = await this.$ajax.getJSON("/server/api/getAverage", {
            label: this.value,
            nowDate: this.today,
            k8s: this.k8s,
          });
        } else {
          rest = await this.$ajax.getJSON("/server/api/getAverageByFuncName", {
            label: this.funcName,
            nowDate: this.today,
            k8s: this.k8s,
          });
        }

        if (rest.error || rest.err_msg) {
          this.$Notice({
            message: rest.error || err_msg,
            type: "error",
          });
          this.svgLoading = false;
          return;
        }
        // console.log("rest", rest);
        if (rest.rows.length == 0) {
          this.$Notice({
            message: this.$t("callChain.noResult"),
            type: "warning",
          });
          this.svgLoading = false;
        }
        //  rest.rows.push(rest.rows[0])
        this.dataarr = [];
        rest.rows.forEach((item) => {
          let obj = {};
          item.forEach((items, i) => {
            obj[rest.columns[i].name] = items;
          });
          this.dataarr.push(obj);
        });
        this.dataarr.forEach((item) => {
          item.vertexes = JSON.parse(item.vertexes);
          item.edges = JSON.parse(item.edges);
        });
        this.resdata = [];
        this.restdata = [];
        let nodeinfos = [];
        let edges = [];
        this.traceIds = [];
        this.funcIds = [];
        let i = -1;
        this.serverArrs = [];
        this.dataarr.forEach((item) => {
          this.serverArrs.push(item.id);
          this.traceIds.push(item.traceIds);
          this.funcIds.push(item.funcIds);
          i++;
          nodeinfos[i] = [];
          edges[i] = [];
          this.resdata[this.resdata.length] = item.vertexes;
          this.restdata[this.restdata.length] = item.edges;

          let item1 = item.vertexes;
          let item2 = item.edges;

          item1.forEach((item) => {
            nodeinfos[i].push({
              id: item.vertex,
              label: item.vertex,
              time:
                item.callCount == 0
                  ? 0
                  : (item.callTime / item.callCount).toFixed(2),
            });
          });

          item2.forEach((item) => {
            edges[i].push({
              source: item.fromVertex,
              target: item.toVertex,
              label:
                item.callCount == 0
                  ? 0
                  : (item.callTime / item.callCount).toFixed(2),
            });
          });
        });
        // console.log("this.datearr", this.dataarr);
        edges.forEach((item, index) => {
          let arr = [];
          item.forEach((items) => {
            arr.push(items.target);
          });
          item.forEach((items) => {
            if (arr.indexOf(items.source) < 0) {
              this.begin = items.source;
              nodeinfos[index].push({
                id: items.source,
                label: items.source,
              });
            } else {
            }
          });
        });
        this.edges = edges;
        this.nodeinfos = nodeinfos;

        for (var j in this.traceIds) {
          let traceIds = this.traceIds[j]
            .replace("[", "")
            .replace("]", "")
            .replace(/\s/g, "")
            .split(",");
          this.traceIds[j] = traceIds;
        }
        for (var j in this.funcIds) {
          let funcIds = this.funcIds[j]
            .replace("[", "")
            .replace("]", "")
            .replace(/\s/g, "")
            .split(",");
          this.funcIds[j] = funcIds;
        }
        this.becomeD3(edges, nodeinfos);
        this.svgLoading = false;
      } catch (e) {
        this.svgLoading = false;
      }
    },
    becomeD3(edges, nodeinfos) {
      this.$nextTick(() => {
        for (let k in edges) {
          let g = new dagreD3.graphlib.Graph().setGraph({});
          g.setGraph({
            rankdir: "LR",
            marginy: 60,
          });
          // 添加节点
          nodeinfos[k].forEach((item, index) => {
            item.rx = item.ry = 5; //圆角
            g.setNode(item.id, {
              labelType: "html",
              label: item.time
                ? `<div class="wrap"> <span class="span1" >${item.id}</span> <p class="p1" style="height:20px" >( ${item.time} ms )</p></div>`
                : `<div class="wrap"> <span class="span1" >${item.id}</span> </div>`,
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
                style: "fill:#ffffff;stroke:#333;stroke-width:1.5px;",
              });
            }
          });
          let selector = `#${this.svgId}-${k}`;
          //绘制图形
          let svg = d3.select(selector);

          let inner = svg.select("g");
          let render = new dagreD3.render();
          render(inner, g);
          inner.selectAll(".edgeLabel tspan").attr("dy", "-1.2em");
          let spans = document.querySelectorAll(`${selector} .span1`);
          for (var j in spans) {
            if (j == spans.length) {
              break;
            }
            // spans[j].style.fontSize ="12px"  报错
            if (spans[j].innerHTML == this.value) {
              spans[j].style.color = "red";
            }
          }
          let svgElement = document.querySelector(selector);
          svgElement.style.height = svgElement.getBBox().height + 150;

          inner.selectAll("g.node").on("click", (e, d) => {
            let arr = [];
            let svgs = d3.select(selector);
            svgs.selectAll("rect").style("fill", "#457FF5");
            edges[k].forEach((items, j) => {
              if (e == items.source && this.begin != items.target) {
                arr.push(items);
              }
            });
            inner.selectAll("rect").style("fill", (val) => {
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
            this.ganTe(arr, d, k);
          });
        }
      });
    },
    closeModel() {
      //   console.log(`closeModel this.exportModal:${this.exportModal}`);
    },
    async ganTe(a, d, index) {
      this.$nextTick(() => {
        let that = this;
        let selector = `container-${this.svgId}-${index}`;
        //container-Wx2t9fBP7vqz5bWyqAvI-0
        //let selector = 'container';
        // console.log("selector:" + selector);
        var container = document.getElementById(selector);
        // console.log("container:" + container);
        container.style.display = "block";
        let obj = a;

        obj.forEach((item) => {
          this.resdata[index].forEach((items) => {
            if (item.target == items.vertex) {
              item.server_time =
                items.callCount == 0 ? 0 : items.callTime / items.callCount;
            }
          });
          this.restdata[index].forEach((items) => {
            if (
              item.source == items.fromVertex &&
              item.target == items.toVertex
            ) {
              item.client_time =
                items.callCount == 0 ? 0 : items.callTime / items.callCount;
            }
          });
        });
        let sourceArr = [];
        let targetArr = [];
        let servers = [];
        let clientTime = [];
        let serverTime = [];
        let btimeArr = [];
        transTree(
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
        data.forEach((item) => {
          numArr.push(item.value[2]);
        });
        numArr.sort((a, b) => {
          return b - a;
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

            //如果项目进度未完成或刚好完成。
            //比如计划开始时间1月10日，计划结束时间1月20日，项目周期10天，实际开始时间1月10日，当前日期1月18日，说明项目进度未完成
            //那么在渲染实际工期的进度条时，进度条的范围为1月10日至1月18日(实际开始日期至当前日期)
            //比如计划开始时间1月10日，计划结束时间1月20日，项目周期10天，实际开始时间1月10日，当前日期1月20日，说明项目进度刚好完成
            //那么在渲染实际工期的进度条时，进度条的范围为1月10日至1月20日(实际开始日期至当前日期)
            if (
              nowDate_millisecond - practiceStartDate_millisecond <=
              projectCycle_millisecond
            ) {
              //取当前日期(在屏幕上的像素值)
              nowDate_or_practiceEndDate = api.coord([
                nowDate_millisecond,
                categoryIndex,
              ]);
            } else {
              //比如计划开始时间1月10日，计划结束时间1月20日，项目周期10天，实际开始时间1月10日，当前日期1月22日，说明项目已结束
              //那么在渲染实际工期的进度条时，进度条的范围应该是1月10日至1月20日(实际开始日期至实际结束日期)，
              //而不是1月10日至1月22日(实际开始日期至当前日期)
              //实际结束日期(毫秒值)：实际开始日期(毫秒值) + 项目周期(毫秒值)
              var practiceEndDate_millisecond =
                practiceStartDate_millisecond + projectCycle_millisecond;
              //取实际结束日期(在屏幕上的像素值)
              nowDate_or_practiceEndDate = api.coord([
                practiceEndDate_millisecond,
                categoryIndex,
              ]);
            }

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

          //如果项目还没开始，那么只渲染计划工期的进度条
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

        myChart1.setOption({
          tooltip: {
            formatter: function(params) {
              //params为当前点击图形元素的数据信息的对象
              //计划开始时间

              return (
                params.name +
                "<br/>" +
                that.$t("callChain.stringBtime") +
                params.value[1].toFixed(2) +
                "ms" +
                "<br/>" +
                that.$t("callChain.stringEtime") +
                params.value[2].toFixed(2) +
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
            min: 0, //最小值为2020-01-01
            max: numArr[0].toFixed(2), //最大值为2020-12-31
            axisLabel: {
              interval: 0, //强制显示所有标签
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
            left: 200, // 调整这个属性
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

        this.surenum = index;
        this.changenum += 1;
      });
    },
  },
  // },
};
</script>

<style>
svg {
  font-size: 12px;
}

.home .edgePath path {
  stroke: #606266;
  fill: #333;
  stroke-width: 1.5px;
}

.home #container {
  width: 2000px;
  height: 500px;
  margin: 0 auto;
}

.home .wrap {
  text-align: center;
}

.home .wrap span {
  color: #9cf1c5;
}

.home .wrap p {
  color: #fff;
  margin: 0;
  text-align: center;
}

.el-form-item__label-wrap {
  margin-left: 0 !important;
}

.el-input__inner {
  line-height: 34px !important;
  height: 34px !important;
}

.__bar-is-vertical {
  right: -1px !important;
}

.__bar-is-horizontal {
  display: none !important;
}
</style>
