<template>
    <el-card shadow="never">
        <let-form
            v-if="k8sModel"
            ref="k8sDetailForm" itemWidth="360px" :columns="2" class="two-columns">
            <div>
                <div>
                    <let-form-item :label="$t('deployService.table.th.hostIpc')" itemWidth="25%">
                        <el-radio-group v-model="k8sModel.HostIpc" @change="changeKind">
                            <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                            <el-radio :label="false">{{ $t('common.false') }}</el-radio>
                        </el-radio-group>
                    </let-form-item>
                    <let-form-item :label="$t('deployService.table.th.hostNetwork')" itemWidth="25%">
                        <el-radio-group v-model="k8sModel.HostNetwork" @change="changeKind">
                            <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                            <el-radio :label="false">{{ $t('common.false') }}</el-radio>
                        </el-radio-group>
                    </let-form-item>
                    <let-form-item :label="$t('deployService.table.th.hostPort')" itemWidth="25%">
                        <el-radio-group v-model="k8sModel.showHostPort" @change="changeKind">
                            <el-radio :label="true">{{ $t('common.true') }}</el-radio>
                            <el-radio :label="false">{{ $t('common.false') }}</el-radio>
                        </el-radio-group>
                    </let-form-item>
                </div>
                <div v-if="k8sModel.showHostPort" style="padding-right:30px;">
                    <let-table :data="k8sModel.HostPortArr">
                        <let-table-column title="OBJ">
                            <template slot="head" slot-scope="props">
                                <span class="required">{{ props.column.title }}</span>
                            </template>
                            <template slot-scope="props">
                                <let-input
                                    size="small"
                                    v-model="props.row.obj"
                                    :placeholder="$t('deployService.form.placeholder')"
                                    required
                                    :required-tip="$t('deployService.form.objTips')"
                                    pattern="^[a-zA-Z0-9]+$"
                                    :pattern-tip="$t('deployService.form.placeholder')"
                                ></let-input>
                            </template>
                        </let-table-column>
                        <let-table-column :title="$t('deployService.table.th.hostPort')">
                            <template slot="head" slot-scope="props">
                                <span class="required">{{ props.column.title }}</span>
                            </template>
                            <template slot-scope="props">
                                <let-input size="small" type="number" :min="1" :max="65535"
                                           v-model="props.row.HostPort" placeholder="1-65535"
                                           required :required-tip="$t('deployService.table.tips.empty')"
                                ></let-input>
                            </template>
                        </let-table-column>
                        <let-table-column>
                            <template slot-scope="props">
                                <let-button size="small" theme="primary" class="port-button"
                                            @click="generateHostPort(props.row)">
                                    {{ $t('deployService.table.th.checkHostPort') }}
                                </let-button>
                            </template>
                        </let-table-column>
                    </let-table>
                </div>
            </div>
        </let-form>
        <el-row type="flex" justify="end">
            <el-col :span="2">
                <el-button size="mini" type="primary" @click="saveK8sDetail">{{ $t('operate.save') }}</el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<script>

export default {
    props: ["k8sModel"],
    name: 'k8sManager',
    data() {
        return {
            serverId: '',
            K8SisCheckedAll: false,
        }
    },
    mounted() {
    },
    methods: {
        changeKind() {
            this.$forceUpdate()
        },
        adapterServerK8S(model) {
            let data = Object.assign({}, model)
            if (data.HostNetwork && data.showHostPort) {
                return this.$message.error(`${this.$t('deployService.form.portOrNetWork')}`)
            }
            if (data.showHostPort) {
                data.HostPort = []
                if (data.HostPortArr) {
                    data.HostPortArr.forEach(item => {
                        data.HostPort.push({
                            "NameRef": item.obj,
                            "Port": Math.floor(item.HostPort)
                        })
                    })
                }
            }
            return data
        },
        saveK8sDetail() {
            if (this.$refs.k8sDetailForm.validate()) {
                const loading = this.$Loading.show();
                let data = this.adapterServerK8S(this.k8sModel)
                this.$ajax.postJSON('/k8s/api/server_k8s_update_network', data).then((res) => {
                    loading.hide();
                    this.$message.success(`${this.$t('common.success')}`)
                }).catch((err) => {
                    loading.hide();
                    this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
                });
            }
        },


        // 自动生成端口
        generateHostPort(hostPort) {
            this.$ajax.getJSON("/k8s/api/check_host_port", {
                NodePort: hostPort.HostPort
            }).then((res) => {
                let msg = ""
                res.forEach(item => {
                    if (item.ret == -1) {//telnet 不通
                        msg += `<p>${item.node}:${item.port}: can use</p>`
                    } else {
                        msg += `<p style="color: #F56C6C">${item.node}:${item.port}: cannot use</p>`
                    }
                })
                this.$message.success({
                    dangerouslyUseHTMLString: true,
                    message: msg,
                });
            }).catch((err) => {
                this.$message.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            })
        },
    }
}

</script>
