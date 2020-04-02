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

const assert = require('assert');
const TarsStream = require('@tars/stream');
const Tars = require('@tars/rpc').client;
const TarsType = require('./TarsType');
const TarsStruct = require('./TarsStruct').TarsStruct;

const TarsClient = function (context, interface, objName, setName) {
	assert(context !== undefined, "please specify the parameter value for context");
	assert(interface !== undefined, "please specify the parameter value for interface");
	assert(objName !== undefined, "please specify the parameter value for objName");
	assert(objName.valueOf("@") !== -1 || objName.valueOf("@") === -1 && Tars.getProperty("locator") !== undefined,
		"please specify the parameter value for registry locator");
	this._context = context;
	this._interface = interface;
	this._name = objName;
	this._worker = Tars._createObjectProxy(objName, setName ? setName : '', {});
	this.writeParams = [];
	this.readParams = [];
}

TarsClient.prototype.setTimeout = function (timeout) {
	this._worker.timeout = timeout;
}

TarsClient.prototype.getTimeout = function () {
	return this._worker.timeout;
}

TarsClient.prototype.invoke = function (method, params) {
	const self = this;
	const context = this._context,
		interface = this._interface;
	let sMsg = ""
	if (!method) {
		sMsg = "please specify the parameter value for function name"
		console.error(sMsg);
		return {error: sMsg};
	}
	const func = interface.functions[method];
	if (!func) {
		sMsg = 'no function named' + method + ' for ' + interface.fullName
		console.error(sMsg);
		return {error: sMsg};
	}
	if (func['return'] !== 'void') {
		this.readParams.push({
			tag: 0, //0是return
			name: 'return',
			token: TarsType.getMethodToken(func['return']),
			type: TarsStruct.getType(context, func['return'])
		});
	}

	func.params.forEach((param, index) => {
		const token = TarsType.getMethodToken(param.type);
		if (param.out === true) {
			this.readParams.push({
				tag: index + 1, // 入参的tag从1开始
				name: param.name,
				token: token,
				type: TarsStruct.getType(context, param.type)
			})
		} else {
			this.writeParams.push({
				tag: index + 1,
				token: token,
				value: TarsStruct.getWrappedValue(context, param.type, params[param.name])
			});
		}
	});

	function _encode() {
		let os = new TarsStream.TarsOutputStream();
		self.writeParams.forEach(param => {
			os['write' + param.token](param.tag, param.value);
		});
		return os.getBinBuffer();
	}

	function _decode(data) {
		try {
			let response = {
				consttime: data.request.costtime,
				arguments: {}
			}
			const is = new TarsStream.TarsInputStream(data.response.sBuffer);
			for (let i = 0, len = self.readParams.length; i < len; i++) {
				let param = self.readParams[i],
					res = param.name == 'return' ? response : response.arguments;
				let value = is['read' + param.token](param.tag, true, param.type);
				if (typeof value.toObject === 'function') {
					value = value.toObject();
				}
				res[param.name] = value;
			}
			return {
				request: data.request,
				response: response
			}
		} catch (e) {
			console.error(e);
			return {error: "decode error: " + e.message};
		}
	}

	function _error(data) {
		const response = {
			costtime: data.request.costtime,
			error: data.error
		}
		return {response};
	}

	return this._worker.tars_invoke(method, _encode(), arguments[arguments.length - 1]).then(_decode, _error)
}

module.exports = TarsClient;
