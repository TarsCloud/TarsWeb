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

"use strict";

var assert = require("assert");
var TarsStream = require('@tars/stream');
var TarsType = require("./TarsType");

var NUMBER_TYPE = /^(byte|short|int|long|unsigned byte|unsigned short|unsigned int|float|double)$/;
var DEFAULT_BOOL = false;

TarsStream.BinBuffer.prototype.toObject = function () {
	return this.toNodeBuffer().toString("base64");
};
TarsStream.BinBuffer.prototype.readFromObject = function (json) {
	return this.writeNodeBuffer(new Buffer(json, "base64"));
};

var TarsStruct, Delegater;

TarsStruct = function (context, struct) {
	this._context = context;
	this._struct = struct;
	this.resetDefault();
};
Delegater = function (context, struct) {
	this._context = context;
	this._struct = struct;
	this._classname = struct.fullName;
};
Delegater.prototype._write = function (os, tag, value) {
	os.writeStruct(tag, value);
};
Delegater.prototype._read = function (is, tag, def) {
	return is.readStruct(tag, true, def);
};
Delegater.prototype._readFrom = function (is) {
	return new TarsStruct(this._context, this._struct)._readFrom(is);
};
Delegater.prototype.create = function (is) {
	return new TarsStruct(this._context, this._struct)._readFrom(is);
};
Delegater.prototype.new = function (is) {
	return new TarsStruct(this._context, this._struct);
};

TarsStruct.getType = function (context, type) {
	var result, module, struct;
	if (type.vector === true) {
		if (type.type === "byte") {
			result = TarsStream.BinBuffer;
		} else {
			result = TarsStream.List(TarsStruct.getType(context, type.type));
		}
	} else if (type.map === true) {
		result = TarsStream.Map(TarsStruct.getType(context, type.key), TarsStruct.getType(context, type.value));
	} else if (type.isStruct === true && (module = context[type.module]) && (struct = module.structs[type.name])) {
		result = new Delegater(context, struct);
	} else if (type.isEnum === true) {
		result = TarsStream.Int32;
	} else if (TarsType.TypeMap[type]) {
		result = TarsStream[TarsType.TypeMap[type]];
	} else {
		throw Error("Cannot find type:" + JSON.stringify(type));
	}
	return result;
};
TarsStruct.getWrappedValue = function (context, type, json) {
	if (type.isEnum || typeof(type) === "string") {
		return json;
	} else {
		var wrapper = TarsStruct.getType(context, type).new();
		wrapper.readFromObject(json);
		return wrapper;
	}
};
TarsStruct.prototype._getDefault = function (field) {
	var defvalue = field.defvalue;
	if (defvalue == null) {
		if (field.type === "bool") {
			defvalue = DEFAULT_BOOL;
		} else if (field.type === "string") {
			defvalue = "";
		} else if (NUMBER_TYPE.test(field.type)) {
			defvalue = 0;
		} else if (field.type.isEnum === true) {
			var enumValues = this._context[field.type.module].enums[field.type.name].values;
			for (var enumName in enumValues) {
				if ((defvalue = enumValues[enumName]) !== undefined) {
					break;
				}
			}
		} else {
			defvalue = TarsStruct.getType(this._context, field.type);
		}
	}
	return defvalue;
};
TarsStruct.prototype.resetDefault = function () {
	var field, defvalue;
	for (var fieldName in this._struct.fields) {
		if ((field = this._struct.fields[fieldName])) {
			defvalue = field.defvalue;
			if (defvalue == null) {
				defvalue = this._getDefault(field);
				if (typeof (defvalue.new) === "function") {
					defvalue = defvalue.new();
				}
			}
			this[fieldName] = defvalue;
		}
	}
};
TarsStruct.prototype._readFrom = function (is) {
	var field, defvalue, method;
	for (var fieldName in this._struct.fields) {
		if ((field = this._struct.fields[fieldName])) {
			defvalue = field.defvalue;
			if (defvalue == null) {
				defvalue = this._getDefault(field);
			}
			method = "read" + TarsType.getMethodToken(field.type);
			this[fieldName] = is[method](field.tag, !field.optional, defvalue);
		}
	}
	return this;
};
TarsStruct.prototype._writeTo = function (os) {
	var field, method;
	for (var fieldName in this._struct.fields) {
		if ((field = this._struct.fields[fieldName])) {
			method = "write" + TarsType.getMethodToken(field.type);
			os[method](field.tag, this[fieldName]);
		}
	}
};
TarsStruct.prototype._equal = function (anItem) {
	if (this._struct.keys.length === 0) {
		assert(false, 'this structure not define key operation');
	} else {
		var result = true;
		for (var fieldName in this._struct.keys) {
			if (this._struct.fields[fieldName]) {
				result = result && (this[fieldName] === anItem[fieldName]);
			}
		}
		return result;
	}
};
TarsStruct.prototype._genKey = function () {
	if (!this._proto_struct_name_) {
		this._proto_struct_name_ = 'STRUCT' + Math.random();
	}
	return this._proto_struct_name_;
};
TarsStruct.prototype.toObject = function () {
	var tmp = {}, field;
	for (var fieldName in this._struct.fields) {
		if ((field = this._struct.fields[fieldName])) {
			if (field.type.isEnum || typeof(field.type) === "string") {
				tmp[fieldName] = this[fieldName];
			} else {
				tmp[fieldName] = this[fieldName].toObject();
			}
		}
	}
	return tmp;
};
TarsStruct.prototype.readFromObject = function (json) {
	var field;
	for (var fieldName in this._struct.fields) {
		if (json.hasOwnProperty(fieldName) && (field = this._struct.fields[fieldName])) {
			this[fieldName] = TarsStruct.getWrappedValue(this._context, field.type, json[fieldName]);
		}
	}
};
TarsStruct.prototype.toBinBuffer = function () {
	var os = new TarsStream.JceOutputStream();
	this._writeTo(os);
	return os.getBinBuffer();
};
TarsStruct.prototype.toBase64 = function () {
	var os = new TarsStream.JceOutputStream();
	this._writeTo(os);
	return os.getBinBuffer().toNodeBuffer().toString("base64");
};
TarsStruct.prototype.fromBase64 = function (base64) {
	var is = new TarsStream.JceInputStream(new TarsStream.BinBuffer(new Buffer(base64, "base64")));
	this._readFrom(is);
	return this;
};

module.exports = {
	TarsStruct: TarsStruct,
	TarsStructDelegater: Delegater
};
