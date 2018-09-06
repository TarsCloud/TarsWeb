<template>
    <div class="page_server_call_chain">
        <wrapper v-if="!showTimeout">
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
                <let-table-column title="业务名称" :sortable=true>
                    <template slot-scope="scope">
                        <let-table-operation>{{scope.row.id}}</let-table-operation>  
                    </template>
                </let-table-column>
                <let-table-column title="产生时间" :sortable=true prop="create_time"></let-table-column>
                <let-table-column title="耗时" :sortable=true prop="use_time"></let-table-column>
            </let-table>
        </div>
        </wrapper>
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
            showTimeout:null
        }
    },
    methods: {
        getTracesList() {
            const loading = this.$Loading.show();
            this.$ajax.getJSON('/server/api/get_trace_list',{
                id : this.traceId || null,
                start_time : this.start_time || null,
                end_time : this.end_time || null
            }).then(data => {
                loading.hide();
                this.traceidList = data;
            }).catch((err) => {
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
    }
</style>

