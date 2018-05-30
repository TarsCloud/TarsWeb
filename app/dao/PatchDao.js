/**
 * Created by clauseliu on 2018/5/7.
 */

const {tServerPatchs} = require('./db').db_tars;

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
    }
};
