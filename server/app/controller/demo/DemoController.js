/**
 * Created by denisfan on 2018/4/8.
 */

const Demo = require('../../service/demo/Demo');
const DemoController = {

}

DemoController.index = async (ctx) => {
    await ctx.render('index', {
        title: 'tars title#common.servername#',
        a: ctx.paramsObj.a || '',
    });
}

DemoController.getJson = async(ctx) =>{
    var id = ctx.paramsObj.id || '';
    try{
        ctx.makeResObj(200, '', {
            id: id,
            name: 'denisfan',
            title: 'this is test'
        });
    }catch(e){
        ctx.makeResObj(500, e.toString());
    }
}

DemoController.getSqlData = async (ctx) =>{
    try{
        ctx.makeResObj(200, '', await Demo.getSqlData());
    }catch(e){
        ctx.makeResObj(500, e.toString());
    }
};

DemoController.insertSqlData = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', await Demo.inserSqlData());
    }catch(e){
        ctx.makeResObj(500, e.toString());
    }
};

DemoController.getRpcData = async(ctx) =>{
    try{
        ctx.makeResObj(200, '', await Demo.getRpcData());
    }catch(e){
        ctx.makeResObj(500, e.toString());
    }

};

module.exports = DemoController;