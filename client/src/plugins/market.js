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

import 'whatwg-fetch';
import Vue from 'vue';

import AjaxUtil from '@/lib/ajax';

let Ajax = new AjaxUtil();

if (process.env.NODE_ENV != "development") {
  Ajax.ServerUrl.set('http://api.k.tarsyun.com/json');
} else {
  Ajax.ServerUrl.set('http://api.dev.tarsyun.com/json');
}

Ajax.ResultHandler.set((result) => {
  if (result && result.tars_ret === 0) {
    return true;
  }
  return false;
});

Ajax.call = function (obj, func, params) {
  Ajax.Headers.set("X-Token", window.localStorage.ticket || '');

  return Ajax.postJSON(`/${obj}/${func}`, params);
}

Object.defineProperty(Vue.prototype, '$market', {
  get() {
    return Ajax;
  },
});

export default Ajax