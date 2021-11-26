<template>
    <el-card>
        <let-form v-if="k8sModel" ref="k8sDetailForm" itemWidth="360px" :columns="2" class="two-columns">
            <div v-if="mode=='copyNode'">
                <let-form-item :label="$t('deployService.table.th.replicas')">
                    <let-input
                        size="small"
                        type="number"
                        :min="0"
                        v-model="k8sModel.Replicas"
                        :placeholder="$t('deployService.form.placeholder')"
                        required
                        :required-tip="$t('deployService.table.tips.empty')"
                        :pattern-tip="$t('deployService.form.placeholder')"
                    ></let-input>
                </let-form-item>
            </div>

            <!--nodeSelect 节点选择-->
            <div  v-if="mode=='nodeSelect'">
                <let-form-item :label="$t('deployService.form.affinity')" itemWidth="45%">
                    <el-select v-model="k8sModel.abilityAffinity" size="small" style="width: 100%">
                        <el-option v-for="item in abilityAffinities" :key="item" :value="item">{{ item }}</el-option>
                    </el-select>
                </let-form-item>
                <let-form-item itemWidth="45%" v-if="labelMatchArr.length==0">
                    <el-button type="text" size="mini" @click="addItems(0,labelMatchArr)" style="margin-left: 20px">
                        {{$t('deployService.form.labelMatch.addLabel')}}
                    </el-button>
                </let-form-item>

                <!--labelMatch 标签-->
                <div v-for="(item,index) in labelMatchArr">
                    <let-form-item :label="$t('nodeList.table.th.label')" itemWidth="30%">
                        <let-input
                            size="small"
                            v-model="item.key"
                            :placeholder="$t('nodeList.table.th.label')"
                            :pattern-tip="$t('deployService.form.labelMatch.labelValid')"
                        ></let-input>
                    </let-form-item>
                    <let-form-item label="operator" itemWidth="15%">
                        <el-select v-model="item.operator" size="small" @change="changeLabelOperator">
                            <el-option v-for="item in LabelMatchOperator" :key="item" :value="item">{{ item }}</el-option>
                        </el-select>
                    </let-form-item>
                    <let-form-item :label="$t('nodes.label.value')" itemWidth="40%">
                        <el-select :disabled="item.disableValue" style="width: 95%"
                                   v-model="item.values" multiple filterable allow-create
                                   :multiple-limit="63" default-first-option
                                   :placeholder="$t('deployService.form.labelMatch.labelValue')" size="small"
                                   @change="(val)=>{addLabelValues(val, index)}">
                            <el-option
                                v-for="item in item.values" :key="item" :label="item" :value="item">
                            </el-option>
                        </el-select>
                    </let-form-item>
                    <el-button type="primary" icon="el-icon-plus" size="mini" circle
                               @click="addItems(index,labelMatchArr)"></el-button>
                    <el-button type="danger" icon="el-icon-minus" size="mini" circle
                               @click="delItems(index,labelMatchArr)"></el-button>
                </div>
            </div>
        </let-form>
        <el-row type="flex" justify="end" style="margin-top:15px">
            <el-col :span="2">
                <el-button size="mini" type="primary" @click="saveK8sDetail">{{ $t('operate.save') }}</el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<script>

export default {
    props: ["k8sModel", "labelMatchArr", "LabelMatchOperator","mode"],
    name: 'k8sManager',
    data() {
        return {
            serverId: '',
            K8SNodeList: [],
            K8SisCheckedAll: false,
            abilityAffinities: ["AppRequired", "ServerRequired", "AppOrServerPreferred", "None"]
        }
    },
    methods: {
        changeKind() {
            this.$forceUpdate()
        },
        adapterServerK8S(model) {
            let data = Object.assign({}, model)
            let labelMatchArr = this.labelMatchArr.map(item => {
                return {"key": item.key, "operator": item.operator, "values": item.values}
            });
            delete data.NodeSelector.nodeBind
            data.NodeSelector = labelMatchArr
            return data
        },
        // 保存 k8s
        saveK8sDetail() {
            if (this.$refs.k8sDetailForm.validate() && this.validateLabels(this.k8sModel)) {
                const loading = this.$Loading.show();
                let data = this.adapterServerK8S(this.k8sModel)
                this.$ajax.postJSON('/k8s/api/server_k8s_update', {
                    ServerId: data.ServerId,
                    Replicas: data.Replicas,
                    abilityAffinity: data.abilityAffinity,
                    NodeSelector: data.NodeSelector
                }).then((res) => {
                    loading.hide();
                    this.$message.success(`${this.$t('common.success')}`)
                }).catch((err) => {
                    loading.hide();
                    this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
                });

            }
        },
        validateLabels(data) {
            let flag = true
            if (data.NodeSelector.Kind === 'LabelMatch') {
                for (let item of this.labelMatchArr) {
                    if (item.key.trim() == "") {
                        this.$message.error(`${this.$t('deployService.form.labelMatch.errorKey')}`);
                        flag = false
                        break;
                    }
                    if ("Exists,DoesNotExist".indexOf(item.operator) == -1 && item.values.length == 0) {
                        this.$message.error(`${this.$t('deployService.form.labelMatch.errorValue')}`);
                        flag = false
                        break;
                    }
                }
                return flag
            } else {
                return true
            }
        },
        addLabelValues(val, index) {
            let reg = /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]?$/
            this.labelMatchArr[index].values.forEach((item, index) => {
                if (!reg.test(item)) {
                    this.labelMatchArr[index].values.splice(index, 1)
                    this.$message.error(`${this.$t('deployService.form.labelMatch.labelValueValid')}`);
                }
            })
        },
        changeLabelOperator(val) {
            this.labelMatchArr.forEach(item => {
                if (item.operator == "Exists" || item.operator == "DoesNotExist") {
                    this.$set(item, "disableValue", true)
                    this.$set(item, "values", [])
                } else {
                    this.$set(item, "disableValue", false)
                }
            })
        },
        addItems(index, obj) {
            if (obj.length >= 63) {
                this.$message.error(`${this.$t('deployService.form.labelMatch.labelMax')}`);
                return;
            }
            obj.splice(index + 1, 0, {"key": "", "operator": "In", "values": []})
            this.$forceUpdate();
        },
        delItems(index, obj) {
            obj.splice(index, 1);
            this.$forceUpdate();
        },
    }
}

</script>
