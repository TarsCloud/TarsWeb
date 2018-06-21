/**
 * Created by clauseliu on 2018/5/7.
 */

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

    getCompilerUrl : async(app, module_name) => {
        return await tCodeInterfaceConf.findOne({
            where : {
                server : `${app}.${module_name}`
            },
            raw: true
        });
    },

    setCompilerUrl : async(tagList, compiler, task) => {
        let ret = await tCodeInterfaceConf.findOne({raw:true});
        if(!ret) {
            return await tCodeInterfaceConf.create({
                f_taglist_uri : tagList,
                f_compile_uri : compiler,
                f_compile_task_uri : task
            });
        }else {
            return await tCodeInterfaceConf.update({
                f_taglist_uri : tagList,
                f_compile_uri : compiler,
                f_compile_task_uri : task
            },{
                where : {f_id : 1}
            });
        }
    }
};
