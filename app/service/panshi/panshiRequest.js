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
const logger = require('../../logger');
const rp = require("request-promise");
const uuidv1 = require('uuid/v1');
const sha256 = require('sha256');
const {panshiConf} = require('../../../config/webConf');

let {calluser, callsys, appkey, mappingUrl} = panshiConf;

function PanshiRequest () {
    this.calluser = calluser;
    this.callsys = callsys;
    this.appkey = appkey;
    this.mappingUrl = mappingUrl;
    this.extensions = {
        "isSuper": false
    }
}

PanshiRequest.prototype.getApiHeader = function () {
    return {
        "calluser": this.calluser,
        "callsys": this.callsys,
        "extensions": {
            "isSuper": false
        },
        "uuid": uuidv1().replace(/-/g, ""),
        "timestamp": new Date().getTime() + "",
    }
};


PanshiRequest.prototype.getParam = function (param = {}) {
    let data = {
        api_head: this.getApiHeader(),
        api_body: param,
    };
    return {
        data: JSON.stringify(data),
        sign: sha256(JSON.stringify(data) + this.appkey)
    }
};

PanshiRequest.prototype.transformLangType = function (langType) {
    return {
        java: '1',
        ios: '10',
        android: '11',
        R: '12',
        shell: '13',
        delph: '14',
        vc: '15',
        vb: '16',
        nodejs: '17',
        notaf: '18',
        'C++': '2',
        C: '3',
        'C#': '4',
        javascript: '5',
        go: '6',
        '.net': '7',
        python: '8',
        php:'9',
        tars_cpp: '2',
        tars_java: '1',
        tars_php: '9',
        tars_go: '6',
        tars_python: '8',
        tars_nodejs: '17'
    }[langType]
};

PanshiRequest.prototype.request =  function ({method = "POST", params = {}, url}) {
    var options = {
        method: method,
        url: mappingUrl + url,
        json: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
    };
    if (method === "POST") {
        options.form = params
    } else if (method === "GET") {
        options.qs = params
    }
    logger.info('panshirequest [' + method+ ':' + url + ']: ', options);
    return rp(options).then(function (data) {
        logger.info(data);
        if (data.result === 0) {
            return data.data
        } else {
            throw new Error('[' + method+ ':' + url + ']' + (data.result_msg || data.result_info))
        }
    })
};

module.exports = PanshiRequest;