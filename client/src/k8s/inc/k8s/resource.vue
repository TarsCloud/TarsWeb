<!--资源管理-->
<template>
    <el-card>
        <el-form label-width="100px" label-position="top" size="mini">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item :label="$t('deployService.resources.limitCpu')" itemWidth="50%">
                        <el-input :placeholder="$t('deployService.resources.example')+':1000'"
                                  v-model="sourceModel.limitCpu" size="small"
                                  onkeyup="value=value.replace(/[^\d]/g,'')">
                            <template slot="append">milli CPUs</template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('deployService.resources.limitMem')" itemWidth="50%">
                        <el-input :placeholder="$t('deployService.resources.example')+':128'"
                                  v-model="sourceModel.limitMem" size="small"
                                  onkeyup="value=value.replace(/[^\d]/g,'')">
                            <template slot="append">MiB</template>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item :label="$t('deployService.resources.requestCpu')" itemWidth="50%">
                        <el-input :placeholder="$t('deployService.resources.example')+':1000'"
                                  v-model="sourceModel.requestCpu" size="small"
                                  onkeyup="value=value.replace(/[^\d]/g,'')">
                            <template slot="append">milli CPUs</template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('deployService.resources.requestMem')" itemWidth="50%">
                        <el-input :placeholder="$t('deployService.resources.example')+':128'"
                                  v-model="sourceModel.requestMem" size="small"
                                  onkeyup="value=value.replace(/[^\d]/g,'')">
                            <template slot="append">MiB</template>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row type="flex" justify="end">
                <el-col :span="2">
                    <el-button size="mini" type="primary" @click="save">{{ $t('operate.save') }}</el-button>
                </el-col>
            </el-row>
        </el-form>
    </el-card>
</template>

<script>
export default {
    props: ["sourceModel"],
    name: "resource",
    methods: {
        save() {
            this.$ajax.postJSON('/k8s/api/server_k8s_update_resource', this.sourceModel).then((res) => {
                this.$message.success(`${this.$t('common.success')}`)
            }).catch((err) => {
                this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
            });
        }
    }

}
</script>

<style scoped>

</style>
