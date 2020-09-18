const InfTestDao = require('../../dao/InfTestDao');
const { benchmarkPrx, benchmarkStruct, benchmarkNodeStruct} = require('../util/rpcClient');

//TODO:协议中增加返回值枚举，替换此处硬编码
const RetMap = {
    "0":"success",
    "-1":"unhnow exception",
    "-2":"param error",
    "-10001":"can not find this task",
    "-10002":"server is not running",
    "-10003":"start failed",
    "-10004":"stop failed",
    "-10005":"encode failed",
    "-10006":"decode failed",
    "-10007":"socket error",
    "-10008":"error task",
    "-20001":"error, is running",
    "-20002":"resource is not enough",
    "-20003":"mismatch between case parameters and input values",
    "-20004":"unreasonable links number (integer, and not more than 500 times)",
    "-20005":"the target server is not configured correctly",
}

class BenchmarkRunner{
    constructor(fnInfo){
        this._caseId = fnInfo.caseId
        this._servant = fnInfo.servant
        this._fn = fnInfo.fn
        this._fnInfo = fnInfo
        this._queryInterval = 5000
        this._timer = null
        this._endTimer = null
    }
    //启动压测， 只有该servant+fn的case全部是stopped状态的才应该启动
    //若可以启动，更新状态
    //调用压测代理，启动成功时，清空历史结果，开启定时器；启动失败时，还原status状态
    async start(){
        //判断是否可以启动，并设置状态为start
        let transaction = await InfTestDao.sequelize.transaction();
        try{
            let isRunning = await InfTestDao.isBmCaseRunning(this._servant, this._fn, transaction)
            if(isRunning){
                throw new Error(`the function is already running(case:${isRunning.des})!`)
            }
            await InfTestDao.startBenchmark(this._caseId, transaction)
            await transaction.commit()
        } catch(e){
            await transaction.rollback()
            throw e
        }
        //调用压测代理，启动压测
        try{
            let stReq = new benchmarkStruct.BenchmarkUnit()
            stReq.readFromObject({
                owner:this._fnInfo.owner,
                servant:this._servant,
                rpcfunc:this._fn,
                para_input:this._fnInfo.para_input,
                para_value: this._fnInfo.para_value,
                endpoints:this._fnInfo.endpoints.split(/\n|,|\r\n|<br>/),
                links:this._fnInfo.links,
                speed:this._fnInfo.speed,
                duration: this._fnInfo.duration,
                proto:"json"
            })
            let data = await benchmarkPrx.startup(stReq)
            let ret = data.__return
            if(ret!=0){
                await InfTestDao.stopBenchmark(this._caseId)
                throw new Error(`failed: ${RetMap[ret]}`)
            }
            //开始压测成功
            await InfTestDao.clearBenchmarkResult(this._caseId)
            //启动定时器，定时拉取结果并写入db
            this._timer = setInterval(()=>{
                this.query()
            },this._queryInterval)
            //超时重置
            this._endTimer = setTimeout(()=>{
                clearInterval(this._timer)
                InfTestDao.stopBenchmark(this._caseId)
            }, this._fnInfo.duration*1000+10000)
        } catch(e){
            await InfTestDao.stopBenchmark(this._caseId)
            throw e
        }
    }

    //拉取压测结果，拉取前判断状态，如果是停止状态，则不再拉取，清除定时器
    //若拉取成功，有结果则将结果写入结果数组，无结果了则更新db状态，设置为结束
    async query(){
        try{
            let running = await InfTestDao.isBmCaseRunning(this._servant, this._fn)
            if(!running || running.id != this._caseId){
                clearInterval(this._timer)
                clearInterval(this._endTimer)
                return
            }
            let stReq = new benchmarkStruct.BenchmarkUnit()
            stReq.readFromObject({
                servant: this._servant,
                rpcfunc: this._fn,
                proto: "json"
            })
            let data = await benchmarkPrx.query(stReq)
            // console.log(" query response data:", stReq.toObject(), data)
            let ret = data.__return
            //更新结果或者设置状态为停止
            if(ret == 0){
                await InfTestDao.addBenchmarkResult(this._caseId, data.stat)
            } else if(ret == benchmarkNodeStruct.BMErrCode.BM_ADMIN_ERR_NOTFIND || ret == benchmarkNodeStruct.BMErrCode.BM_ADMIN_ERR_RUNNING){
                clearInterval(this._timer)
                clearInterval(this._endTimer)
                await InfTestDao.stopBenchmark(this._caseId)
            }
        } catch(e){
        }
    }

    async stop(){
        let isRunning = await InfTestDao.isBmCaseRunning(this._servant, this._fn)
        if(isRunning){
            let stReq = new benchmarkStruct.BenchmarkUnit()
            stReq.readFromObject({
                servant: this._servant,
                rpcfunc: this._fn,
                proto: "json"
            })
            let data = await benchmarkPrx.shutdown(stReq)
            let ret = data.__return
            if(ret == 0){
                await InfTestDao.stopBenchmark(this._caseId)
            } else{
                throw new Error(`failed: ${RetMap[ret]}`)
            }
        } else {
            await InfTestDao.stopBenchmark(this._caseId)
        }
    }

    async test(){
        let stReq = new benchmarkStruct.BenchmarkUnit()
        stReq.readFromObject({
            owner:this._fnInfo.owner,
            servant:this._servant,
            rpcfunc:this._fn,
            para_input:this._fnInfo.para_input,
            para_value:this._fnInfo.para_value,
            paralist: [this._fnInfo.para_output],
            endpoints:this._fnInfo.endpoints.split(/\n|,|\r\n|<br>/),
            proto:"json"
        })
        let data = await benchmarkPrx.test(stReq)
        let ret = data.__return
        if(ret!=0){
            throw new Error(`failed: ${RetMap[ret]}`)
        }
        return data
    }
}

module.exports = {
    BenchmarkRunner
}