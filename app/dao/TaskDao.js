const {tTask,tTaskItem} = require('./db').db_tars;
tTask.belongsTo(tTaskItem,{foreignKey:'task_no',as:'taskItem',targetKey:'task_no'});

module.exports = {
    getTask : async(params) => {

        let whereObj = {};
        params.application && Object.assign(whereObj, {'$taskItem.application$' : params.application});
        params.server_name && Object.assign(whereObj, {'$taskItem.server_name$' : params.server_name});
        params.command && Object.assign(whereObj, {'$taskItem.command$' : params.command});
        if(params.from) {
            whereObj.create_time['$gte'] = params.from
        }
        if(params.to) {
            whereObj.create_time['$lte'] = params.to
        }

        return tTask.findAll({
            attribute:['task_no','serial','create_time'],
            order : [['create_time','desc']],
            where : whereObj,
            include : {
                model : tTaskItem,
                as:'taskItem'
            },
        });
    }
};
