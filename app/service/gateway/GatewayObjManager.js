/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
const fs = require("fs")
const path = require("path")
const TarsRpc = require("@tars/rpc")
const _ = require('lodash')
const Base = require("./FlowControlProxy").Base
const Sequelize = require('sequelize')
const GatewayDao = require('../../dao/GatewayDao')

class DbObj{
    constructor(gatewayObj, dbname, dbhost, dbport, dbObj){
        this.gatewayObj = gatewayObj
        this.dbname = dbname
        this.dbhost = dbhost
        this.dbport = dbport
        this.dbObj = dbObj
    }
}

class GatewayObjManager{
    constructor(){
        this.proxyMap = {}
        this.dbMap = {}
    }
    async getDb(user, gatewayObj){
        try{
            let proxy = this._getClientProxy(gatewayObj)
            let dbConf = await this._queryDbInfo(user, gatewayObj, proxy)
            let dbObj = await this._getDbObj(gatewayObj, dbConf)
            return dbObj
        } catch(e){
            if(e.response && e.response.error){
                throw new Error(`${e.response.error.code}:${e.response.error.message}`)
            }
            throw e
        }
    }

    //检查缓存中是否有此obj的clientProxy，若有，则返回；若没有，则创建，并返回
    _getClientProxy(gatewayObj){
        if(this.proxyMap[gatewayObj]) return this.proxyMap[gatewayObj]
        let proxy = TarsRpc.client.stringToProxy(Base.FlowControlProxy, gatewayObj)
        proxy.setTimeout(3000)
        return proxy
    }

    //rpc查询db信息，若成功，则缓存proxyObj，并将gatewayObj存入db
    async _queryDbInfo(user, gatewayObj, proxy){
        let data = await proxy.getGWDB()
        if(data.response.return != 0) throw new Error(`query gateway db info error return:${data.response.return}`)
        //此时查询db信息成功，证明是一个合法的gatewayObj，将其信息存入db
        if(!this.proxyMap[gatewayObj]){
            await GatewayDao.upsertGatewayObj(user, gatewayObj)
            this.proxyMap[gatewayObj] = proxy
        }
        return data.response.arguments.dbConf.toObject()
    }
    //检查缓存中是否有sequelize的db连接对象，按servantObj、db信息校验。若有，则使用，若没有，则创建连接测试，测试成功缓存dbObj
    async _getDbObj(gatewayObj, dbConf){
        //检查缓存
        if(this.dbMap[gatewayObj]){
            let dbObj = this.dbMap[gatewayObj]
            if(dbObj.dbname == dbConf.dbname && dbObj.dbhost == dbConf.dbhost && dbObj.dbport == dbConf.dbport) return dbObj.dbObj
        }
        //创建连接对象
        const sequelize = new Sequelize(dbConf.dbname, dbConf.dbuser, dbConf.dbpass, {
            host: dbConf.dbhost,
            port: dbConf.dbport,
            dialect: 'mysql',
            dialectOptions: {
                charset: dbConf.charset
            },
            logging: false,
            timezone: (() => {
                let offset = 0 - new Date().getTimezoneOffset();
                return (offset >= 0 ? '+' : '-') + (Math.abs(parseInt(offset/60)) + '').padStart(2, '0') + ':' + (offset%60 + '').padStart(2, '0');
            })()
        })
        //测试连接
        await sequelize.authenticate()
        //导入表
        let dbObj = {}
        let dbModelsPath = path.resolve(__dirname, "../../dao/db/db_base_models")
        let dbModels = fs.readdirSync(dbModelsPath);
        dbModels.forEach(function (dbModel) {
            let tableName = dbModel.replace(/\.js$/g, '');
            dbObj[_.camelCase(tableName)] = sequelize.import(dbModelsPath + '/' + tableName);
            dbObj[_.camelCase(tableName)].sync({ alter: false });
        })
        dbObj.seq = sequelize
        this.dbMap[gatewayObj] = new DbObj(gatewayObj, dbConf.dbname,dbConf.dbhost, dbConf.dbport, dbObj)
        return dbObj
    }

    //从db获取gatewayObj列表，清理map，去掉不存在的（被删除的）
    async getGatewayObjList(){
        let objs = await GatewayDao.getGatewayObjList()
        for(let key in this.proxyMap){
            if(objs.indexOf(key) < 0) delete this.proxyMap[key]
        }
        for(let key in this.dbMap){
            if(objs.indexOf(key) < 0) delete this.dbMap[key]
        }
        return objs
    }

    async deleteGatewayObj(user, gatewayObj){
        return await GatewayDao.deleteGatewayObj(user, gatewayObj)
    }
}

module.exports = new GatewayObjManager()