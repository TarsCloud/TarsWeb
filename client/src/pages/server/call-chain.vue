<template>
    <div class="page_server_call_chain">
        <!-- traceid列表 -->
        <div v-if="!showDuration">
            <let-row>
                <let-col class="grid-content bg-blue" span="8">
                    <input class="custom_input" v-model="traceId" @keyup.enter="getTracesList" placeholder="输入TraceID"/>
                </let-col>
                <let-col class="grid-content bg-blue-little" span="7" offset="9">
                    <let-date-range-picker :start.sync="start_time" :end.sync="end_time"></let-date-range-picker>
                    <let-button theme="primary">查询</let-button>
                </let-col>
            </let-row>

            <div class="mt10">
                <let-table :data="traceidList" :empty-msg="$t('common.nodata')">
                    <let-table-column title="业务名称">
                        <template slot-scope="scope">
                            <let-table-operation @click="showDetail(scope.row.trace_id)">{{scope.row.trace_id}}</let-table-operation>  
                        </template>
                    </let-table-column>
                    <let-table-column title="产生时间" :sortable=true prop="timestamp"></let-table-column>
                    <let-table-column title="耗时(ms)" :sortable=true prop="duration"></let-table-column>
                </let-table>
            </div>
        </div>

        <!-- 调用链查询 -->
        <div v-if="showDuration">
            <h3><a href="javascript:;" class="link" @click="showDuration=false">调用链查询</a> / {{selectedTraceId}}</h3>
            <let-table stripe :data="traceDetailList" title="服务配置" :empty-msg="$t('common.nodata')">
                <let-table-column title="应用名">
                    <template slot-scope="scope">
                        <span :style="'margin-left:'+(scope.row.layer-1)*30+'px'">{{scope.row.server_endpoint_service_name}}</span>
                    </template>
                </let-table-column>
                <let-table-column title="IP" prop="server_endpoint_ipv4"></let-table-column>
                <let-table-column title="类型" prop="type"></let-table-column>    
                <let-table-column title="状态" prop="status">
                    <template slot-scope="scope">
                        <span v-if="scope.row.status==1">OK</span>
                        <span v-else>ERROR</span>
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
            traceId:'',
            start_time: '',
            end_time: '',
            traceidList: [],
            showDuration:null,
            selectedTraceId : null,
            traceDetailList : null,
            colorArr : ['#33cc59', '#fa5a4b', '#ffaa33', '#9a41d9', '#d99cee', '#71d2e7', '#e7d271']
        }
    },
    methods: {
        getTracesList() {
            const loading = this.$Loading.show();
            this.$ajax.getJSON('/server/api/get_trace_list',{
                id : this.traceId,
                start_time : this.start_time,
                end_time : this.end_time
            }).then(data => {
                loading.hide();
                this.traceidList = data;
            }).catch((err) => {
                loading.hide();
                this.$tip.error(`系统错误: ${err.message || err.err_msg}`);
            });
        },
        showDetail(id) {
            this.selectedTraceId = id;
            const loading = this.$Loading.show();
            this.$ajax.getJSON('/server/api/get_trace_detail', {
                id : id
            }).then(data =>{
                this.showDuration = true;
                loading.hide();
                let parentTimestamp = 0;
                let scale = 1;
                data.forEach(item => {
                    if(item.layer==1) {
                        parentTimestamp = item.timestamp;
                        item.marginLeft = 0;
                        if(item.duration > 300) {
                            scale = (300 / item.duration).toFixed(2);
                        }
                    }
                    item.scale = Number(scale);
                    item.marginLeft = (item.timestamp - parentTimestamp)*item.scale;
                    item.color = this.colorArr[item.layer-1];
                });
                this.traceDetailList = data;
            }).catch(err => {
                loading.hide();
                this.$tip.error(`系统错误: ${err.message || err.err_msg}`);
            });
        }
    },
    mounted() {
        this.getTracesList();
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
            width: 100%;
            height: 40px;
        }
        .link{color:#3f5ae0}
        .duration{
            display: inline-block;
            height: 10px;
            background-color: #33cc59;
            max-width: 300px;
            margin-right: 10px;
        }
    }
</style>

