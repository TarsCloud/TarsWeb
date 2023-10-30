<!-- 调用链明细 详情-->
<template>
    <div :id="id">
        <let-modal class="pop_tit" :title="title" style="top:-120px"  v-model="dialogVisible" width="90%" :footShow="false">
            <div>
                <div v-for="(item, index) in this.datalist.rows" :key="index"
                     :style=" index % 2 == 1 ? 'background-color: #EBF2FF;' : 'background-color: #ffffff;'">
                    <div :class="'svgF' + index">
                        <svg :id="`svg-${id}-${index}`" width="100%"><g/><rect/></svg>
                        <div :id="`funccontainer-${id}-${index}`" class="wcontainer"
                             style="height: 500px; display: none"></div>
                    </div>
                </div>
            </div>
        </let-modal>
    </div>
</template>

<script>
import dagreD3 from "dagre-d3";
import * as d3 from "d3";
import stringRandom from "string-random";
let echarts = require("echarts");
let myChart1;
import {getAll, transTree} from "../../api/util";

export default {
    props: ["res", "rest", "title"],
    data() {
        return {
            dialogVisible: false,
            options: [],
            resdata: [],
            restdata: [],
            value: "",
            serverArrs: [],
            dataLists: [],
            dataarr: [],
            traceIds: [],
            nodeinfos: [],
            edges: [],
            funcIds: [],
            datalist: [],
            arrdata: [],
            begin: "",
            id: 'opendiv-' + stringRandom(20)
        };
    },
    mounted() {

    },
    created() {
    },
    watch: {
        res(val) {
            this.dialogVisible = true;
            this.datalist = val;
            this.getdatas();
        },
        rest(val) {
            this.dialogVisible = true;
            this.datalist = val;
            this.getdatas();
        },
    },
    methods: {
        getdatas() {
            this.$nextTick(() => {
                var start1 = new Date().getTime();
                var containers = document.getElementsByClassName("wcontainer");
                var start2 = new Date().getTime();
                console.log("cost is2", `${start2 - start1}ms`);
                for (let k in containers) {
                    if (containers[k].style) {
                        containers[k].style.display = "none";
                    }
                }
                var start3 = new Date().getTime();
                console.log("cost is3", `${start3 - start2}ms`);
                let arr = [];
                this.datalist.rows.forEach((item) => {
                    let obj = {};
                    item.forEach((items, i) => {
                        obj[this.datalist.columns[i].name] = items;
                    });
                    arr.push(obj);
                });
                var start4 = new Date().getTime();
                console.log("cost is4", `${start4 - start3}ms`);
                let nodeinfos = [];
                let edges = [];
                arr.forEach((item, index) => {
                    item.vertexes = JSON.parse(item.vertexes);
                    item.edges = JSON.parse(item.edges);
                    nodeinfos[index] = [];
                    edges[index] = [];
                    item.vertexes.forEach((items) => {
                        nodeinfos[index].push({
                            id: items.vertex,
                            label: items.vertex,
                            time: items.callCount?(items.callTime / items.callCount).toFixed(2):'0',
                        });
                    });
                    item.edges.forEach((items) => {
                        edges[index].push({
                            source: items.fromVertex,
                            target: items.toVertex,
                            label: items.callCount?(items.callTime / items.callCount).toFixed(2):'0',
                        });
                    });
                });
                var start5 = new Date().getTime();
                console.log("cost is5", `${start5 - start4}ms`);
                this.arrdata = arr;
                this.begin = "";
                edges.forEach((item, index) => {
                    let arr1 = [];
                    item.forEach((items) => {
                        arr1.push(items.target);
                    });
                    item.forEach((items) => {
                        if (arr1.indexOf(items.source) < 0) {
                            this.begin = items.source;
                            nodeinfos[index].push({
                                id: items.source,
                                label: items.source,
                            });
                        }
                    });
                });
                var start6 = new Date().getTime();
                console.log("cost is6", `${start6 - start5}ms`);
                this.becomeD3(edges, nodeinfos);
            });
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
                                ? `<div class="wrap"> <span class="span1">${item.id}</span><p class="p1" style="height:20px" >( ${item.time} ms )</p></div>`
                                : `<div class="wrap"><span class="span1">${item.id}</span ></div>`,
                            style: "fill:#457ff5",
                        });
                    });

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
                    let selector = `#svg-${this.id}-${k}`
                    let svg = d3.select(selector);

          let inner = svg.select("g");
          let render = new dagreD3.render();

          render(inner, g);

          inner.selectAll(".edgeLabel tspan").attr("dy", "-1.2em");
          let spans = document.querySelectorAll(`${selector} .span1`);
          for (let j in spans) {
            if (j == spans.length) {
              break;
            }

            // spans[j].style.fontSize = "12px";
            if (spans[j].innerHTML == this.value) {
              spans[j].style.color = "red";
            }
          }
          let svgElement = document.querySelector(`#svg-${this.id}-${k}`);
          let svgHeight = svgElement.getBBox().height;
          //   console.log("svg.height:" + svgHeight);
          svgElement.style.height = svgHeight + 100;

          inner.selectAll("g.node").on("click", (e, d) => {
            let arr = [];
            let svgs = d3.select(`#${this.id}`);
            svgs.selectAll("rect").style("fill", "#457FF5");
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
              getAll(arr, edges[k], 0, arr.length);
            } else {
              return;
            }

            this.ganTe(arr, e, k);
          });
        }
      });
    },
    async ganTe(a, d, index) {
      var containers = document.getElementsByClassName("wcontainer");
      let that = this;
      for (let k in containers) {
        if (containers[k].style) {
          containers[k].style.display = "none";
        }
      }

            var container = document.getElementById(`funccontainer-${this.id}-${index}`);
            container.style.display = "block";
            let obj = a;
            obj.forEach((item) => {
                this.arrdata[index].vertexes.forEach((items) => {
                    if (item.target == items.vertex) {
                        item.server_time = items.callTime / items.callCount;
                    }
                });
                this.arrdata[index].edges.forEach((items) => {
                    if (
                        item.source == items.fromVertex &&
                        item.target == items.toVertex
                    ) {
                        item.client_time = items.callTime / items.callCount;
                        console.log("itmes:" + JSON.stringify(items))
                        item.ret = items.ret;
                        item.csData = items.csData;
                        item.srData = items.srData;
                        item.ssData = items.ssData;
                        item.crData = items.crData;
                    }
                });
            });
            let sourceArr = [];
            let targetArr = [];
            let servers = [];
            let clientTime = [];
            let serverTime = [];
            let btimeArr = [];
            let retArr = [];
            let csDataArr = [], srDataArr = [], ssDataArr = [], crDataArr = [];
            transTree(
                obj,
                sourceArr,
                targetArr,
                servers,
                clientTime,
                serverTime,
                btimeArr,
                retArr,
                csDataArr,
                srDataArr,
                ssDataArr,
                crDataArr
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
            if(myChart1){
                //避免dialog关闭后echart没关
                myChart1.clear();
            }
            myChart1 = echarts.init(container);
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
                        retArr[k],
                        csDataArr[k],
                        srDataArr[k],
                        ssDataArr[k],
                        crDataArr[k]
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

          //实际结束日期(毫秒值)：实际开始日期(毫秒值) + 项目周期(毫秒值)
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
          enterable: true,
          appendToBody: true,
          position: function(point, params) {
            if (
              new Buffer(params.value[6], "base64").toString().length >= 500 ||
              new Buffer(params.value[7], "base64").toString().length >= 500 ||
              new Buffer(params.value[8], "base64").toString().length >= 500 ||
              new Buffer(params.value[9], "base64").toString().length >= 500
            ) {
              return [point[0] - 100, point[1] - 250];
            } else {
              return [point[0] - 100, point[1] - 100];
            }
          },
          formatter: (params) => {
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
              "ms" +
              "<br>" +
              "ret:" +
              params.value[5] +
              "<div style='word-wrap:break-word;white-space:normal;max-width: 900px;overflow-y: scroll;max-height: 400px'>" +
              "csData:" +
              new Buffer(params.value[6], "base64").toString() +
              "<br>" +
              "srData:" +
              new Buffer(params.value[7], "base64").toString() +
              "<br>" +
              "ssData:" +
              new Buffer(params.value[8], "base64").toString() +
              "<br>" +
              "crData:" +
              new Buffer(params.value[9], "base64").toString() +
              "</div>"
            );
          },
        },
        title: {
          text: title,
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

    //添加close避免dialog关闭后echart没关
    closeDialog() {
      let echarts = require("echarts");
      let containers = document.getElementsByClassName("wcontainer");
      for (let k in containers) {
        echarts.init(containers[k]).clear();
      }
    },
  },
};
</script>

<style>
svg {
  font-size: 12px;
}

.node rect {
  stroke: #fff;
}

.edgePath path {
  stroke: #606266;
  fill: #333;
  stroke-width: 1.5px;
}

#container {
  width: 2000px;
  height: 300px;
  margin: 0 auto;
}

tspan {
  fill: #fff;
}

.edgeLabel tspan {
  fill: #333;
}

.wrap {
  text-align: center;
}

.wrap span {
  color: #fff;
  font-size: 14px;
}

.wrap p {
  color: #fff;
  margin: 0;
  text-align: center;
}

.wrap p {
  color: #99f3d6;
}
</style>
