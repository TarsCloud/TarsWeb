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
import './assets/icon-font/iconfont.css'
import store from "../store/store"
import './plugins/ajax';
import './plugins/market';

import k8sApp from './k8sApp';
import router from './router/k8s';

import {
  i18n,
  loadLang
} from './locale/i18n'

import ElementUI from 'element-ui';

import "./assets/theme/element-to-let/index.css"

import './plugins/ui';


import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(() => {
  Vue.use(Viewer);

  Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value)
  });

  new Vue({
    i18n: i18n,
    el: '#app',
    router,
    store,
    components: {
      k8sApp
    },
    template: '<k8sApp/>'
  });
})