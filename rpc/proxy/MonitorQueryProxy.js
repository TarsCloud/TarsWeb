// **********************************************************************
// Parsed By TarsParser(3.0.4), Generated By tools(20200627)
// TarsParser Maintained By <TARS> and tools Maintained By <superzheng>
// Generated from "MonitorQuery.tars" by Client Mode
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

tars.MonitorQueryProxy = function () {
    this._name    = undefined;
    this._worker  = undefined;
};

tars.MonitorQueryProxy.prototype.setTimeout = function (iTimeout) {
    this._worker.timeout = iTimeout;
};

tars.MonitorQueryProxy.prototype.getTimeout = function () {
    return this._worker.timeout;
};

tars.MonitorQueryProxy.prototype.setVersion = function (iVersion) {
    this._worker.version = iVersion;
};

tars.MonitorQueryProxy.prototype.getVersion = function () {
    return this._worker.version;
};

tars.OP = {
    "EQ" : 0,
    "GT" : 1,
    "GTE" : 2,
    "LT" : 3,
    "LTE" : 4,
    "LIKE" : 5
};
tars.OP._classname = "tars.OP";
tars.OP._write = function(os, tag, val) { return os.writeInt32(tag, val); };
tars.OP._read  = function(is, tag, def) { return is.readInt32(tag, true, def); };

tars.Condition = function() {
    this.field = "";
    this.op = tars.OP.EQ;
    this.val = "";
    this._classname = "tars.Condition";
};
tars.Condition._classname = "tars.Condition";
tars.Condition._write = function (os, tag, value) { os.writeStruct(tag, value); };
tars.Condition._read  = function (is, tag, def) { return is.readStruct(tag, true, def); };
tars.Condition._readFrom = function (is) {
    var tmp = new tars.Condition;
    tmp.field = is.readString(0, true, "");
    tmp.op = is.readInt32(1, true, tars.OP.EQ);
    tmp.val = is.readString(2, true, "");
    return tmp;
};
tars.Condition.prototype._writeTo = function (os) {
    os.writeString(0, this.field);
    os.writeInt32(1, this.op);
    os.writeString(2, this.val);
};
tars.Condition.prototype._equal = function () {
    assert.fail("this structure not define key operation");
};
tars.Condition.prototype._genKey = function () {
    if (!this._proto_struct_name_) {
        this._proto_struct_name_ = "STRUCT" + Math.random();
    }
    return this._proto_struct_name_;
};
tars.Condition.prototype.toObject = function() { 
    return {
        "field" : this.field,
        "op" : this.op,
        "val" : this.val
    };
};
tars.Condition.prototype.readFromObject = function(json) { 
    _hasOwnProperty.call(json, "field") && (this.field = json.field);
    _hasOwnProperty.call(json, "op") && (this.op = json.op);
    _hasOwnProperty.call(json, "val") && (this.val = json.val);
    return this;
};
tars.Condition.prototype.toBinBuffer = function () {
    var os = new TarsStream.TarsOutputStream();
    this._writeTo(os);
    return os.getBinBuffer();
};
tars.Condition.new = function () {
    return new tars.Condition();
};
tars.Condition.create = function (is) {
    return tars.Condition._readFrom(is);
};

tars.MonitorQueryReq = function() {
    this.uid = "";
    this.method = "query";
    this.dataid = "";
    this.date = "";
    this.tflag1 = "";
    this.tflag2 = "";
    this.conditions = new TarsStream.List(tars.Condition);
    this.indexs = new TarsStream.List(TarsStream.String);
    this.groupby = new TarsStream.List(TarsStream.String);
    this._classname = "tars.MonitorQueryReq";
};
tars.MonitorQueryReq._classname = "tars.MonitorQueryReq";
tars.MonitorQueryReq._write = function (os, tag, value) { os.writeStruct(tag, value); };
tars.MonitorQueryReq._read  = function (is, tag, def) { return is.readStruct(tag, true, def); };
tars.MonitorQueryReq._readFrom = function (is) {
    var tmp = new tars.MonitorQueryReq;
    tmp.uid = is.readString(0, true, "");
    tmp.method = is.readString(1, true, "query");
    tmp.dataid = is.readString(2, true, "");
    tmp.date = is.readString(3, true, "");
    tmp.tflag1 = is.readString(4, true, "");
    tmp.tflag2 = is.readString(5, true, "");
    tmp.conditions = is.readList(6, true, TarsStream.List(tars.Condition));
    tmp.indexs = is.readList(7, true, TarsStream.List(TarsStream.String));
    tmp.groupby = is.readList(8, true, TarsStream.List(TarsStream.String));
    return tmp;
};
tars.MonitorQueryReq.prototype._writeTo = function (os) {
    os.writeString(0, this.uid);
    os.writeString(1, this.method);
    os.writeString(2, this.dataid);
    os.writeString(3, this.date);
    os.writeString(4, this.tflag1);
    os.writeString(5, this.tflag2);
    os.writeList(6, this.conditions);
    os.writeList(7, this.indexs);
    os.writeList(8, this.groupby);
};
tars.MonitorQueryReq.prototype._equal = function () {
    assert.fail("this structure not define key operation");
};
tars.MonitorQueryReq.prototype._genKey = function () {
    if (!this._proto_struct_name_) {
        this._proto_struct_name_ = "STRUCT" + Math.random();
    }
    return this._proto_struct_name_;
};
tars.MonitorQueryReq.prototype.toObject = function() { 
    return {
        "uid" : this.uid,
        "method" : this.method,
        "dataid" : this.dataid,
        "date" : this.date,
        "tflag1" : this.tflag1,
        "tflag2" : this.tflag2,
        "conditions" : this.conditions.toObject(),
        "indexs" : this.indexs.toObject(),
        "groupby" : this.groupby.toObject()
    };
};
tars.MonitorQueryReq.prototype.readFromObject = function(json) { 
    _hasOwnProperty.call(json, "uid") && (this.uid = json.uid);
    _hasOwnProperty.call(json, "method") && (this.method = json.method);
    _hasOwnProperty.call(json, "dataid") && (this.dataid = json.dataid);
    _hasOwnProperty.call(json, "date") && (this.date = json.date);
    _hasOwnProperty.call(json, "tflag1") && (this.tflag1 = json.tflag1);
    _hasOwnProperty.call(json, "tflag2") && (this.tflag2 = json.tflag2);
    _hasOwnProperty.call(json, "conditions") && (this.conditions.readFromObject(json.conditions));
    _hasOwnProperty.call(json, "indexs") && (this.indexs.readFromObject(json.indexs));
    _hasOwnProperty.call(json, "groupby") && (this.groupby.readFromObject(json.groupby));
    return this;
};
tars.MonitorQueryReq.prototype.toBinBuffer = function () {
    var os = new TarsStream.TarsOutputStream();
    this._writeTo(os);
    return os.getBinBuffer();
};
tars.MonitorQueryReq.new = function () {
    return new tars.MonitorQueryReq();
};
tars.MonitorQueryReq.create = function (is) {
    return tars.MonitorQueryReq._readFrom(is);
};

tars.MonitorQueryRsp = function() {
    this.ret = 0;
    this.msg = "";
    this.lastTime = "";
    this.activeDb = 0;
    this.totalDb = 0;
    this.retThreads = new TarsStream.List(TarsStream.Int32);
    this.result = new TarsStream.Map(TarsStream.String, TarsStream.List(TarsStream.Double));
    this._classname = "tars.MonitorQueryRsp";
};
tars.MonitorQueryRsp._classname = "tars.MonitorQueryRsp";
tars.MonitorQueryRsp._write = function (os, tag, value) { os.writeStruct(tag, value); };
tars.MonitorQueryRsp._read  = function (is, tag, def) { return is.readStruct(tag, true, def); };
tars.MonitorQueryRsp._readFrom = function (is) {
    var tmp = new tars.MonitorQueryRsp;
    tmp.ret = is.readInt32(0, true, 0);
    tmp.msg = is.readString(1, false, "");
    tmp.lastTime = is.readString(2, true, "");
    tmp.activeDb = is.readInt32(3, true, 0);
    tmp.totalDb = is.readInt32(4, true, 0);
    tmp.retThreads = is.readList(5, true, TarsStream.List(TarsStream.Int32));
    tmp.result = is.readMap(6, false, TarsStream.Map(TarsStream.String, TarsStream.List(TarsStream.Double)));
    return tmp;
};
tars.MonitorQueryRsp.prototype._writeTo = function (os) {
    os.writeInt32(0, this.ret);
    os.writeString(1, this.msg);
    os.writeString(2, this.lastTime);
    os.writeInt32(3, this.activeDb);
    os.writeInt32(4, this.totalDb);
    os.writeList(5, this.retThreads);
    os.writeMap(6, this.result);
};
tars.MonitorQueryRsp.prototype._equal = function () {
    assert.fail("this structure not define key operation");
};
tars.MonitorQueryRsp.prototype._genKey = function () {
    if (!this._proto_struct_name_) {
        this._proto_struct_name_ = "STRUCT" + Math.random();
    }
    return this._proto_struct_name_;
};
tars.MonitorQueryRsp.prototype.toObject = function() { 
    return {
        "ret" : this.ret,
        "msg" : this.msg,
        "lastTime" : this.lastTime,
        "activeDb" : this.activeDb,
        "totalDb" : this.totalDb,
        "retThreads" : this.retThreads.toObject(),
        "result" : this.result.toObject()
    };
};
tars.MonitorQueryRsp.prototype.readFromObject = function(json) { 
    _hasOwnProperty.call(json, "ret") && (this.ret = json.ret);
    _hasOwnProperty.call(json, "msg") && (this.msg = json.msg);
    _hasOwnProperty.call(json, "lastTime") && (this.lastTime = json.lastTime);
    _hasOwnProperty.call(json, "activeDb") && (this.activeDb = json.activeDb);
    _hasOwnProperty.call(json, "totalDb") && (this.totalDb = json.totalDb);
    _hasOwnProperty.call(json, "retThreads") && (this.retThreads.readFromObject(json.retThreads));
    _hasOwnProperty.call(json, "result") && (this.result.readFromObject(json.result));
    return this;
};
tars.MonitorQueryRsp.prototype.toBinBuffer = function () {
    var os = new TarsStream.TarsOutputStream();
    this._writeTo(os);
    return os.getBinBuffer();
};
tars.MonitorQueryRsp.new = function () {
    return new tars.MonitorQueryRsp();
};
tars.MonitorQueryRsp.create = function (is) {
    return tars.MonitorQueryRsp._readFrom(is);
};

var __tars_MonitorQuery$query$IF = {
    "name" : "query",
    "return" : "int32",
    "arguments" : [{
        "name" : "req",
        "class" : "tars.MonitorQueryReq",
        "direction" : "in"
    }, {
        "name" : "rsp",
        "class" : "tars.MonitorQueryRsp",
        "direction" : "out"
    }]
};

var __tars_MonitorQuery$query$IE = function (req) {
    var os = new TarsStream.TarsOutputStream();
    os.writeStruct(1, req);
    return os.getBinBuffer();
};

var __tars_MonitorQuery$query$ID = function (data) {
    try {
        var is = new TarsStream.TarsInputStream(data.response.sBuffer);
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : is.readInt32(0, true, 0),
                "arguments" : {
                    "rsp" : is.readStruct(2, true, tars.MonitorQueryRsp)
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_MonitorQuery$query$PE = function (req, __$PROTOCOL$VERSION) {
    var tup = new TarsStream.UniAttribute();
    tup.tupVersion = __$PROTOCOL$VERSION;
    tup.writeStruct("req", req);
    return tup;
};

var __tars_MonitorQuery$query$PD = function (data) {
    try {
        var tup = data.response.tup;
        return {
            "request" : data.request,
            "response" : {
                "costtime" : data.request.costtime,
                "return" : tup.readInt32("", 0),
                "arguments" : {
                    "rsp" : tup.readStruct("rsp", tars.MonitorQueryRsp)
                }
            }
        };
    } catch (e) {
        throw _makeError(data, e.message, TarsError.CLIENT.DECODE_ERROR);
    }
};

var __tars_MonitorQuery$query$ER = function (data) {
    throw _makeError(data, "Call MonitorQuery::query failed");
};

tars.MonitorQueryProxy.prototype.query = function (req) {
    var version = this._worker.version;
    if (version === TarsStream.Tup.TUP_SIMPLE || version === TarsStream.Tup.TUP_COMPLEX) {
        return this._worker.tup_invoke("query", __tars_MonitorQuery$query$PE(req, version), arguments[arguments.length - 1], __tars_MonitorQuery$query$IF).then(__tars_MonitorQuery$query$PD, __tars_MonitorQuery$query$ER);
    } else {
        return this._worker.tars_invoke("query", __tars_MonitorQuery$query$IE(req), arguments[arguments.length - 1], __tars_MonitorQuery$query$IF).then(__tars_MonitorQuery$query$ID, __tars_MonitorQuery$query$ER);
    }
};
tars.MonitorQueryProxy.query = __tars_MonitorQuery$query$IF;



