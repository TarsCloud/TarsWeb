// **********************************************************************
// Parsed By TarsParser(3.0.4), Generated By tools(20200627)
// TarsParser Maintained By <TARS> and tools Maintained By <superzheng>
// Generated from "Patch.tars" by Client Mode
// **********************************************************************

/* eslint-disable */

"use strict";

var assert    = require("assert");
var TarsStream = require("@tars/stream");
var TarsError  = require("@tars/rpc").error;

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _makeError = function (data, message, type) {
    var error = new Error(message || "");
    error.request = data.request;
    error.response = {
        "costtime" : data.request.costtime
    };
    if (type === TarsError.CLIENT.DECODE_ERROR) {
        error.name = "DECODE_ERROR";
        error.response.error = {
            "code" : type,
            "message" : message
        };
    } else {
        error.name = "RPC_ERROR";
        error.response.error = data.error;
    }
    return error;
};

var tars = tars || {};
module.exports.tars = tars;

tars.PatchProxy = function () {
    this._name    = undefined;
    this._worker  = undefined;
};

tars.PatchProxy.prototype.setTimeout = function (iTimeout) {
    this._worker.timeout = iTimeout;
};

tars.PatchProxy.prototype.getTimeout = function () {
    return this._worker.timeout;
};

tars.PatchProxy.prototype.setVersion = function (iVersion) {
    this._worker.version = iVersion;
};

tars.PatchProxy.prototype.getVersion = function () {
    return this._worker.version;
};

tars.FileInfo = function() {
    this.path = "";
    this.size = 0;
    this.canExec = true;
    this.md5 = "";
    this._classname = "tars.FileInfo";
};
tars.FileInfo._classname = "tars.FileInfo";
tars.FileInfo._write = function (os, tag, value) { os.writeStruct(tag, value); };
tars.FileInfo._read  = function (is, tag, def) { return is.readStruct(tag, true, def); };
tars.FileInfo._readFrom = function (is) {
    var tmp = new tars.FileInfo;
    tmp.path = is.readString(0, true, "");
    tmp.size = is.readInt32(1, true, 0);
    tmp.canExec = is.readBoolean(2, true, true);
    tmp.md5 = is.readString(3, false, "");
    return tmp;
};
tars.FileInfo.prototype._writeTo = function (os) {
    os.writeString(0, this.path);
    os.writeInt32(1, this.size);
    os.writeBoolean(2, this.canExec);
    os.writeString(3, this.md5);
};
tars.FileInfo.prototype._equal = function () {
    assert.fail("this structure not define key operation");
};
tars.FileInfo.prototype._genKey = function () {
    if (!this._proto_struct_name_) {
        this._proto_struct_name_ = "STRUCT" + Math.random();
    }
    return this._proto_struct_name_;
};
tars.FileInfo.prototype.toObject = function() { 
    return {
        "path" : this.path,
        "size" : this.size,
        "canExec" : this.canExec,
        "md5" : this.md5
    };
};
tars.FileInfo.prototype.readFromObject = function(json) { 
    _hasOwnProperty.call(json, "path") && (this.path = json.path);
    _hasOwnProperty.call(json, "size") && (this.size = json.size);
    _hasOwnProperty.call(json, "canExec") && (this.canExec = json.canExec);
    _hasOwnProperty.call(json, "md5") && (this.md5 = json.md5);
    return this;
};
tars.FileInfo.prototype.toBinBuffer = function () {
    var os = new TarsStream.TarsOutputStream();
    this._writeTo(os);
    return os.getBinBuffer();
};
tars.FileInfo.new = function () {
    return new tars.FileInfo();
};
tars.FileInfo.create = function (is) {
    return tars.FileInfo._readFrom(is);
};

tars.FileContent = function() {
    this.md5 = "";
    this.name = "";
    this.firstChunk = true;
    this.lastChunk = true;
    this.content = new TarsStream.BinBuffer;
    this._classname = "tars.FileContent";
};
tars.FileContent._classname = "tars.FileContent";
tars.FileContent._write = function (os, tag, value) { os.writeStruct(tag, value); };
tars.FileContent._read  = function (is, tag, def) { return is.readStruct(tag, true, def); };
tars.FileContent._readFrom = function (is) {
    var tmp = new tars.FileContent;
    tmp.md5 = is.readString(0, true, "");
    tmp.name = is.readString(1, true, "");
    tmp.firstChunk = is.readBoolean(2, true, true);
    tmp.lastChunk = is.readBoolean(3, true, true);
    tmp.content = is.readBytes(4, true, TarsStream.BinBuffer);
    return tmp;
};
tars.FileContent.prototype._writeTo = function (os) {
    os.writeString(0, this.md5);
    os.writeString(1, this.name);
    os.writeBoolean(2, this.firstChunk);
    os.writeBoolean(3, this.lastChunk);
    os.writeBytes(4, this.content);
};
tars.FileContent.prototype._equal = function () {
    assert.fail("this structure not define key operation");
};
tars.FileContent.prototype._genKey = function () {
    if (!this._proto_struct_name_) {
        this._proto_struct_name_ = "STRUCT" + Math.random();
    }
    return this._proto_struct_name_;
};
tars.FileContent.prototype.toObject = function() { 
    return {
        "md5" : this.md5,
        "name" : this.name,
        "firstChunk" : this.firstChunk,
        "lastChunk" : this.lastChunk,
        "content" : this.content.toObject()
    };
};
tars.FileContent.prototype.readFromObject = function(json) { 
    _hasOwnProperty.call(json, "md5") && (this.md5 = json.md5);
    _hasOwnProperty.call(json, "name") && (this.name = json.name);
    _hasOwnProperty.call(json, "firstChunk") && (this.firstChunk = json.firstChunk);
    _hasOwnProperty.call(json, "lastChunk") && (this.lastChunk = json.lastChunk);
    _hasOwnProperty.call(json, "content") && (this.content.readFromObject(json.content));
    return this;
};
tars.FileContent.prototype.toBinBuffer = function () {
    var os = new TarsStream.TarsOutputStream();
    this._writeTo(os);
    return os.getBinBuffer();
};
tars.FileContent.new = function () {
    return new tars.FileContent();
};
tars.FileContent.create = function (is) {
    return tars.FileContent._readFrom(is);
};

var __tars_Patch$deletePatchFile$IF = {
    "name" : "deletePatchFile",
    "return" : "int32",
    "arguments" : [{
        "name" : "app",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "serverName",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "patchFile",
        "class" : "string",
        "direction" : "in"
    }]
};

var __tars_Patch$deletePatchFile$IE = function (app, serverName, patchFile) {
    var os = new TarsStream.TarsOutputStream();
    os.writeString(1, app);
    os.writeString(2, serverName);
    os.writeString(3, patchFile);
    return os.getBinBuffer();
};

var __tars_Patch$deletePatchFile$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$deletePatchFile$PE = function (app, serverName, patchFile, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeString("app", app);
    tup.writeString("serverName", serverName);
    tup.writeString("patchFile", patchFile);
    return tup;
};

var __tars_Patch$deletePatchFile$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$deletePatchFile$ER = function (data) {
    throw _makeError(data, "Call Patch::deletePatchFile failed");
};

tars.PatchProxy.prototype.deletePatchFile = function (app, serverName, patchFile) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("deletePatchFile", __tars_Patch$deletePatchFile$PE(app, serverName, patchFile, version), arguments[arguments.length - 1], __tars_Patch$deletePatchFile$IF).then(__tars_Patch$deletePatchFile$PD, __tars_Patch$deletePatchFile$ER);
    } else {
        return this._worker.tars_invoke("deletePatchFile", __tars_Patch$deletePatchFile$IE(app, serverName, patchFile), arguments[arguments.length - 1], __tars_Patch$deletePatchFile$IF).then(__tars_Patch$deletePatchFile$ID, __tars_Patch$deletePatchFile$ER);
    }
};
tars.PatchProxy.deletePatchFile = __tars_Patch$deletePatchFile$IF;

var __tars_Patch$download$IF = {
    "name" : "download",
    "return" : "int32",
    "arguments" : [{
        "name" : "file",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "pos",
        "class" : "int32",
        "direction" : "in"
    }, {
        "name" : "vb",
        "class" : "list(char)",
        "direction" : "out"
    }]
};

var __tars_Patch$download$IE = function (file, pos) {
    var os = new TarsStream.TarsOutputStream();
    os.writeString(1, file);
    os.writeInt32(2, pos);
    return os.getBinBuffer();
};

var __tars_Patch$download$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0),
                "arguments" : {
                    "vb" : is.readBytes(3, true, TarsStream.BinBuffer)
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$download$PE = function (file, pos, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeString("file", file);
    tup.writeInt32("pos", pos);
    return tup;
};

var __tars_Patch$download$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0),
                "arguments" : {
                    "vb" : tup.readBytes("vb")
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$download$ER = function (data) {
    throw _makeError(data, "Call Patch::download failed");
};

tars.PatchProxy.prototype.download = function (file, pos) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("download", __tars_Patch$download$PE(file, pos, version), arguments[arguments.length - 1], __tars_Patch$download$IF).then(__tars_Patch$download$PD, __tars_Patch$download$ER);
    } else {
        return this._worker.tars_invoke("download", __tars_Patch$download$IE(file, pos), arguments[arguments.length - 1], __tars_Patch$download$IF).then(__tars_Patch$download$ID, __tars_Patch$download$ER);
    }
};
tars.PatchProxy.download = __tars_Patch$download$IF;

var __tars_Patch$listFileInfo$IF = {
    "name" : "listFileInfo",
    "return" : "int32",
    "arguments" : [{
        "name" : "path",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "vf",
        "class" : "list(tars.FileInfo)",
        "direction" : "out"
    }]
};

var __tars_Patch$listFileInfo$IE = function (path) {
    var os = new TarsStream.TarsOutputStream();
    os.writeString(1, path);
    return os.getBinBuffer();
};

var __tars_Patch$listFileInfo$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0),
                "arguments" : {
                    "vf" : is.readList(2, true, TarsStream.List(tars.FileInfo))
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$listFileInfo$PE = function (path, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeString("path", path);
    return tup;
};

var __tars_Patch$listFileInfo$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0),
                "arguments" : {
                    "vf" : tup.readList("vf", TarsStream.List(tars.FileInfo))
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$listFileInfo$ER = function (data) {
    throw _makeError(data, "Call Patch::listFileInfo failed");
};

tars.PatchProxy.prototype.listFileInfo = function (path) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("listFileInfo", __tars_Patch$listFileInfo$PE(path, version), arguments[arguments.length - 1], __tars_Patch$listFileInfo$IF).then(__tars_Patch$listFileInfo$PD, __tars_Patch$listFileInfo$ER);
    } else {
        return this._worker.tars_invoke("listFileInfo", __tars_Patch$listFileInfo$IE(path), arguments[arguments.length - 1], __tars_Patch$listFileInfo$IF).then(__tars_Patch$listFileInfo$ID, __tars_Patch$listFileInfo$ER);
    }
};
tars.PatchProxy.listFileInfo = __tars_Patch$listFileInfo$IF;

var __tars_Patch$preparePatchFile$IF = {
    "name" : "preparePatchFile",
    "return" : "int32",
    "arguments" : [{
        "name" : "app",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "serverName",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "patchFile",
        "class" : "string",
        "direction" : "in"
    }]
};

var __tars_Patch$preparePatchFile$IE = function (app, serverName, patchFile) {
    var os = new TarsStream.TarsOutputStream();
    os.writeString(1, app);
    os.writeString(2, serverName);
    os.writeString(3, patchFile);
    return os.getBinBuffer();
};

var __tars_Patch$preparePatchFile$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$preparePatchFile$PE = function (app, serverName, patchFile, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeString("app", app);
    tup.writeString("serverName", serverName);
    tup.writeString("patchFile", patchFile);
    return tup;
};

var __tars_Patch$preparePatchFile$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$preparePatchFile$ER = function (data) {
    throw _makeError(data, "Call Patch::preparePatchFile failed");
};

tars.PatchProxy.prototype.preparePatchFile = function (app, serverName, patchFile) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("preparePatchFile", __tars_Patch$preparePatchFile$PE(app, serverName, patchFile, version), arguments[arguments.length - 1], __tars_Patch$preparePatchFile$IF).then(__tars_Patch$preparePatchFile$PD, __tars_Patch$preparePatchFile$ER);
    } else {
        return this._worker.tars_invoke("preparePatchFile", __tars_Patch$preparePatchFile$IE(app, serverName, patchFile), arguments[arguments.length - 1], __tars_Patch$preparePatchFile$IF).then(__tars_Patch$preparePatchFile$ID, __tars_Patch$preparePatchFile$ER);
    }
};
tars.PatchProxy.preparePatchFile = __tars_Patch$preparePatchFile$IF;

var __tars_Patch$upload$IF = {
    "name" : "upload",
    "return" : "int32",
    "arguments" : [{
        "name" : "app",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "serverName",
        "class" : "string",
        "direction" : "in"
    }, {
        "name" : "content",
        "class" : "tars.FileContent",
        "direction" : "in"
    }]
};

var __tars_Patch$upload$IE = function (app, serverName, content) {
    var os = new TarsStream.TarsOutputStream();
    os.writeString(1, app);
    os.writeString(2, serverName);
    os.writeStruct(3, content);
    return os.getBinBuffer();
};

var __tars_Patch$upload$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$upload$PE = function (app, serverName, content, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeString("app", app);
    tup.writeString("serverName", serverName);
    tup.writeStruct("content", content);
    return tup;
};

var __tars_Patch$upload$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0)
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_Patch$upload$ER = function (data) {
    throw _makeError(data, "Call Patch::upload failed");
};

tars.PatchProxy.prototype.upload = function (app, serverName, content) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("upload", __tars_Patch$upload$PE(app, serverName, content, version), arguments[arguments.length - 1], __tars_Patch$upload$IF).then(__tars_Patch$upload$PD, __tars_Patch$upload$ER);
    } else {
        return this._worker.tars_invoke("upload", __tars_Patch$upload$IE(app, serverName, content), arguments[arguments.length - 1], __tars_Patch$upload$IF).then(__tars_Patch$upload$ID, __tars_Patch$upload$ER);
    }
};
tars.PatchProxy.upload = __tars_Patch$upload$IF;



