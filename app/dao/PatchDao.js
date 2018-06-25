const {tServerPatchs} = require('./db').db_tars;
const {tCodeInterfaceConf, tPatchTask} = require('./db').db_tars_web;

module.exports = {
    insertServerPatch : async(params) => {
        return await tServerPatchs.create(params);
    },

    insertPatchTask : async(params) => {
        return await tPatchTask.create(params);
    },

    getServerPatch : async(server, curPage, pageSize) => {
        var opts = {
            order : [
                ['id','desc']
            ],
            where : {
                server  :   server
            }
        };
        if(curPage && pageSize){
            Object.assign(opts,{
                limit: pageSize,
                offset: pageSize * (curPage - 1)
            })
        }
        return await tServerPatchs.findAll(opts);
    },

    getServerPatchByPkgName : async(name) => {
        return await tServerPatchs.findOne({
            where : {
                tgz : name
            },
            raw : true
        });
    },

    getPackageByTaskId : async (taskId) => {
        return await tPatchTask.findOne({
            where : {
                task_id : taskId
            },
            raw : true
        });
    },

    getCodeInfConf : async(app, module_name) => {
        return await tCodeInterfaceConf.findOne({
            where : {
                server : `${app}.${module_name}`
            },
            raw: true
        });
    },

    setCodeInfConf : async(params) => {
        return await tCodeInterfaceConf.upsert({
            server : `${params.application}.${params.module_name}`,
            path : params.path
        },{
            server : `${params.application}.${params.module_name}`
        });
    }
};
