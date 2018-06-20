/**
 * Created by clauseliu on 2018/5/7.
 */

const {tServerPatchs} = require('./db').db_tars;
const {tThirdcompileConf} = require('./db').db_tars_web;

module.exports = {
    insertServerPatch : async(params) => {
        return await tServerPatchs.create(params);
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

    getServerPatchByTaskId : async(taskId) => {
        return await tServerPatchs.findOne({
            where : {
                task_id : taskId
            },
            raw : true
        });
    },

    getCompilerUrl : async() => {
        return await tThirdcompileConf.findOne({
            raw: true
        });
    },

    setCompilerUrl : async(tagList, compiler, task) => {
        let ret = await tThirdcompileConf.findOne({raw:true});
        if(!ret) {
            return await tThirdcompileConf.create({
                f_taglist_uri : tagList,
                f_compile_uri : compiler,
                f_compile_task_uri : task
            });
        }else {
            return await tThirdcompileConf.update({
                f_taglist_uri : tagList,
                f_compile_uri : compiler,
                f_compile_task_uri : task
            },{
                where : {f_id : 1}
            });
        }
    }
};
