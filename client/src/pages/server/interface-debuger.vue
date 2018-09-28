<template>
    <div class="page_server_debuger">
        <!-- tars文件列表 -->
        <wrapper v-if="!showDebug" ref="tarsFileListLoading">
        <let-button size="small" theme="primary" class="add-btn" @click="openTarsUploadFileModal">{{$t('operate.add')}}</let-button>

        <let-table :data="tarsFileList" :title="$t('inf.title.listTitle')" :empty-msg="$t('common.nodata')">
            <let-table-column :title="$t('deployService.form.app')" prop="application"></let-table-column>
            <let-table-column :title="$t('serverList.table.th.service')" prop="server_name"></let-table-column>
            <let-table-column :title="$t('cfg.btn.fileName')" prop="file_name"></let-table-column>
            <let-table-column :title="$t('cfg.btn.lastUpdate')" prop="posttime"></let-table-column>
            <let-table-column :title="$t('operate.operates')" width="260px">
            <template slot-scope="scope">
                <let-table-operation @click="showDebuger(scope.row)">{{$t('inf.list.debug')}}</let-table-operation>  
                <let-table-operation @click="deleteTarsFile(scope.row.f_id)">{{$t('operate.delete')}}</let-table-operation>
            </template>
            </let-table-column>
        </let-table>
        </wrapper>

        <div v-if="showDebug">
            <let-form class="left_align" itemWidth="530px">
                <let-form-item :label="$t('inf.dlg.selectLabel')">
                    <let-cascader :data="contextData" required  size="small" @change="getParams"></let-cascader>
                    
                </let-form-item>
                <let-form-item :label="$t('serverList.servant.objName')">
                    <let-input v-model="objName" required></let-input>
                </let-form-item>
                <let-form-item>
                    <let-button theme="primary" @click="doDebug">{{$t('inf.list.debug')}}</let-button>
                </let-form-item>
            </let-form>
            

            <!-- 入参输入框 -->
            <let-row>
                <div class="params_container">
                    <let-col :span="12" itemWidth="100%">
                        <let-form itemWidth="100%">
                            <let-input type="textarea" :rows="20" class="param_area div_line" v-model="inParam" :placeholder="$t('inf.dlg.inParam')"></let-input>
                        </let-form>
                    </let-col>
                    <let-col :span="12">
                        <let-form itemWidth="100%">
                            <let-input type="textarea" :rows="20" class="param_area" v-model="outParam" :placeholder="$t('inf.dlg.outParam')"></let-input>
                        </let-form>
                    </let-col>
                </div>
            </let-row>

            <div class="mt10">
                <let-button theme="primary" size="small" @click="showDebug=false">{{$t('operate.goback')}}</let-button>
            </div>
        </div>

        <!-- 上传tars文件弹出框 -->
        <let-modal
            v-model="uploadModal.show"
            :title="$t('inf.title.dlgTitle')"
            width="880px"
            :footShow="false"
            @on-cancel="closeUploadModal">
            <let-form
            v-if="uploadModal.model"
            ref="uploadForm"
            itemWidth="100%"
            @submit.native.prevent="uploadTarsFile">
                <let-form-item itemWidth="400px">
                <let-uploader
                    :placeholder="$t('pub.dlg.defaultValue')"
                    @upload="uploadFile" require>
                    {{$t('common.submit')}}</let-uploader>
                    <span v-if="uploadModal.model.file">{{uploadModal.model.file.name}}</span>
                </let-form-item>
                <let-button type="submit" theme="primary">{{$t('serverList.servant.upload')}}</let-button>
            </let-form>
        </let-modal>

    </div>
</template>


<script>
import wrapper from '@/components/section-wrappper';
export default {
    name : 'InterfaceDebuger',
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
            tarsFileList : [],

            uploadModal : {
                show : false,
                model : {}
            },

            showDebug : false,
            contextData : [],

            debuger_panel: false,
            inParam: '',
            outParam:'',
            selectedFileName: '',
            selectedMethods: [],
            objName : '',
            selectedId : '' 
        }
    },
    methods: {
        getFileList() {
            this.$ajax.getJSON('/server/api/get_file_list',{
                application : this.serverData.application,
                server_name : this.serverData.server_name
            }).then(data => {
                this.tarsFileList = data;
            })
        },
        openTarsUploadFileModal() {
            this.uploadModal.show = true;
            this.uploadModal.model = {
                application : this.serverData.application,
                server_name : this.serverData.server_name,
                set_name : this.serverData.set_name,
                file : null
            }
        },
        uploadFile(file) {
            this.uploadModal.model.file = file;
        },
        uploadTarsFile() {
            if(this.$refs.uploadForm.validate()) {
                const loading = this.$Loading.show();
                const formdata = new FormData();
                formdata.append('application', this.uploadModal.model.application);
                formdata.append('server_name', this.uploadModal.model.server_name);
                formdata.append('set_name', this.uploadModal.model.set_name);
                formdata.append('suse', this.uploadModal.model.file);
                this.$ajax.postForm('/server/api/upload_tars_file', formdata).then(() => {
                    loading.hide();
                    this.getFileList();
                    this.uploadModal.show = false;
                    this.uploadModal.model = null;
                }).catch((err) => {
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }
        },
        closeUploadModal() {
            this.uploadModal.show = false;
        },
        showDebuger(row) {
            this.showDebug = true;
            this.selectedFileName = row.file_name;
            this.inParam = null;
            this.outParam = null;
            this.selectedId = row.f_id;
            this.objName = null;
            this.getContextData(row.f_id);
        },
        getContextData(id) {
            this.$ajax.getJSON('/server/api/get_contexts', {
                id : id,
                application : this.serverData.application,
                server_name : this.serverData.server_name,
                type : 'all'
            }).then(data => {
                this.contextData = data;
            }).catch((err) => {
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        deleteTarsFile(id) {
            this.$confirm(this.$t('inf.dlg.deleteMsg'), this.$t('common.alert')).then(()=>{
                const loading = this.$Loading.show();
                this.$ajax.getJSON('/server/api/delete_tars_file', {
                    id : id
                }).then(data => {
                    loading.hide();
                    this.getFileList();
                }).catch(err=>{
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }).catch(()=>{

            });
        },
        getParams(value) {
            this.selectedMethods = value;
            if(value.length ==3) {
                const loading = this.$Loading.show();
                this.$ajax.getJSON('/server/api/get_params', {
                    application : this.serverData.application,
                    server_name : this.serverData.server_name,
                    id : this.selectedId,
                    module_name : value[0],
                    interface_name : value[1],
                    function_name : value[2]
                }).then(data => {
                    loading.hide();
                    let obj = {};
                    data.forEach(item => {
                        if(!item.out) {
                            if(item.type === 'string') {
                                obj[item.name] = '';
                            }else if(item.type === 'array') {
                                obj[item.name] = [];
                            }else{
                                obj[item.name] = '';
                            }
                        }
                    });
                    this.inParam = JSON.stringify(obj);
                }).catch((err) => {
                    loading.hide();
                    this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
                });
            }
        },
        doDebug() {
            const loading = this.$Loading.show();
            this.$ajax.postJSON('/server/api/interface_test', {
                id: this.selectedId,
                application : this.serverData.application,
                server_name : this.serverData.server_name,
                file_name : this.selectedFileName,
                module_name : this.selectedMethods[0],
                interface_name : this.selectedMethods[1],
                function_name : this.selectedMethods[2],
                params : this.inParam,
                objName : this.objName
            }).then(data => {
                loading.hide();
                this.outParam = data;
            }).catch((err) => {
                loading.hide();
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        }
    },
    created() {
        this.serverData = this.$parent.getServerData();
    },
    mounted() {
        this.getFileList();
    }
}
</script>

<style>
@import '../../assets/css/variable.css';
    .page_server_debuger{
        .add-btn {
            position: absolute;
            right: 0;
            top: 0;
            z-index: 2;
        }
        .mt10{margin-top:10px}
        .param_area textarea{border:none !important;}
        .params_container{
            border:1px solid #c0c4cc;
            overflow: hidden;
            border-radius: 5px;
        }
        .div_line{
            border-right: 1px solid #e4e9f2;
        }
        .left_align{margin-left:-15px;}
    }
</style>

