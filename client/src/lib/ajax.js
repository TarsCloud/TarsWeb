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

const isString = str => typeof str === 'string';
const isArray = Array.isArray;
const isObject = obj => typeof obj === 'object' && obj !== null;
const isFunction = obj => typeof obj === 'function';
const assign = Object.assign;

/* eslint-disable no-param-reassign */

/**
 * encode 字符串
 * @param {String} value 需要转码的字符串
 * @return {String} 转码结果
 */
function encode(value) {
  return String(value)
  // .replace(/[^ !'()~*]/g, encodeURIComponent)
    .replace(/[^!'()~*\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug, encodeURIComponent)
    .replace(/ /g, '+')
    .replace(/[!'()~*]/g, ch => `%${ch.charCodeAt().toString(16).slice(-2).toUpperCase()}`); // eslint-disable-line max-len, newline-per-chained-call
}

/**
 * 将请求对象换成字符串
 * @param {Object} obj 请求对象
 * @return {String} 请求字符串
 */
function encodeObj(obj) {
  if (!obj) {
    return '';
  }

  const params = [];

  Object.keys(obj).forEach((key) => {
    let value = obj[key];

    if (value === null || value === undefined) {
      value = '';
    }

    params.push(`${encode(key)}=${encode(value)}`);
  });

  return params.join('&').replace(/%20/g, '+');
}

/**
 * 将请求对象换成 "x-www-form-urlencoded" 类型字符串
 * @param {Object} obj 请求对象
 * @return {String} 请求字符串
 */
function encodeForm(obj) {
  const flatten = (newObj, key, value) => {
    if (isArray(value) || isObject(value)) {
      Object.keys(value).forEach((k) => {
        flatten(newObj, `${key}[${k}]`, value[k]);
      });
      return newObj;
    }

    newObj[key] = value;
    return newObj;
  };

  return encodeObj(Object.keys(obj).reduce((newObj, key) => flatten(newObj, key, obj[key]), {}));
}

class ObjectUtil {
  constructor(defaults) {
    this.defaults = defaults;
  }

  get(obj) {
    return assign({}, this.defaults, obj);
  }

  set(key, value) {
    if (!key) {
      return;
    }

    if (isString(key)) {
      const keys = key.split('.');
      keys.reduce((obj, k, i) => {
        if (i === keys.length - 1) {
          obj[k] = value;
        }
        return obj[k];
      }, this.defaults);
    }

    if (isObject(key)) {
      Object.keys(key).forEach((k) => {
        this.set(k, key[k]);
      });
    }

    if (isArray(key)) {
      key.forEach(k => this.set(k, value));
    }
  }

  remove(key) {
    if (!key) {
      return;
    }

    if (isString(key)) {
      const keys = key.split('.');
      keys.reduce((obj, k, i) => {
        if (i === keys.length - 1) {
          delete obj[k];
        }
        return obj[k];
      }, this.defaults);
    }

    if (isArray(key)) {
      key.forEach(k => this.remove(k));
    }
  }
}

class FunctionUtil {
  constructor(handler) {
    this.handler = handler;
  }

  set(handler) {
    if (isFunction(handler)) {
      this.handler = handler;
    }
  }

  exec() {
    if (isFunction(this.handler)) {
      this.handler.apply(null, arguments); // eslint-disable-line prefer-rest-params
    }
  }
}

class StringUtil {
  constructor(base) {
    this.base = base || '';
  }

  set(base) {
    if (isString(base)) {
      this.base = base;
    }
  }

  get(str) {
    return this.base + (str || '');
  }
}

// 服务器地址
const ServerUrl = new StringUtil();

// 全局 fetch 配置
const Options = new ObjectUtil({
  credentials: 'same-origin',
  timeout: 5000,
});

// 全局请求头
const Headers = new ObjectUtil({
  'X-Requested-With': 'XMLHttpRequest',
});

// 全局请求参数
const Body = new ObjectUtil({});

// 全局状态处理方法
const StatusHandler = new FunctionUtil();

// 全局结果处理方法
const ResultHandler = new FunctionUtil(() => true);

/**
 * 将请求 url 与 params 转换成带 queryString 的 url
 * @param {String} url 基本 url
 * @param {Object} params 请求参数
 * @return {String} 请求字符串
 */
function parseUrl(url, params) {
  let queryString = encodeObj(Body.get(params));

  if (queryString) {
    if (url.indexOf('?') === -1) {
      queryString = `?${queryString}`;
    } else {
      queryString = `&${queryString}`;
    }
  }

  return url + queryString;
}

/**
 * 检查请求的返回状态码
 * @param {Object} response 服务器响应结果
 * @return {Object} 正常的响应结果
 */
function checkStatus(response) {
  const status = response.status;

  if ((status >= 200 && status < 300) || status === 304) {
    return response;
  }

  StatusHandler.exec(status, response);
  throw new Error(response.statusText);
}

/**
 * 将服务器相应结果转换为json
 * @param {Object} response 服务器响应结果
 * @return {Promise} JSON数据
 */
function parseJSON(response) {
  return response.json().then(null, (ex) => { // 转换JSON失败
    StatusHandler.exec(500, response);
    return Promise.reject(ex);
  });
}

/**
 * 请求成功回调函数
 * @param {Object} result 服务器返回结果
 * @return {Object|Promise} 正常的数据 或者 失败的Promise
 */
function successCallback(result) {
  if (ResultHandler.handler(result)) {
    return result;
  }

  return Promise.reject(result);
}
/**
 * 请求失败回调函数
 * @param {Object} ex 失败信息
 * @return {Promise} 失败的Promise
 */
function errorCallback(ex) {
  return Promise.reject(ex);
}

/**
 * Get请求
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function get(url, params) {
  const options = Options.get({
    headers: Headers.get(),
  });

  return fetch(ServerUrl.get(parseUrl(url, params)), options)
    .then(checkStatus)
    .then(parseJSON)
    .catch(errorCallback);
}

/**
 * Get请求（返回JSON）
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function getJSON(url, params) {
  const options = Options.get({
    headers: Headers.get(),
  });

  return fetch(ServerUrl.get(parseUrl(url, params)), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * Post请求
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function post(url, params) {
  const options = Options.get({
    method: 'POST',
    headers: Headers.get({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: encodeForm(Body.get(params)),
  });

  return fetch(ServerUrl.get(url), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * Post请求（发送formdata）
 * @param {String} url 路径
 * @param {FormData} formdata 参数
 * @return {Promise} 请求Promise
 */
function postForm(url, formdata) {
  const options = Options.get({
    method: 'POST',
    headers: Headers.get(),
    body: formdata,
  });

  const data = Body.get({});

  Object.keys(data).forEach((d) => {
    formdata.append(d, data[d]);
  });

  return fetch(ServerUrl.get(url), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * Post请求（发送json）
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function postJSON(url, params) {
  const options = Options.get({
    method: 'POST',
    headers: Headers.get({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(Body.get(params)),
  });

  return fetch(ServerUrl.get(url), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * Put请求
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function put(url, params) {
  const options = Options.get({
    method: 'PUT',
    headers: Headers.get({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: encodeForm(Body.get(params)),
  });

  return fetch(ServerUrl.get(url), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * Delete请求
 * @param {String} url 路径
 * @param {Object} params 参数
 * @return {Promise} 请求Promise
 */
function remove(url, params) {
  const options = Options.get({
    method: 'DELETE',
    headers: Headers.get(),
  });

  return fetch(ServerUrl.get(parseUrl(url, params)), options)
    .then(checkStatus)
    .then(parseJSON)
    .then(successCallback)
    .catch(errorCallback);
}

/**
 * 导出文件
 * @param {String} url 路径
 * @param {Object} params 参数
 */
function download(url, params) {
  window.open(ServerUrl.get(parseUrl(url, params)));
}

export default {
  ServerUrl,
  Options,
  Headers,
  Body,
  StatusHandler,
  ResultHandler,

  get,
  getJSON,
  post,
  postForm,
  postJSON,
  put,
  remove,
  download,
};
