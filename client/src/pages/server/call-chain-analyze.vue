<template>
    <div class="call-chain-analyze">
        <let-row>
            <input class="custom_input" v-model="serviceName" @keyup.enter="showCallChainDetail" placeholder="请输入服务名"/>
            <let-button theme="primary" @click="showCallChainDetail">查询</let-button>
        </let-row>
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
            serviceName : ''
        }
    },
    methods : {
        showCallChainDetail() {
            console.info(this.serviceName);
        }
    },
    created() {
        this.serverData = this.$parent.getServerData();
        const treeArr = this.$route.params.treeid.split('.');
        let serviceName = treeArr.map(item => {
            return item.substr(1);
        });
        this.serviceName = serviceName.join('.');
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
    }
</style>

