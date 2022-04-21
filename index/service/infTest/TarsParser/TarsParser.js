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

const Tokenizer = require('./Tokenizer');
const fs = require('fs');
const path = require('path');

const LEGAL_NAME = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,
    LEGAL_TYPE = /^([a-zA-Z_$][0-9a-zA-Z_$]*::)?[a-zA-Z_$][0-9a-zA-Z_$]*$/,
    INNER_TYPE = /^(void|bool|byte|short|int|long|float|double|string|unsigned byte|unsigned short|unsigned int)$/,
    INTEGER_TYPE = /^(byte|short|int|long|unsigned byte|unsigned short|unsigned int)$/,
    FLOAT_TYPE = /^(float|double)$/,
    RANGE_MAP = {
        "byte": [-0x80, 0x7F],
        "short": [-0x8000, 0x7FFF],
        "int": [-0x80000000, 0x7FFFFFFF],
        "long": [-8000000000000000, 0x7FFFFFFFFFFFFFFF],
        "unsigned byte": [0, 0xFF],
        "unsigned short": [0, 0xFFFF],
        "unsigned int": [0, 0xFFFFFFFF],
    };

class TarsParser {
    constructor(fileDir) {
        this.fileDir = fileDir;
    }

    parseFile(context, content) {
        let tokenizer = new Tokenizer(content);
        let token;
        while (token = tokenizer.next()) {
            if (token == '#include') {
                this.parseInclude(context, tokenizer);
            } else if (token == 'module') {
                this.parseModule(context, tokenizer);
            }
        }
    }

    parseModule(context, tokenizer) {
        const moduleName = tokenizer.next();
        if (tokenizer.next() != '{') {
            throw Error(`missing { after moduleName at '${moduleName}'`);
        }
        if (!context[moduleName]) {
            context[moduleName] = {
                enums: {},
                structs: {},
                interfaces: {},
                consts: {}
            }
        }
        let token;
        while ((tokenizer.peek() || "}") !== "}") {
            token = tokenizer.next();
            switch (token) {
                case 'enum':
                    this.parseEnum(context, tokenizer, moduleName);
                    break;
                case 'struct':
                    this.parseStruct(context, tokenizer, moduleName);
                    break;
                case 'key':
                    this.parseKey(context, tokenizer, moduleName);
                    break;
                case 'interface':
                    this.parseInterface(context, tokenizer, moduleName);
                    break;
                case 'const':
                    this.parseConst(context, tokenizer, moduleName);
                    break;
            }
        }
        if (tokenizer.next() !== '}' || tokenizer.next() !== ';') {
            throw Error(`format error at module ${moduleName}`);
        }
    }

    parseConst(context, tokenizer, moduleName) {
        let type = this.getType(context, tokenizer, moduleName),
            name = tokenizer.next();
        if (!LEGAL_NAME.test(name)) {
            throw Error("Illegal const name " + moduleName + "::" + name);
        }
        if (tokenizer.next() !== "=") {
            throw Error("Format error for const " + moduleName + "::" + name);
        }
        let value = tokenizer.next();
        if (tokenizer.next() !== ";") {
            throw Error("Format error for const " + moduleName + "::" + name);
        }
        context[moduleName].consts[name] = {
            module: moduleName,
            name: name,
            fullName: moduleName + "::" + name,
            type: type,
            value: value
        };
    }

    parseInterface(context, tokenizer, moduleName) {
        let interfaceName = tokenizer.next();
        if (!LEGAL_NAME.test(interfaceName)) {
            throw Error(`Illegal interface name ${moduleName}::${interfaceName}`);
        }
        if (tokenizer.next() != '{') {
            throw Error(`Format error for interface ${moduleName}::${interfaceName}`);
        }
        let inf = context[moduleName].interfaces[interfaceName] = {
            module: moduleName,
            name: interfaceName,
            fullName: moduleName + '::' + interfaceName,
            functions: {}
        }
        while ((tokenizer.peek() || "}") != "}") {
            this.parseFun(context, tokenizer, inf);
        }
        if (tokenizer.next() !== "}" || tokenizer.next() !== ";") {
            throw Error("Format error for interface " + moduleName + "::" + interfaceName);
        }
    }

    parseKey(context, tokenizer, moduleName) {
        let token = tokenizer.next();
        if (token !== '[') {
            throw Error(`format error for key of ${moduleName} at ${token}`);
        }
        let structName = tokenizer.next();
        if (!LEGAL_NAME.test(structName)) {
            throw Error(`Illegal key[${structName}] of ${moduleName}`);
        }
        let struct = context[moduleName].structs[structName];
        if (!struct) {
            throw Error(`No matching struct for key ${moduleName}::${structName}`);
        }
        if (struct.keys.length) {
            throw Error(`Duplicate key ${moduleName}::${structName}`);
        }
        while ((token = tokenizer.peek() || "]") !== "]") {
            if ((token = tokenizer.next()) !== ",") {
                throw Error("Parse key error " + moduleName + "::" + structName);
            }
            token = tokenizer.next();
            if (!LEGAL_NAME.test(token)) {
                throw Error("Illegal field name[" + structName + "] of key " + moduleName + "::" + structName);
            }
            for (var key in struct.keys) {
                if (key === token) {
                    throw Error("Duplicate key field " + moduleName + "::" + structName + "." + key);
                }
            }
            struct.keys.push(token);
        }
        if (struct.keys.length === 0) {
            throw Error("Empty struct key " + moduleName + "::" + structName);
        }
        if (tokenizer.next() !== "]" || tokenizer.next() !== ";") {
            throw Error("Format error for key " + moduleName + "::" + structName);
        }
    }

    parseStruct(context, tokenizer, moduleName) {
        let structName = tokenizer.next();
        if (tokenizer.next() != '{') {
            throw Error(`missing { after struct at '${structName}'`);
        }
        const struct = context[moduleName].structs[structName] = {
            module: moduleName,
            name: structName,
            fullName: moduleName + '::' + structName,
            fields: {},
            keys: []
        };
        while ((tokenizer.peek() || "}") !== "}") {
            this.parseField(context, tokenizer, struct);
        }
        if (tokenizer.next() != '}' || tokenizer.next() != ';') {
            throw Error(`format error for struct ${moduleName}::${structName}`);
        }
    }

    parseField(context, tokenizer, struct) {
        let tag = Number(tokenizer.next()),
            opt = tokenizer.next();
        if (Number.isNaN(tag)) {
            throw Error(`Illegal tag name at ${tag} of ${struct.fullName}`);
        }
        if (opt !== 'require' && opt !== 'optional') {
            throw Error(`missing require/optional after ${struct.fullName}`);
        }
        let type = this.getType(context, tokenizer, struct.module);
        let name = tokenizer.next(),
            token = tokenizer.next(),
            defaultValue = null;
        if (!LEGAL_NAME.test(name)) {
            throw Error(`Illegal field name[${name}] of ${struct.fullName}`);
        }
        if (token === '=') {
            if (type === "string") tokenizer.readingString = true
            defaultValue = this.checkDef(context, type, tokenizer.next());
            token = tokenizer.next();
        }
        if (token != ';') {
            throw Error(`Parse struct error ${struct.fullName}`);
        }
        struct.fields[name] = {
            tag: tag,
            optional: opt === 'optional',
            type: type,
            name: name,
            defaultValue: defaultValue
        }
    }

    parseFun(context, tokenizer, inf) {
        let returnType = this.getType(context, tokenizer, inf.module),
            funcName = tokenizer.next();
        if (!LEGAL_NAME.test(funcName)) {
            throw Error("Illegal function name " + inf.fullName + "::" + funcName);
        }
        let func = inf.functions[funcName] = {
            "name": funcName,
            "return": returnType,
            "params": []
        };
        if (tokenizer.next() != "(") {
            throw Error("Format error for function " + inf.fullName + "::" + funcName);
        }
        while ((tokenizer.peek() || ")") != ")") {
            let out = tokenizer.peek() === "out";
            if (out) {
                tokenizer.next();
            }
            let paramType = this.getType(context, tokenizer, inf.module);
            let paramName = tokenizer.next();
            if (!LEGAL_NAME.test(paramName)) {
                throw Error("Illegal parameter[" + paramName + "] for function " + inf.fullName + "::" + funcName);
            }
            func.params.push({
                "out": out,
                "type": paramType,
                "name": paramName
            });
            if (tokenizer.peek() === ",") {
                tokenizer.next();
            } else if (tokenizer.peek() !== ")") {
                throw Error("Format error for function " + inf.fullName + "::" + funcName);
            }
        }
        if (tokenizer.next() !== ")" || tokenizer.next() !== ";") {
            throw Error("Format error for function " + inf.fullName + "::" + funcName);
        }
    }

    checkDef(context, type, defaultValue) {
        let v;
        if (typeof (type) !== "string" && type.isEnum !== true) {
            throw Error("Only base type or enum can have default value.");
        }
        if (type === "bool") {
            if (defaultValue !== "false" && defaultValue !== "true") {
                throw Error("Default value for bool must be true/false.");
            }
            return defaultValue === "true";
        } else if (type.isEnum === true) {
            v = Number(defaultValue);
            if (Number.isNaN(v)) {
                let enumDest = context[type.module].enums[type.name];

                if (!enumDest || enumDest.values[defaultValue] == null) {
                    throw Error("Bad default value for enum " + type.module + "::" + type.name + "::" + defaultValue);
                } else {
                    return enumDest.values[defaultValue];
                }
            } else if (v < RANGE_MAP.int[0] || RANGE_MAP.int[1] < v) {
                throw Error("Bad default value for enum " + type.module + "::" + type.name + "::" + defaultValue);
            } else {
                return v;
            }
        } else if (INTEGER_TYPE.test(type)) {
            v = Number(defaultValue);
            // if (Number.isNaN(v) || v < RANGE_MAP[type][0] || RANGE_MAP[type][1] < v) {
            //     throw Error("Bad default value for " + type + ":" + defaultValue);
            // }
            return v;
        } else if (FLOAT_TYPE.test(type)) {
            v = Number(defaultValue);
            if (Number.isNaN(v)) {
                throw Error("Bad default value for " + type + ":" + defaultValue);
            }
            return v;
        } else {
            return defaultValue;
        }
    }

    getType(context, tokenizer, moduleName) {
        let paramType = tokenizer.next();
        if (paramType === "unsigned") {
            return "unsigned " + tokenizer.next();
        } else if (paramType === "vector") {
            let token = tokenizer.next();
            if (token !== "<") {
                throw Error(`missing < for ${token}`);
            }
            let type = this.getType(context, tokenizer, moduleName);
            token = tokenizer.next();
            if (token !== ">") {
                throw Error(`missing > for ${token}`);
            }
            return {
                "vector": true,
                "type": type
            };
        } else if (paramType === "map") {
            let token = tokenizer.next();
            if (token !== "<") {
                throw Error(`missing < for ${token}`);
            }
            let keyType = this.getType(context, tokenizer, moduleName);
            token = tokenizer.next();
            if (token !== ",") {
                throw Error(`parse tars error for ${token}`);
            }
            let valueType = this.getType(context, tokenizer, moduleName);
            token = tokenizer.next();
            if (token !== ">") {
                throw Error(`missing > for ${token}`);
            }
            return {
                "map": true,
                "key": keyType,
                "value": valueType
            };
        } else if (LEGAL_TYPE.test(paramType)) {
            if (!INNER_TYPE.test(paramType)) {
                let typeModule = moduleName,
                    typeName = paramType;
                if (paramType.indexOf("::") > 0) {
                    let temp = paramType.split("::");
                    if (temp.length !== 2) {
                        throw Error(`Parse tars error, illegal type name [${paramType}]`);
                    }
                    typeModule = temp[0];
                    typeName = temp[1];
                }
                let module = context[typeModule];
                if (!module) {
                    throw Error(`Cannot find module["${module}"] for["${paramType}"]`);
                }
                let notStruct = !module.structs[typeName];
                let notEnum = !module.enums[typeName];
                if (notStruct && notEnum) {
                    throw Error(`Cannot find type["${paramType}"]`);
                }
                paramType = {
                    "module": typeModule,
                    "name": typeName,
                    "isStruct": !notStruct,
                    "isEnum": !notEnum,
                };
            }
            return paramType;
        } else {
            throw Error(`Parse tars error, illegal type name["${paramType}"]`);
        }
    }

    parseEnum(context, tokenizer, moduleName) {
        let enumName = tokenizer.next();
        if (tokenizer.next() != '{') {
            throw Error(`missing { after enum at '${enumName}'`);
        }
        let enumInfo = context[moduleName].enums[enumName] = {
            module: moduleName,
            name: enumName,
            fullName: moduleName + '::' + enumName,
            values: {}
        }
        let token, value = 0;
        while ((tokenizer.peek() || "}") !== "}") {
            let name = tokenizer.next();
            if (!LEGAL_NAME.test(name)) {
                throw Error(`Illegal enum name at ${name} of ${moduleName}::${enumName}`);
            }
            if (enumInfo.values[name]) {
                throw Error(`Duplicate enum value at ${name} of ${moduleName}::${enumName}`);
            }
            token = tokenizer.peek();
            if (token === '=') {
                tokenizer.next();
                value = Number(token = tokenizer.next());
                if (isNaN(value)) {
                    throw Error(`Illegal enum value at '${token}' of ${moduleName}::${enumName}`);
                }
                enumInfo.values[name] = value;
                token = tokenizer.peek();
            } else {
                enumInfo.values[name] = ++value;
            }
            if (token === ',') {
                tokenizer.next();
            } else if ((token || "}") !== "}") {
                throw Error(`Parse enum error '${token}' of ${moduleName}::${enumName}`);
            }
        }
        if (tokenizer.next() !== '}' || tokenizer.next() != ';') {
            throw Error("Format error for enum " + moduleName + "::" + enumName);
        }
    }

    parseInclude(context, tokenizer) {
        let token = tokenizer.next(),
            include = token.replace(/^['"]|['"]$/g, '');
        context.includes = context.includes || {};
        context.includes[include] = true;
        this.parseFile(context, fs.readFileSync(path.join(this.fileDir, include)).toString());
    }
}

module.exports = TarsParser;
