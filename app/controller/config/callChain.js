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

const logger = require('../../../logger');
const https = require("https");
const request = require("request");
const { log } = require('winston/lib/winston/common');
const rp = require('request-promise');
const callChain = {};
const EndpointManager = require("../../../rpc/proxy/getservant/lib/getEndpoint")
let configs =  require("../../../rpc/index")
let locator = configs.client._property.locator;
let endpointM = new EndpointManager(locator);

callChain.getlabel = async (ctx) => {
	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TafCallChain.WebServerObj");
	let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
    let servant  = `http://${ip[1]}:${port[1]}`
	let nowDate = ctx.paramsObj.nowDate
	var options = {
		'method': 'POST',
		'url': `${servant}/getlabel?nowDate=${nowDate}`,
		'headers': {
		}
	};
	
	try {
		let rpbody = await rp(options);
		rpbody = JSON.parse(rpbody)
		ctx.makeResObj(200, '', rpbody);
	} catch (err) {
		logger.error('[getlabel]', err, ctx);
		ctx.makeErrResObj(500, err.message);
	}

};


callChain.getAverage = async (ctx) => {
	

	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TafCallChain.WebServerObj");
	let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
    let servant  = `http://${ip[1]}:${port[1]}`
	var options = {
		'method': 'POST',
		'url': `${servant}/tars_call_serve2?nowDate=${ctx.paramsObj.nowDate}&label=${ctx.paramsObj.label}`,
		'headers': {
		}
	};
	try {
		let rpbody = await rp(options);
		rpbody = JSON.parse(rpbody)
		console.log("rpbody",rpbody);
		ctx.makeResObj(200, '', rpbody);
	} catch (err) {
		logger.error('[getAverage]', err, ctx);
		ctx.makeErrResObj(500, err.message);
	}
};


callChain.detail = async (ctx) => {
	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TafCallChain.WebServerObj");
	let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
    let servant  = `http://${ip[1]}:${port[1]}`
	let nowDate = ctx.paramsObj.nowDate
	let id = ctx.paramsObj.id
	var options = {
		'method': 'POST',
		'url': `${servant}/detail?nowDate=${nowDate}&id=${id}`,
		'headers': {
		}
	};
	try {
		let rpbody = await rp(options);
		rpbody = JSON.parse(rpbody)
	
		ctx.makeResObj(200, '', rpbody);
	} catch (err) {
		logger.error('[detail]', err, ctx);
		ctx.makeErrResObj(500, err.message);
	}
};

callChain.detail1 = async (ctx) => {
	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TafCallChain.WebServerObj");
	let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
    let servant  = `http://${ip[1]}:${port[1]}`
	let reg = new RegExp("-", "g")
	var options = {
		"method": "POST",
		"url":`${servant}/detail1?nowDate=${ctx.paramsObj.nowDate.replace(reg, "")}&stime=${ctx.paramsObj.stime}&etime=${ctx.paramsObj.etime}&label=${ctx.paramsObj.label}`,
		"headers": {
		}
	};
	try {
		let rpbody = await rp(options);
		rpbody = JSON.parse(rpbody)
		
		ctx.makeResObj(200, '', rpbody);
	} catch (err) {
		logger.error('[detail1]', err, ctx);
		ctx.makeErrResObj(500, err.message);
	}
};


callChain.func = async (ctx) => {
	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TafCallChain.WebServerObj");
	let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
    let servant  = `http://${ip[1]}:${port[1]}`
	let nowDate = ctx.paramsObj.nowDate
	let id = ctx.paramsObj.id
	var options = {
		'method': 'POST',
		'url': `${servant}/func?nowDate=${nowDate}&id=${id}`,
		'headers': {
		}
	};
	try {
		let rpbody = await rp(options);
		rpbody = JSON.parse(rpbody)
		ctx.makeResObj(200, '', rpbody);
	} catch (err) {
		logger.error('[func]', err, ctx);
		ctx.makeErrResObj(500, err.message);
	}
};




module.exports = callChain;
