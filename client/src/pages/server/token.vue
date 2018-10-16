<template>
    <div class="page-token">
        <wrapper>
            <let-button size="small" theme="primary" class="add-btn" @click="showAddTokenDlg">{{$t('token.list.add')}}</let-button>
            <let-table :data="tokenList" :title="$t('token.title.listTitle')" :empty-msg="$t('common.nodata')">
                <let-table-column :title="$t('token.title.called')" prop="sObjName"></let-table-column>
                <let-table-column :title="$t('token.title.call')" prop="call"></let-table-column>
                <let-table-column title="Token" prop="token"></let-table-column>
                <let-table-column width="100px" :title="$t('operate.operates')">
                    <template slot-scope="scope">
                        <let-table-operation @click="deleteToken(scope.row)">{{$t('operate.delete')}}</let-table-operation>
                    </template>
                </let-table-column>
            </let-table>
        </wrapper>

        <let-modal v-model="addTokenModal.show" :title="$t('token.list.add')"
            width="500px"
            @close="addTokenModal.show=false"
            @on-cancel="addTokenModal.show=false"
            @on-confirm="addToken"
        >
            <let-form ref="tokenForm"  itemWidth="100%">
                <let-form-item :label="$t('token.dlg.called')" required>
                    <let-select v-model="addTokenModal.objName" size="small" required>
                        <let-option v-for="item in addTokenModal.objList" :key="item.servant" :value="item.servant"></let-option>
                    </let-select>
                </let-form-item>
                <let-form-item :label="$t('token.dlg.call')" required>
                    <let-input
                        size="small"
                        v-model="addTokenModal.callServer"
                        :placeholder="$t('serverList.servant.appService')"
                        pattern="^[A-Za-z]+\.[a-zA-Z]([a-zA-Z0-9]+)?$"
                        :pattern-tip="$t('token.dlg.patternTip')"
                        required
                    ></let-input>
                </let-form-item>
            </let-form>
        </let-modal>


    </div>
</template>


<script>
import wrapper from '@/components/section-wrappper';
export default {
    name: 'Token',
    components: {
        wrapper,
    },
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
            tokenList: [],
            addTokenModal:{
                show : false,
                objName : '',
                objList : [],
                callServer : ''
            }
        }
    },
    methods:{
        showAddTokenDlg(){
            this.addTokenModal.show = true;
        },
        getObjList() {
            return this.$ajax.getJSON('/server/api/all_adapter_conf_list', {
                application : this.serverData.application,
                server_name : this.serverData.server_name,
            }).then(data => {
                if(data.length){
                    this.addTokenModal.objList = data;
                    this.addTokenModal.objName = data[0].servant;
                }
            }).catch(err=>{
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        addToken() {
            if (this.$refs.tokenForm.validate()) {
                let callServer = this.addTokenModal.callServer.split('.');
                let param = {
                    application : callServer[0],
                    server_name : callServer[1],
                    called_obj_name : this.addTokenModal.objName
                }
                const loading = this.$Loading.show();
                this.$ajax.getJSON('/server/api/apply_token',param).then(data=>{
                    loading.hide();
                    this.addTokenModal.show = false;
                    this.getTokenList();
                }).catch(err=>{
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }
        },
        deleteToken(row) {
            this.$confirm(this.$t('inf.dlg.deleteMsg'), this.$t('common.alert')).then(()=>{
                const loading = this.$Loading.show();
                let callServer = row.call.split('.');
                this.$ajax.getJSON('/server/api/delete_token', {
                    application : callServer[0],
                    server_name : callServer[1],
                    called_obj_name : row.sObjName
                }).then(data=>{
                    loading.hide();
                    this.getTokenList();
                }).catch(err=>{
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                })
            }).catch()    
        },
        getTokenList() {
            const loading = this.$Loading.show();
            let objs = this.addTokenModal.objList.map(item => item.servant);
            this.$ajax.getJSON('/server/api/get_tokens',{
                objName : objs
            }).then(data=>{
                loading.hide();
                let ret = data.value.filter(n=> JSON.stringify(n.mTokens.value)!='{}');
                let newArr = [];
                ret.forEach(item => {
                    for(let i in item.mTokens.value){
                        newArr.push({
                            sObjName : item.sObjName,
                            call : i,
                            token : item.mTokens.value[i]
                        });
                    }
                });
                this.tokenList = newArr;
            }).catch(err=>{
                loading.hide();
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        }
    },
    created() {
        this.serverData = this.$parent.getServerData();
    },
    mounted() {
        this.getObjList().then(()=>{
            this.getTokenList();
        });
    },
}
</script>

<style>
.page-token{
    .add-btn {
        position: absolute;
        right: 0;
        top: 0;
        z-index: 2;
    }
}
</style>

