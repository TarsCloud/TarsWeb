<!--磁盘挂载管理-->
<template>
    <el-card shadow="never">
        <div v-if="mounts.length==0">
            <el-button type="text" size="mini" @click="addDisk(0,mounts)" style="margin-left: 20px">
                {{$t("deployService.disk.addDisk")}}
            </el-button>
        </div>
        <el-form label-position="top" label-width="120px" size="mini" ref="disk">
            <div v-for="(disk,index) in mounts" :key="index">
                <el-card>
                    <el-row :gutter="22">
                        <el-col :span="10">
                            <el-form-item :label="$t('deployService.disk.diskName')" required>
                                <el-input v-model="disk.name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item :label="$t('deployService.disk.path')" required>
                                <el-input v-model="disk.mountPath"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="22">
                        <el-col :span="7">
                            <el-form-item label="uid" required>
                                <el-input v-model="disk.source.tLocalVolume.uid" placeholder="0"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="gid" required>
                                <el-input v-model="disk.source.tLocalVolume.gid" placeholder="0"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="mode" required>
                                <el-input v-model="disk.source.tLocalVolume.mode" placeholder="755"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :offset="18">
                            <el-button type="primary" size="mini" @click="addDisk(index,mounts)">
                              {{$t("deployService.disk.addDisk")}}
                            </el-button>
                            <el-button type="danger" size="mini" @click="delDisk(index,mounts)" style="margin-left: 20px">
                              {{$t("deployService.disk.delDisk")}}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </div>
            <el-row type="flex" justify="end" style="margin-top:15px">
                <el-col :span="2">
                    <el-button size="mini" type="primary" @click="save">{{ $t('operate.save') }}</el-button>
                </el-col>
            </el-row>
        </el-form>
    </el-card>
</template>

<script>
export default {
    props: ["k8sModel", "mounts"],
    name: "disk",
    methods: {
        validate() {

        },
        save() {
            if (this.validate) {
                const loading = this.$Loading.show();
                this.$ajax.postJSON('/k8s/api/server_k8s_update_disk', {
                    ServerId: this.k8sModel.ServerId,
                    mounts: this.mounts
                }).then((res) => {
                    loading.hide();
                    this.$message.success(`${this.$t('common.success')}`)
                }).catch((err) => {
                    loading.hide();
                    this.$message.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
                });
            }
        },
        addDisk(index, obj) {
            obj.splice(index + 1, 0, {
                name: "",
                source: {tLocalVolume: {uid: "", gid: "", mode: ""}},
                mountPath: ""
            })
            this.$forceUpdate();
        },
        delDisk(index, obj) {
            obj.splice(index, 1);
            this.$forceUpdate();
        },
    }
}
</script>

<style scoped>

</style>
