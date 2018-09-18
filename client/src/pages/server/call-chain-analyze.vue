<template>
    <div class="call-chain-analyze">
        <let-form inline ref="topoForm">
            <let-form-item :size=3>
                <input class="custom_input" v-model="serviceName" @keyup.enter="showTopo" placeholder="输入服务名"/>
            </let-form-item>
            <let-form-item :size=3>
                <let-date-range-picker required :start.sync="start_time" :end.sync="end_time"></let-date-range-picker>
                <let-button theme="primary" @click="showTopo">查询</let-button>
            </let-form-item>
        </let-form>

        <div id="topo" class="topo_graph"></div>

        <div class="let-table let-table_stripe">
            <table v-if="chainShapesList.length">
                <thead>
                    <tr>
                        <th>应用名</th><th>服务/方法</th><th>QPS</th><th>QPS峰值</th><th>调用占比</th><th>平均耗时</th><th>失败率</th>
                    </tr>
                </thead>
                <tbody v-for="item in chainShapesList">
                    <tr v-for="sub in item.value">
                        <td>{{sub.serviceName}}</td>
                        <td>{{sub.method}}</td>
                        <td>{{sub.QPS}}</td>
                        <td>{{sub.peakQPS}}</td>
                        <td>{{sub.callPercent}}</td>
                        <td>{{sub.avgCost}}</td>
                        <td>{{sub.failRate}}</td>
                    </tr>
                </tbody>
            </table>
            <table v-else>
                <thead>
                    <tr>
                        <th>应用名</th><th>服务/方法</th><th>QPS</th><th>QPS峰值</th><th>调用占比</th><th>平均耗时</th><th>失败率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="7">没有数据</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name : 'CallChainAnalyze',
    data() {
        return {
            // 当前页面信息
            serverData: {
                level: 5,
                application: '',
                server_name: '',
                set_name: '',
                set_area: '',
                set_group: '',
            },
            serviceName : '',
            start_time: '',
            end_time: '',
            chainShapesList: []
        }
    },
    methods : {
        showTopo() {
            let container = document.querySelector('#topo');
            if(this.$refs.topoForm.validate()){
                const loading = this.$Loading.show();
                this.$ajax.getJSON('/server/api/get_topo', {
                    serviceName : this.serviceName,
                    start : this.start_time,
                    end : this.end_time
                }).then(data => {
                    loading.hide();
                    // create an array with nodes
                    var nodes = new vis.DataSet(data.dependencyGraph.vertexs.value);

                    // create an array with edges
                    var edges = new vis.DataSet(data.dependencyGraph.links.value);

                    var data = {
                        nodes: nodes,
                        edges: edges
                    };
                    var network = new vis.Network(container, data, {
                        physics : {
                            enabled : false
                        },
                        layout : {
                            hierarchical:{
                                enabled : true,
                                direction : 'LR',
                                levelSeparation : 300
                            },
                        },
                        nodes : {
                            shape : 'box',
                            color : {
                                border : '#cccccc',
                                background : '#ffffff'
                            },
                            margin : {
                                top: 13,
                                bottom: 13,
                                left: 27,
                                right: 27
                            }
                        },
                        edges : {
                            arrows : {
                                to : {
                                    enabled : true,
                                    scaleFactor : 0.5,
                                    type : 'arrow'
                                }
                            },
                            smooth : {
                                enabled : true,
                                type : 'vertical'
                            }
                        }
                    });

                    this.chainShapesList = data.chainShapes.chainShapes.value;
                }).catch((err) => {
                    loading.hide();
                    this.$tip.error(err.message || err.err_msg);
                });
            }
        },
        setDate() {
            let day = new Date().getDate();
            let oldDay = new Date().setDate(day-1);
            this.start_time = this.dateToStr(new Date(oldDay), 'yyyy-mm-dd');
            this.end_time = this.dateToStr(new Date(), 'yyyy-mm-dd');
        },

        dateToStr(date, format) {
            if(!date || date=='Invalid Date') return;
            return format.replace(/yyyy/gi, date.getFullYear().toString())
                .replace(/MM/i, fn(date.getMonth() + 1))
                .replace(/dd/gi, fn(date.getDate()))
                .replace(/hh/gi, fn(date.getHours()))
                .replace(/mm/gi, fn(date.getMinutes()))
                .replace(/ss/gi, fn(date.getSeconds()));
            
            function fn (n) {
                return (n < 10 ? '0' + n : n).toString();
            }
        }
    },
    created() {
        this.serverData = this.$parent.getServerData();
        const treeArr = this.$route.params.treeid.split('.');
        let serviceName = treeArr.map(item => {
            return item.substr(1);
        });
        this.serviceName = serviceName.join('.');
        this.setDate();
    },
    mounted() {

    }
}
</script>

<style>
    .call-chain-analyze{
        .custom_input{
            border: 1px solid #c0c4cc;
            border-radius: 4px;
            outline: 0;
            color: #222329;
            font-size: 14px;
            padding: 0 16px;
            box-sizing: border-box;
            width: 220px;
            height: 38px;
        }
        .topo_graph{
            width: 100%;
            height: 400px;
        }
    }
</style>

