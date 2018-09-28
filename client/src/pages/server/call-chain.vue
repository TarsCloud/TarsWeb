<template>
    <div class="page_server_call_chain">
        <!-- traceid列表 -->
        <div v-if="!showDuration">
            <let-form ref="traceIdForm" inline >
                <let-form-item itemWidth="45%">
                    <let-select v-model="searchType" class="select_width">
                        <let-option value="traceId">TraceID</let-option>
                        <let-option value="service">Service</let-option>
                    </let-select>
                    <input class="custom_input" v-model="content" @keyup.enter="getTracesList" placeholder=""/>
                </let-form-item>
                <let-form-item itemWidth="40%">
                    <let-date-range-picker :start.sync="start_time" :end.sync="end_time"></let-date-range-picker>
                    <let-button theme="primary" @click="getTracesList">查询</let-button>
                </let-form-item>
            </let-form>

            <div class="mt10">
                <let-table :data="computedList" :empty-msg="$t('common.nodata')">
                    <let-table-column title="业务名称">
                        <template slot-scope="scope">
                            <let-table-operation @click="showDetail(scope.row.traceId)">{{scope.row.traceId}}</let-table-operation>
                        </template>
                    </let-table-column>
                    <let-table-column title="产生时间" prop="timestampFormat"></let-table-column>
                    <let-table-column title="耗时(ms)" prop="duration"></let-table-column>
                </let-table>
            </div>
        </div>

        <!-- 调用链查询 -->
        <div v-if="showDuration">
            <h3><a href="javascript:;" class="link" @click="showDuration=false">调用链查询</a> / {{selectedTraceId}}</h3>
            <let-table stripe :data="traceDetailList" :empty-msg="$t('common.nodata')">
                <let-table-column title="应用/服务">
                    <template slot-scope="scope">
                        <span :style="'margin-left:'+(scope.row.layer)*30+'px'">{{scope.row.serviceName}}</span>
                    </template>
                </let-table-column>
                <let-table-column title="IP" prop="ip"></let-table-column>
                <let-table-column title="类型" prop="type"></let-table-column>    
                <let-table-column title="状态" prop="status">
                    <template slot-scope="scope">
                        <span >{{statusMap[scope.row.status]}}</span>
                    </template>
                </let-table-column>
                <let-table-column title="服务/方法" prop="name"></let-table-column>
                <let-table-column title="耗时">
                    <template slot-scope="scope">
                        <span class="duration" :style="'width:'+scope.row.duration*scope.row.scale+'px;margin-left:'+scope.row.marginLeft+'px;background-color:'+scope.row.color"></span>{{scope.row.duration}}ms
                    </template>
                </let-table-column>
            </let-table>
        </div>
    </div>
</template>

<script>
import wrapper from '@/components/section-wrappper';
export default {
    name : 'CallChain',
    components: {
        wrapper,
    },
    data() {
        return {
            serverData:[],
            content:'',
            searchType: 'service',
            start_time: '',
            end_time: '',
            traceidList: [],
            computedList: [],
            showDuration:null,
            selectedTraceId : null,
            traceDetailList : null,
            objList: [],
            colorArr : ['#33cc59', '#fa5a4b', '#ffaa33', '#9a41d9', '#d99cee', '#71d2e7', '#e7d271'],
            statusMap : {
                '0' : '成功',
                '-1': '超时',
                '-2': '失败'
            }
        }
    },
    methods: {
        getTracesList() {
            const loading = this.$Loading.show();
            this.traceidList = [];
            if(!this.content){
                this.searchType = 'service';
            }
            this.$ajax.getJSON('/server/api/get_trace_list',{
                type : this.searchType,
                content : this.content,
                start_time : this.start_time,
                end_time : this.end_time
            }).then(data => {
                loading.hide();
                this.traceidList = data;
                let newData=data.filter(n => n.layer==0);
                newData.forEach(n => {
                    n.timestampFormat = this.dateToStr(new Date(n.timestamp), 'yyyy-mm-dd hh:mm:ss');
                })
                this.computedList = newData;
            }).catch((err) => {
                loading.hide();
                this.$tip.error(`系统错误: ${err.message || err.err_msg}`);
            });
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
        },
        getObjList(application, server_name) {
            this.$ajax.getJSON('/server/api/all_adapter_conf_list', {
                application : application,
                server_name : server_name,
            }).then(data => {
                if(data.length){
                    this.objList = data;
                    this.content = data[0].servant;
                    this.getTracesList();
                }
            }).catch(err=>{
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        showDetail(id) {
            this.selectedTraceId = id;
            let data = this.traceidList.filter(item => item.traceId == id);
            data = data.sort((a, b)=>{
                if(a.layer - b.layer == 0) {
                    return a.timestamp - b.timestamp;
                }else {
                    return a.layer - b.layer;
                }
            });
            this.showDuration = true;
            let parentTimestamp = 0;
            let parentDuration = 0;
            let scale = 1;
            data.forEach(item => {
                if(item.layer==0) {
                    parentTimestamp = item.timestamp;
                    parentDuration = item.duration;
                    item.marginLeft = 0;
                    if(item.duration > 300) {
                        scale = (300 / item.duration).toFixed(2);
                    }
                }
                item.scale = Number(scale);
                item.marginLeft = (item.timestamp - parentTimestamp)*item.scale >300 ? 300 : (item.timestamp - parentTimestamp)*item.scale;
                if(item.duration/parentDuration > 0.75 && item.duration/parentDuration<=1){
                    item.color = '#fa5a4b'; //danger
                }else if(item.duration/parentDuration > 0.5 && item.duration/parentDuration <0.75){
                    item.color = '#ffaa33'; //warning
                }else if(item.duration/parentDuration > 0.25 && item.duration/parentDuration<0.5){
                    item.color = '#9a41d9' //normal
                }else{
                    item.color = '#33cc59'; //good
                }
            });
            this.traceDetailList = data;
        }
    },
    created() {
        this.serverData = this.$parent.getServerData();
    },
    mounted() {
        this.getObjList(this.serverData.application, this.serverData.server_name);
        
        this.setDate();
    }
}
</script>

<style>
    .page_server_call_chain{
        .mt10{margin-top:10px}
        .custom_input{
            border: 1px solid #c0c4cc;
            border-radius: 4px;
            outline: 0;
            color: #222329;
            font-size: 14px;
            padding: 0 16px;
            box-sizing: border-box;
            width: 70%;
            height: 42px;
        }
        .link{color:#3f5ae0}
        .duration{
            display: inline-block;
            height: 10px;
            background-color: #33cc59;
            max-width: 300px;
            margin-right: 10px;
        }
        .select_width{width:50px}
    }
</style>

