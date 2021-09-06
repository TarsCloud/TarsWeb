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

const TarsType = {};

TarsType.TypeMap = {
	"bool": "Boolean",
	"byte": "Int8",
	"short": "Int16",
	"int": "Int32",
	"unsigned byte": "UInt8",
	"unsigned short": "UInt16",
	"unsigned int": "UInt32",
	"long": "Int64",
	"float": "Float",
	"double": "Double",
	"string": "String",
};
TarsType.getMethodToken = function (type) {
	let method;
	if (typeof (type) === "string") {
		method = TarsType.TypeMap[type];
	} else if (type.vector === true) {
		if (type.type === "byte") {
			method = "Bytes";
		} else {
			method = "List";
		}
	} else if (type.map === true) {
		method = "Map";
	} else if (type.isEnum === true) {
		method = "Int32";
	} else {
		method = "Struct";
	}
	return method;
};

module.exports = TarsType;