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

import Vue from 'vue';
import letUI from 'let-ui';
import 'let-ui/lib/lib.min.css';
import VueCookie from 'vue-cookie';

import '@/assets/css/let-ui.css';
import Icon from '@/components/icon';
import TarsFormItem from '@/components/tars-form-item';
import cn from "let-ui/lib/locale/lang/zh-CN.min";
import en from "let-ui/lib/locale/lang/en-US.min";

Vue.use(letUI, {locale: {en, cn}[VueCookie.get('locale') || 'cn'] || cn});
Vue.component(Icon.name, Icon);
Vue.component(TarsFormItem.name, TarsFormItem);

/* eslint-disable no-underscore-dangle */
const LetUILoading = Vue.prototype.$Loading;

function Loading(el) {
  this.el = el;
  this.loading = null;
}

Loading.prototype.show = function show(selector, options) {
  if (typeof selector === 'object') {
    options = selector;
    selector = null;
  }
  if (this.loading) {
    this.hide();
  }
  const el = this.el;
  const loading = LetUILoading({
    fullScreen: !el,
    target: el && selector ? el.querySelector(selector) : el,
    boxClass: 'loading-inner',
    background: 'rgba(0,0,0,0)',
    color: '#fff',
    size: 24,
    ...options,
  });
  loading.show();
  this.loading = loading;
  return this;
};

Loading.prototype.hide = function hide() {
  if (this.loading) {
    this.loading.hide();
    this.loading = null;
  }
  return this;
};

Loading.show = function show(...args) {
  if (!Loading._loading) {
    Loading._loading = new Loading();
  }
  return Loading._loading.show(...args);
};

Loading.hide = function hide() {
  if (!Loading._loading) {
    Loading._loading = new Loading();
  }
  return Loading._loading.hide();
};

LetUILoading.show = Loading.show;
LetUILoading.hide = Loading.hide;
Object.defineProperty(Vue.prototype, '$loading', {
  get() {
    if (!this._loading) {
      this._loading = new Loading(this.$el);
    }
    return this._loading;
  },
});

Object.defineProperty(Vue.prototype, '$tip', {
  get() {
    return this.$Notice;
  },
});
