<!--
* @date: 2021-11-05 13:50
* @description：节点详细信息查看
-->
<template>
    <div>
        <div>
            <span class="title">{{ nodeDetail.NodeName }}</span>
            <span style="margin-left: 10px">
                    <el-tag effect="plain" type="success" v-if="nodeDetail.status=='Active'">
                        {{ nodeDetail.status }}
                    </el-tag>
                    <el-tag effect="plain" type="danger" v-if="nodeDetail.status=='Unavailable'">
                        {{ nodeDetail.status }}
                    </el-tag>
                </span>
            <span style="float: right">
                     <el-button type="primary" icon="el-icon-back" size="small" @click="closeDetail"></el-button>
                </span>
        </div>
        <div style="margin-top: 10px">
            <span>Age:{{ getAge(nodeDetail.CreationTimestamp) }}</span>
        </div>
        <el-divider></el-divider>
        <div>
            <span v-for="item in nodeDetail.NodeAddress" class="item">{{ `${item.type}:${item.address}` }}</span>
            <span class="item">Version:{{ nodeDetail.NodInfo.kernelVersion }}</span>
            <span class="item">OS:{{ nodeDetail.NodInfo.osImage }}</span>
            <span class="item">containerRuntimeVersion:{{ nodeDetail.NodInfo.containerRuntimeVersion }}</span>
        </div>
        <div style="margin-top: 10px">
            Labels:
            <el-tag style="margin: 2px 2px" v-for="(item, key) in nodeDetail.Labels" :key="key"
                    effect="plain" :type="key|tagType">
                {{ key + ":" + item }}
            </el-tag>
        </div>
        <el-divider></el-divider>
        <div style="margin-top: 10px">
            Conditions:
            <el-tooltip placement="top" v-for="item in nodeDetail.Conditions" :key="item.type">
                <div slot="content">
                    <p style="margin: 4px 0;font-size: 12px" v-for="(value,key) in item" :key="key">
                        {{ `${key}:${value}` }}
                    </p>
                </div>
                <el-tag style="margin: 2px 15px" effect="dark" :type="item|conditionsStatus">
                    {{ item.type }}
                </el-tag>
            </el-tooltip>
            <el-row :gutter="20" style="margin-top: 20px">
                <el-col :span="8">
                    <el-card shadow="never">
                        <div slot="header" class="clearfix">
                            <span style="font-weight: bold">CPU</span>
                            <span style="float: right">0 of 4</span>
                        </div>
                        <el-progress :text-inside="true" :stroke-width="20" :percentage="1"></el-progress>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="never">
                        <div slot="header" class="clearfix">
                            <span style="font-weight: bold">MEMORY</span>
                            <span style="float: right">0 of 7.78 GiB </span>
                        </div>
                        <el-progress :text-inside="true" :stroke-width="20" :percentage="1"></el-progress>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="never">
                        <div slot="header" class="clearfix">
                            <span style="font-weight: bold">PODS</span>
                            <span style="float: right">8 of 110</span>
                        </div>
                        <el-progress :text-inside="true" :stroke-width="20" :percentage="7.3"></el-progress>
                    </el-card>
                </el-col>
            </el-row>
        </div>
        <el-divider></el-divider>
        <!--标签页-->
        <el-tabs type="border-card">
            <el-tab-pane label="Info">
                <el-form label-width="300px" label-position="left">
                    <div v-for="(value,key)  in nodeDetail.NodInfo" :key="key">
                        <el-form-item :label="key">
                            {{ value }}
                        </el-form-item>
                    </div>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="Images">
                <el-table ref="table" :data="nodeDetail.Images" border stripe highlight-current-row
                          height="400px">
                    <el-table-column label="names">
                        <template slot-scope="scope">
                            <p v-for="item in scope.row.names" :key="item">
                                {{item}}
                            </p>
                        </template>
                    </el-table-column>
                    <el-table-column label="size"  width="150">
                        <template slot-scope="scope">
                            {{`${Math.ceil(scope.row.sizeBytes/1024/1024)}M`}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="Taints">
                <el-table ref="table" :data="nodeDetail.Taints" border stripe highlight-current-row
                          height="400px">
                    <el-table-column label="effect" prop="effect" width="300"></el-table-column>
                    <el-table-column label="key" prop="key" ></el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="Conditions">
                <el-table ref="table" :data="nodeDetail.Conditions" border stripe highlight-current-row
                          height="400px">
                    <el-table-column label="type" prop="type" width="150"></el-table-column>
                    <el-table-column label="status" prop="status" width="80"></el-table-column>
                    <el-table-column label="message" prop="message"></el-table-column>
                    <el-table-column label="reason" prop="reason"></el-table-column>
                    <el-table-column label="lastTransitionTime" width="200">
                        <template slot-scope="scope">{{scope.row.lastTransitionTime|timeFormat}}</template>
                    </el-table-column>
                    <el-table-column label="lastHeartbeatTime" width="200">
                        <template slot-scope="scope">{{scope.row.lastHeartbeatTime|timeFormat}}</template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import moment from "moment"
export default {
    name: "node-detail",
    props: ["nodeDetail"],
    filters: {
        tagType(val) {
            if (val.startsWith("tars.io/node")) {
                return "warning"
            } else if (val.startsWith("tars.io/ability")) {
                return "success"
            } else {
                return ""
            }
        },
        conditionsStatus(val) {
            if (val.status == "False") {
                return "danger"
            } else {
                return "success"
            }
        },
        timeFormat(val){
            return moment(val).format("YYYY-MM-DD HH:mm:ss");
        }
    },
    methods: {
        closeDetail() {
            this.$emit("closeDetail")
        },

        getAge(createTimestamp) {
            //1.取小时数
            let hours = Math.ceil((new Date() - new Date(createTimestamp)) / (1000 * 60 * 60));
            let day = 0, hour = 0;
            if (hours >= 24) {
                day = Math.ceil(hours / 24)
                hour = hours % 24
            }
            return `${day}d${hour > 0 ? hour + "h" : ""}`;
        }
    }
}
</script>

<style scoped>
body {
    font: 20px "Fira Sans";
}

.title {
    font-size: 22px;
    color: #141419;
}

.item {
    margin: 0 20px 0 0
}
</style>
