<template>
    <div>
        <let-form ref="addForm" inline itemWidth="400px" @submit.native.prevent="addItem">
            <let-form-item :label="$t('gateway.gatewayObj')" required>
                <let-input size="small" 
                v-model="form.gatewayObj"
                placeholder="eg:Base.GatewayServer.FlowControlObj"
                required
                required-tip="please input gateway flowcontrol obj"
                ></let-input>
            </let-form-item>
            <let-form-item>
                <let-button size="small" type="submit" theme="primary">{{$t('operate.add')}}</let-button>
            </let-form-item>
            <let-form-item></let-form-item>
        </let-form>
        <let-table ref="table" :data="objList" :empty-msg="$t('common.nodata')">
            <let-table-column :title="$t('gateway.gatewayObj')" prop="obj"></let-table-column>
            <let-table-column :title="$t('operate.operates')" width="200px">
                <template slot-scope="scope">
                    <let-table-operation @click="emitConfig(scope.row)">{{$t('operate.config')}}</let-table-operation>
                    <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
                </template>
            </let-table-column>
        </let-table>
    </div>
</template>
<script>
export default {
    name:"GatewayObjList",
    props: {
    },
    data(){
        return {
            form:{
                gatewayObj:""
            },
            items: [],
            gatewayObjList:[],
        }
    },
    methods:{
        fetchData() {
            //const loading = this.$refs.table.$loading.show();
            return this.$ajax.getJSON('/server/api/gatewayobj_list', {}).then((data) => {
                //loading.hide();
                this.gatewayObjList = data
            }).catch((err) => {
                //loading.hide();
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        emitConfig(row){
            localStorage.setItem("gatewayObj", row.obj)
            this.$emit("config", row.obj)
        },
        addItem(){
            if (this.$refs.addForm.validate()) {
                const model = this.form;
    
                const url ='/server/api/add_gatewayobj';
                const loading = this.$Loading.show();
                this.$ajax.postJSON(url, model).then(() => {
                    loading.hide();
                    this.$tip.success(this.$t('common.success'));
                    this.form.gatewayObj = ""
                    this.fetchData();
                }).catch((err) => {
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }
        },
        removeItem(item){
            this.$confirm("delete this gateway?", this.$t('common.alert')).then(() => {
                const loading = this.$Loading.show();
                this.$ajax.postJSON('/server/api/delete_gatewayobj', {gatewayObj: item.obj}).then(() => {
                    loading.hide();
                    this.fetchData().then(() => {
                        this.$tip.success(this.$t('common.success'));
                    });
                }).catch((err) => {
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }).catch(() => {});
        }
    },
    computed: {
        objList(){
            return this.gatewayObjList.map((item)=>{
                return {obj: item}
            })
        }
    },
    watch: {
    },
    mounted() {
        this.fetchData();
    },
}
</script>
<style scoped lang="postcss">

</style>